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

const GEMINI_MODEL    = 'gemini-2.5-flash-preview-05-20';
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

    // Send up to 6000 chars (~1500 words) — enough for a full article body
    const truncated     = content.slice(0, 6000);
    const categoryLine  = category ? `Category: ${category}` : '';
    const tagsLine      = tags?.length ? `Tags: ${tags.join(', ')}` : '';
    const contextBlock  = [categoryLine, tagsLine].filter(Boolean).join('\n');

    const prompt = `You are an expert SEO content strategist specialising in Indian personal finance, health, and technology content.

Your task: Read the article below and write exactly 4 FAQ entries that will appear in a Google FAQ rich snippet.

STRICT RULES:
1. Every question must start with one of these high-intent patterns: "What is", "How", "Why", "Is", "Does", "Can", "When", "Are", "Which", "How much", "What are"
2. Each question must target a DIFFERENT angle — no rephrasing the same question
3. Answers must be 2–3 complete sentences. Plain prose only — no bullet points, no markdown, no lists
4. Ground every answer in specific facts, data points, or named entities from the article
5. Questions must reflect what an Indian reader would actually type into Google
6. Do NOT generate generic questions like "What is this article about?" or "Why is this important?"
7. Prefer questions with high search volume potential over obvious or trivial ones

Article metadata:
Title: "${title.trim()}"
${contextBlock}

Article content:
${truncated}

Return ONLY a valid JSON array — no explanation, no markdown fences, no preamble:
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
            maxOutputTokens:  1024,
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
