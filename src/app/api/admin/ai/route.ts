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

// Primary: Llama 3.1 8B — extremely fast and reliable, perfect for simple JSON tasks.
// Fallback 1: Llama 3.3 70B
// Fallback 2: Llama 4 Maverick (deprecated July 27, 2026).
const NVIDIA_MODELS   = [
  'meta/llama-3.1-8b-instruct',
  'meta/llama-3.3-70b-instruct',
  'meta/llama-4-maverick-17b-128e-instruct',
];
const NVIDIA_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';

/** Sleep for `ms` ms — works in Edge runtime. */
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Single call to NVIDIA NIM with a specific model.
 */
async function callNvidia(apiKey: string, model: string, prompt: string, globalSignal: AbortSignal): Promise<Response> {
  return await fetch(NVIDIA_ENDPOINT, {
    method:  'POST',
    signal:  globalSignal,
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      top_p:       1.0,
      max_tokens:  800,
      frequency_penalty: 0.0,
      presence_penalty:  0.0,
      stream:      false,
    }),
  });
}

/**
 * Call NVIDIA NIM with model fallback + retry on 429.
 */
async function callNvidiaWithRetry(
  apiKey: string,
  prompt: string,
): Promise<{ response: Response; lastErrText: string }> {
  // Global 22-second timeout to strictly respect Vercel Edge 25s limit
  const globalController = new AbortController();
  const globalTimer = setTimeout(() => globalController.abort(), 22000);

  try {
    for (const model of NVIDIA_MODELS) {
      if (globalController.signal.aborted) break;

      console.log(`[AI FAQ] Trying model: ${model}`);
      const maxAttempts = 2; // Reduce to 2 to save time

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (globalController.signal.aborted) break;

        let response: Response;
        try {
          response = await callNvidia(apiKey, model, prompt, globalController.signal);
        } catch (fetchErr) {
          const isTimeout = fetchErr instanceof Error && fetchErr.name === 'AbortError';
          console.error(`[AI FAQ] ${model} — ${isTimeout ? 'global timeout reached' : 'network error'}`);
          if (isTimeout) throw fetchErr; // Stop completely if global timeout hit
          break; // Try next model on random network error
        }

        // 404 or 422 = model unavailable/invalid — try next model
        if (response.status === 404 || response.status === 422) {
          console.warn(`[AI FAQ] ${model} returned ${response.status} — trying next model`);
          break; // break inner loop, try next model
        }

        // Success or non-retryable error
        if (response.status !== 429) return { response, lastErrText: '' };

        // 429 = rate limited — retry with backoff
        const errText = await response.text();
        if (attempt === maxAttempts - 1) return { response, lastErrText: errText };

        const retryAfterSec = Number(response.headers.get('retry-after') ?? 0);
        const waitMs = retryAfterSec > 0 ? retryAfterSec * 1000 : (attempt + 1) * 3000;
        
        // Don't wait if it pushes us over the global timeout
        if (globalController.signal.aborted) break;
        console.log(`[AI FAQ] ${model} 429 — waiting ${waitMs / 1000}s`);
        await sleep(waitMs);
      }
    }
  } finally {
    clearTimeout(globalTimer);
  }

  throw Object.assign(new Error('all models failed or timed out'), { kind: 'timeout' });
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
    // Then extract just the [...] array from wherever it appears —
    // Llama sometimes adds preamble text like "Here are 4 FAQs:\n\n[...]"
    const cleaned = (() => {
      // Remove all markdown code fences first
      const stripped = raw
        .replace(/```(?:json)?/gi, '')
        .replace(/```/g, '');
      // Find the outermost JSON array
      const start = stripped.indexOf('[');
      const end   = stripped.lastIndexOf(']');
      if (start !== -1 && end > start) return stripped.slice(start, end + 1);
      // Fallback: return stripped text as-is and let JSON.parse report the error
      return stripped.trim();
    })();

    let faqs: { question: string; answer: string }[];
    try {
      faqs = JSON.parse(cleaned);
    } catch {
      console.error('[AI FAQ] JSON parse failed. Raw output:', raw.slice(0, 400));
      return NextResponse.json(
        { error: 'AI returned unexpected format. Please try again — this usually works on the second attempt.' },
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
