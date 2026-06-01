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
 * Calls Google Gemini 2.5 Flash directly.
 * Protected by HMAC session middleware on /api/admin/*.
 */

const GEMINI_MODEL    = 'gemini-2.0-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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

    // 2500 chars (~600 words) is sufficient for FAQs and keeps token usage low
    const truncated    = content.slice(0, 2500);
    const meta         = [
      category ? `Category: ${category}` : '',
      tags?.length    ? `Tags: ${tags.join(', ')}` : '',
    ].filter(Boolean).join('\n');

    // Compact prompt — same quality, ~60% fewer tokens than a verbose ruleset
    const prompt =
`SEO FAQ generator for Indian personal finance / health / tech content.
Write exactly 4 FAQ entries for a Google FAQ rich snippet.
Rules: questions start with What/How/Why/Is/Does/Can/When/Are/Which/How much/What are; each targets a different angle; answers are 2-3 plain-prose sentences grounded in article facts; no generic questions; high search-volume intent.

Title: "${title.trim()}"${meta ? '\n' + meta : ''}

Article (excerpt):
${truncated}

Return ONLY a JSON array, no markdown, no explanation:
[{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."}]`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    let response: Response;
    try {
      response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature:      0.2,   // lower = more factual, less hallucination
            maxOutputTokens:  512,   // 4 FAQ pairs never exceed 512 tokens
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

      // 429 = token-per-minute quota exceeded (long articles push over the limit)
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Token limit reached — the article is too long for the AI quota. Try trimming the content, or wait 60 seconds and retry.' },
          { status: 429 }
        );
      }

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
