import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge runtime — no 10-second serverless timeout.
 */
export const runtime = 'edge';

/**
 * POST /api/admin/ai
 * Body:   { content: string; title: string; category?: string; tags?: string[] }
 * Returns:{ faqs: Array<{ question: string; answer: string }> }
 *
 * Uses Google Gemini API (gemini-2.0-flash — free tier, fast, reliable).
 * Falls back to gemini-1.5-flash if the primary model is unavailable.
 * Protected by HMAC session middleware on /api/admin/*.
 */

const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

async function callGemini(
  apiKey: string,
  model: string,
  prompt: string,
  signal: AbortSignal,
): Promise<Response> {
  return fetch(
    `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature:     0.2,
          maxOutputTokens: 900,
          responseMimeType: 'application/json',
        },
      }),
    },
  );
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
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured — add GEMINI_API_KEY to env vars' },
        { status: 503 },
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

Return ONLY a valid JSON object with a "faqs" array — no explanation:
{"faqs": [{"question":"...","answer":"..."},{"question":"...","answer":"..."}]}`;

    // Global 22-second timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 22_000);

    let lastStatus = 0;
    let lastBody   = '';

    try {
      for (const model of GEMINI_MODELS) {
        if (controller.signal.aborted) break;

        let res: Response;
        try {
          res = await callGemini(apiKey, model, prompt, controller.signal);
        } catch (err) {
          const isAbort = err instanceof Error && err.name === 'AbortError';
          console.error(`[AI FAQ] ${model} — ${isAbort ? 'timeout' : 'network error'}`);
          if (isAbort) {
            return NextResponse.json(
              { error: 'AI request timed out — try again.' },
              { status: 504 },
            );
          }
          continue; // try next model
        }

        lastStatus = res.status;

        // 404 / 429 / 5xx — try next model or surface error
        if (res.status === 404) {
          console.warn(`[AI FAQ] ${model} not found — trying next model`);
          continue;
        }
        if (res.status === 429) {
          lastBody = await res.text();
          console.warn(`[AI FAQ] ${model} rate-limited — trying next model`);
          continue;
        }
        if (!res.ok) {
          lastBody = await res.text();
          console.error(`[AI FAQ] ${model} error ${res.status}:`, lastBody.slice(0, 200));
          continue;
        }

        // ── Parse Gemini response ──────────────────────────────────────────
        const json = await res.json() as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
        };

        const raw = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

        if (!raw.trim()) {
          return NextResponse.json(
            { error: 'AI returned an empty response. Try regenerating.' },
            { status: 422 },
          );
        }

        // Strip markdown fences if the model adds them despite instructions
        const cleaned = (() => {
          const stripped = raw.replace(/```(?:json)?/gi, '').replace(/```/g, '');
          const start = stripped.indexOf('{');
          const end   = stripped.lastIndexOf('}');
          if (start !== -1 && end > start) return stripped.slice(start, end + 1);
          return stripped.trim();
        })();

        let parsed: { faqs?: { question: string; answer: string }[] };
        try {
          parsed = JSON.parse(cleaned);
        } catch {
          console.error('[AI FAQ] JSON parse failed. Raw:', raw.slice(0, 400));
          return NextResponse.json(
            { error: 'AI returned unexpected format. Try again — this usually works on the second attempt.' },
            { status: 422 },
          );
        }

        const faqs = parsed.faqs;
        if (!Array.isArray(faqs) || faqs.length === 0) {
          return NextResponse.json(
            { error: 'AI returned empty FAQ list. Try regenerating.' },
            { status: 422 },
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
      }
    } finally {
      clearTimeout(timer);
    }

    // All models failed
    if (lastStatus === 429) {
      return NextResponse.json(
        { error: 'AI rate limit hit — wait 60 seconds and try again.' },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: `AI service error (${lastStatus || 'unknown'}). Try again.` },
      { status: 502 },
    );

  } catch (err) {
    console.error('[AI FAQ] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
