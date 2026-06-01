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
 * Calls Google Gemini 2.0 Flash with automatic retry on 429.
 * Protected by HMAC session middleware on /api/admin/*.
 */

const GEMINI_MODEL    = 'gemini-2.0-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/** Sleep for `ms` milliseconds (works in Edge runtime). */
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Call Gemini once. Returns the raw Response object — caller handles status.
 * Throws only on network/timeout errors.
 */
async function callGemini(apiKey: string, prompt: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    return await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method:  'POST',
      signal:  controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature:      0.2,  // more factual, less hallucination
          maxOutputTokens:  512,  // 4 FAQ pairs never exceed 512 tokens
          responseMimeType: 'application/json',
        },
      }),
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Call Gemini with exponential backoff retry on 429.
 * Attempts: 1st immediately, then +3 s, +6 s, +12 s (4 total).
 * Returns the successful Response, or throws a typed error.
 */
async function callGeminiWithRetry(apiKey: string, prompt: string): Promise<Response> {
  const delays = [0, 3000, 6000, 12000];          // ms before each attempt

  for (let attempt = 0; attempt < delays.length; attempt++) {
    if (delays[attempt] > 0) {
      console.log(`[AI FAQ] 429 received — retrying in ${delays[attempt] / 1000}s (attempt ${attempt + 1}/${delays.length})`);
      await sleep(delays[attempt]);
    }

    let response: Response;
    try {
      response = await callGemini(apiKey, prompt);
    } catch (fetchErr) {
      const isTimeout = fetchErr instanceof Error && fetchErr.name === 'AbortError';
      throw Object.assign(new Error(isTimeout ? 'timeout' : 'network'), { kind: isTimeout ? 'timeout' : 'network' });
    }

    // Retry only on 429; all other statuses (success or hard errors) break out
    if (response.status !== 429) return response;

    // On the last attempt, still return the 429 so the caller can surface it
    if (attempt === delays.length - 1) return response;
  }

  // Unreachable but TypeScript needs it
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

    const apiKey = ENV.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured — add GEMINI_API_KEY to Vercel env vars' },
        { status: 503 }
      );
    }

    // Send only title + category/tags + first 500 chars (intro/lede)
    // This keeps total input under ~400 tokens — well within free-tier quota
    const intro = content.slice(0, 500);
    const meta = [
      category     ? `Category: ${category}`    : '',
      tags?.length ? `Tags: ${tags.join(', ')}` : '',
    ].filter(Boolean).join('\n');

    const prompt =
`SEO FAQ generator for Indian personal finance / health / tech content.
Write exactly 4 FAQ entries for a Google FAQ rich snippet.
Rules: questions start with What/How/Why/Is/Does/Can/When/Are/Which/How much/What are; each targets a different angle; answers are 2-3 plain-prose sentences; no generic questions; high search-volume intent.

Title: "${title.trim()}"${meta ? '\n' + meta : ''}${intro ? '\n\nArticle intro:\n' + intro : ''}

Return ONLY a JSON array, no markdown, no explanation:
[{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."}]`;

    // ── Call Gemini (auto-retries on 429 up to 4 attempts) ─────────────────
    let response: Response;
    try {
      response = await callGeminiWithRetry(apiKey, prompt);
    } catch (fetchErr: unknown) {
      const kind = (fetchErr as { kind?: string }).kind;
      return NextResponse.json(
        { error: kind === 'timeout' ? 'AI request timed out — try again.' : 'Could not reach AI service.' },
        { status: 504 }
      );
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('[AI FAQ] Gemini hard error after retries:', response.status, errText);

      if (response.status === 429) {
        return NextResponse.json(
          { error: 'AI quota exhausted — still throttled after 4 attempts (~21 s). Wait a minute and try again, or use a shorter article.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: `AI service error (${response.status}). Try again.` },
        { status: 502 }
      );
    }

    // ── Parse response ──────────────────────────────────────────────────────
    const result = await response.json() as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const raw = result.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!raw.trim()) {
      return NextResponse.json(
        { error: 'AI returned an empty response. Try regenerating.' },
        { status: 422 }
      );
    }

    // Strip markdown fences if present despite responseMimeType hint
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
