import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/env';

/**
 * Edge runtime — no 10-second serverless timeout on Vercel.
 */
export const runtime = 'edge';

/**
 * POST /api/admin/ai
 * Body:   { content: string, title: string }
 * Returns:{ faqs: Array<{ question: string; answer: string }> }
 *
 * Calls Google Gemini API directly (gemini-2.5-flash).
 * Protected by HMAC session middleware on /api/admin/*.
 */

const GEMINI_MODEL = 'gemini-2.5-flash-preview-05-20';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function POST(req: NextRequest) {
  try {
    const { content, title } = await req.json();

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

    // 2500 chars — Gemini 2.5 Flash handles longer context well
    const truncated = content.slice(0, 2500);

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

    // 12-second hard timeout — Gemini 2.5 Flash is fast but give it room
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    let response: Response;
    try {
      response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 800,
            responseMimeType: 'application/json',
          },
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
      console.error('[AI FAQ] Gemini error:', response.status, errText);
      return NextResponse.json(
        { error: `AI service error (${response.status}). Try again.` },
        { status: 502 }
      );
    }

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

    // Strip markdown code fences if present despite responseMimeType hint
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
