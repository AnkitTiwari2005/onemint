import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge runtime — no 10-second serverless timeout on Vercel.
 * This allows the OpenRouter call to complete even on slower connections.
 */
export const runtime = 'edge';

/**
 * POST /api/admin/ai
 * Accepts: { content: string, title: string }
 * Returns: { faqs: Array<{ question: string; answer: string }> }
 *
 * Uses OpenRouter → google/gemini-2.0-flash-001
 * (non-thinking model, confirmed fast + working, ~2-3s response time).
 * The API key is server-only — never exposed to the browser.
 * Protected by HMAC session middleware on /api/admin/*.
 */
export async function POST(req: NextRequest) {
  try {
    const { content, title } = await req.json();

    if (!content?.trim() || !title?.trim()) {
      return NextResponse.json(
        { error: 'content and title are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured — add OPENROUTER_API_KEY to Vercel env vars' },
        { status: 503 }
      );
    }

    // 1500 chars is enough context and keeps the model response fast
    const truncated = content.slice(0, 1500);

    const prompt =
      `You are an SEO content strategist. Read the article below and produce exactly 4 FAQ entries.\n` +
      `Rules:\n` +
      `- Derive questions from the actual article content\n` +
      `- Answers must be 2-3 plain sentences (no markdown, no bullet points)\n` +
      `- Target questions real readers search for on Google\n\n` +
      `Article title: "${title.trim()}"\n\n` +
      `Article content:\n${truncated}\n\n` +
      `Reply with ONLY a JSON array — no explanation, no markdown fences:\n` +
      `[{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."}]`;

    // 9-second hard timeout — returns a clear error before Vercel can kill the function
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);

    let response: Response;
    try {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://www.onemint.in',
          'X-Title': 'OneMint Admin — FAQ Generator',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 600,
        }),
      });
    } catch (fetchErr) {
      const isTimeout = fetchErr instanceof Error && fetchErr.name === 'AbortError';
      return NextResponse.json(
        { error: isTimeout ? 'AI request timed out — try again.' : 'Could not reach AI service.' },
        { status: 504 }
      );
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('[AI FAQ] OpenRouter error:', response.status, errText);
      return NextResponse.json(
        { error: `AI service error (${response.status}). Try again.` },
        { status: 502 }
      );
    }

    const result = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = result.choices?.[0]?.message?.content ?? '';

    if (!raw.trim()) {
      return NextResponse.json(
        { error: 'AI returned an empty response. Try regenerating.' },
        { status: 422 }
      );
    }

    // Strip markdown code fences if the model wraps its output
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
        answer: String(f.answer).trim(),
      }));

    return NextResponse.json({ faqs: validated });

  } catch (err) {
    console.error('[AI FAQ] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
