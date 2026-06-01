import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/env';

/**
 * Edge runtime — no 10-second serverless timeout on Vercel.
 */
export const runtime = 'edge';

/**
 * POST /api/admin/ai
 * Body:   { content: string; title: string; category?: string; tags?: string[] }
 * Returns:{ faqs: Array<{ question: string; answer: string }> }
 *
 * Uses NVIDIA NIM (build.nvidia.com) — OpenAI-compatible API.
 * Model: meta/llama-3.3-70b-instruct — smart, fast, near-unlimited free tier.
 * Protected by HMAC session middleware on /api/admin/*.
 */

const NVIDIA_MODEL    = 'meta/llama-3.1-70b-instruct';
const NVIDIA_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';

/** Sleep for `ms` ms — works in Edge runtime. */
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Single call to NVIDIA NIM.
 * Returns raw Response — caller handles status codes.
 */
async function callNvidia(apiKey: string, prompt: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    return await fetch(NVIDIA_ENDPOINT, {
      method:  'POST',
      signal:  controller.signal,
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       NVIDIA_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens:  1024,
        stream:      false,
      }),
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Call NVIDIA NIM with retry on 429 (rate limit).
 * Attempts: immediately, +5 s, +10 s (3 total).
 */
async function callNvidiaWithRetry(
  apiKey: string,
  prompt: string,
): Promise<{ response: Response; lastErrText: string }> {
  const maxAttempts = 3;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let response: Response;
    try {
      response = await callNvidia(apiKey, prompt);
    } catch (fetchErr) {
      const isTimeout = fetchErr instanceof Error && fetchErr.name === 'AbortError';
      throw Object.assign(
        new Error(isTimeout ? 'timeout' : 'network'),
        { kind: isTimeout ? 'timeout' : 'network' },
      );
    }

    if (response.status !== 429) return { response, lastErrText: '' };

    const errText = await response.text();

    // Last attempt — return so caller surfaces the error
    if (attempt === maxAttempts - 1) return { response, lastErrText: errText };

    // Use Retry-After header if present, else 5 s / 10 s backoff
    const retryAfterSec = Number(response.headers.get('retry-after') ?? 0);
    const waitMs = retryAfterSec > 0 ? retryAfterSec * 1000 : (attempt + 1) * 5000;

    console.log(`[AI FAQ] NVIDIA 429 — waiting ${waitMs / 1000}s before retry ${attempt + 2}/${maxAttempts}`);
    await sleep(waitMs);
  }

  throw new Error('retry loop exhausted');
}

export async function POST(req: NextRequest) {
  try {
    const { content, title, category, tags } = await req.json() as {
      content:   string;
      title:     string;
      category?: string;
      tags?:     string[];
    };

    if (!content?.trim() || !title?.trim()) {
      return NextResponse.json(
        { error: 'content and title are required' },
        { status: 400 }
      );
    }

    const apiKey = ENV.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured — add NVIDIA_API_KEY to Vercel env vars (get it free at build.nvidia.com)' },
        { status: 503 }
      );
    }

    // Title + category/tags + first 3000 chars of article (~750 words)
    const intro = content.slice(0, 3000);
    const meta = [
      category     ? `Category: ${category}`    : '',
      tags?.length ? `Tags: ${tags.join(', ')}` : '',
    ].filter(Boolean).join('\n');

    const prompt =
`You are an SEO expert writing FAQ schema for an Indian personal finance / health / tech article.
Write exactly 4 FAQ entries for a Google FAQ rich snippet.
Rules:
- Questions must start with: What, How, Why, Is, Does, Can, When, Are, Which, How much, What are
- Each question targets a DIFFERENT angle — no rephrasing
- Answers: 2-3 plain prose sentences, no bullet points, no markdown
- Questions must reflect what an Indian reader would type into Google
- No generic questions like "What is this article about?"

Article details:
Title: "${title.trim()}"${meta ? '\n' + meta : ''}${intro ? '\n\nArticle intro:\n' + intro : ''}

Return ONLY a valid JSON array — no explanation, no markdown fences:
[{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."}]`;

    // ── Call NVIDIA NIM (auto-retries on 429 up to 3 attempts) ─────────────
    let response: Response;
    let lastErrText = '';
    try {
      ({ response, lastErrText } = await callNvidiaWithRetry(apiKey, prompt));
    } catch (fetchErr: unknown) {
      const kind = (fetchErr as { kind?: string }).kind;
      return NextResponse.json(
        { error: kind === 'timeout' ? 'AI request timed out — try again.' : 'Could not reach AI service.' },
        { status: 504 }
      );
    }

    if (!response.ok) {
      if (response.status === 429) {
        console.error('[AI FAQ] NVIDIA 429 after retries:', lastErrText.slice(0, 200));
        return NextResponse.json(
          { error: 'NVIDIA rate limit hit — wait 60 seconds and try again.' },
          { status: 429 }
        );
      }

      const errText = await response.text();
      console.error('[AI FAQ] NVIDIA error:', response.status, errText.slice(0, 300));
      return NextResponse.json(
        { error: `AI service error (${response.status}). Try again.` },
        { status: 502 }
      );
    }

    // ── Parse OpenAI-compatible response ───────────────────────────────────
    const result = await response.json() as {
      choices?: Array<{
        message?: { content?: string };
      }>;
    };

    const raw = result.choices?.[0]?.message?.content ?? '';

    if (!raw.trim()) {
      return NextResponse.json(
        { error: 'AI returned an empty response. Try regenerating.' },
        { status: 422 }
      );
    }

    // Strip markdown fences if the model adds them despite instructions
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();

    let faqs: { question: string; answer: string }[];
    try {
      faqs = JSON.parse(cleaned);
    } catch {
      console.error('[AI FAQ] JSON parse failed. Raw:', raw.slice(0, 300));
      return NextResponse.json(
        { error: 'AI returned unexpected format. Try regenerating.' },
        { status: 422 }
      );
    }

    if (!Array.isArray(faqs) || faqs.length === 0) {
      return NextResponse.json(
        { error: 'AI returned empty FAQ list. Try regenerating.' },
        { status: 422 }
      );
    }

    const validated = faqs
      .filter((f) => f?.question && f?.answer)
      .slice(0, 5)
      .map((f) => ({
        question: String(f.question).trim(),
        answer:   String(f.answer).trim(),
      }));

    return NextResponse.json({ faqs: validated });

  } catch (err) {
    console.error('[AI FAQ] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
