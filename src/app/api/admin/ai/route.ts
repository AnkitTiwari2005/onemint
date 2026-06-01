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

const GEMINI_MODEL    = 'gemini-2.0-flash-lite';   // 30 RPM free tier (2× vs flash)
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

/** Parse Gemini error JSON to extract a human-readable reason. */
function geminiErrorReason(errText: string): string {
  try {
    const json = JSON.parse(errText);
    const msg    = json?.error?.message ?? json?.message ?? '';
    const status = json?.error?.status  ?? '';
    if (msg) return `${status ? status + ': ' : ''}${msg}`.slice(0, 300);
  } catch { /* not JSON */ }
  return errText.slice(0, 300);
}

/**
 * Call Gemini with backoff retry on 429.
 * Respects Gemini's Retry-After header when present.
 * Returns { response, lastErrText } — caller handles non-ok status.
 */
async function callGeminiWithRetry(
  apiKey: string,
  prompt: string,
): Promise<{ response: Response; lastErrText: string }> {
  const maxAttempts = 3;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let response: Response;
    try {
      response = await callGemini(apiKey, prompt);
    } catch (fetchErr) {
      const isTimeout = fetchErr instanceof Error && fetchErr.name === 'AbortError';
      throw Object.assign(
        new Error(isTimeout ? 'timeout' : 'network'),
        { kind: isTimeout ? 'timeout' : 'network' },
      );
    }

    if (response.status !== 429) return { response, lastErrText: '' };

    const errText = await response.text();

    // Last attempt — return so caller can surface the real Gemini error
    if (attempt === maxAttempts - 1) return { response, lastErrText: errText };

    // Use Gemini's Retry-After header if present, else 5 s / 10 s backoff
    const retryAfterSec = Number(
      response.headers.get('retry-after') ??
      response.headers.get('x-ratelimit-reset-requests') ??
      0,
    );
    const waitMs = retryAfterSec > 0 ? retryAfterSec * 1000 : (attempt + 1) * 5000;

    console.log(
      `[AI FAQ] 429 (${geminiErrorReason(errText)}) — waiting ${waitMs / 1000}s before retry ${attempt + 2}/${maxAttempts}`,
    );
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

    // ── Call Gemini (auto-retries on 429 up to 3 attempts) ─────────────────
    let response: Response;
    let lastErrText = '';
    try {
      ({ response, lastErrText } = await callGeminiWithRetry(apiKey, prompt));
    } catch (fetchErr: unknown) {
      const kind = (fetchErr as { kind?: string }).kind;
      return NextResponse.json(
        { error: kind === 'timeout' ? 'AI request timed out — try again.' : 'Could not reach AI service.' },
        { status: 504 }
      );
    }

    if (!response.ok) {
      // 429: body already consumed inside callGeminiWithRetry — use lastErrText
      if (response.status === 429) {
        const reason = lastErrText ? geminiErrorReason(lastErrText) : '';
        console.error('[AI FAQ] Gemini 429 after retries:', reason);

        // Billing quota exhausted — no retry will help
        const isBillingQuota = reason.toLowerCase().includes('plan') ||
                               reason.toLowerCase().includes('billing') ||
                               reason.toLowerCase().includes('exceeded your current quota');

        const userMsg = isBillingQuota
          ? 'Free Gemini quota exhausted for today. Fix: (1) Wait until 12:30 AM IST for daily reset, or (2) Enable billing at aistudio.google.com for unlimited usage (costs ~₹0.003 per generation).'
          : `Gemini is throttling requests. Wait 60 seconds and try again. (${reason || 'quota exceeded'})`;

        return NextResponse.json({ error: userMsg }, { status: 429 });
      }

      const errText = await response.text();
      console.error('[AI FAQ] Gemini error:', response.status, errText);

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
