import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/ai
 * Accepts: { content: string, title: string }
 * Returns: { faqs: Array<{ question: string; answer: string }> }
 *
 * Uses OpenRouter to generate 4 high-quality FAQ pairs from article content.
 * The API key is server-only — never exposed to the browser.
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
        { error: 'AI service not configured (OPENROUTER_API_KEY missing)' },
        { status: 503 }
      );
    }

    // Truncate content to ~3000 chars to stay within token limits
    const truncated = content.slice(0, 3000);

    const prompt = `You are an expert SEO content strategist. Given the article below, generate exactly 4 FAQ (Frequently Asked Questions) entries that:
1. Are naturally derived from the actual content of the article
2. Target real questions people search for on Google
3. Have clear, concise answers (2-4 sentences each)
4. Use plain language (no markdown, no bullet points in answers)
5. Match the article's tone and topic

Article title: "${title}"

Article content:
${truncated}

Respond ONLY with a valid JSON array in this exact format (no extra text, no markdown, no code fences):
[
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."}
]`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://www.onemint.in',
        'X-Title': 'OneMint Admin — FAQ Generator',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[AI FAQ] OpenRouter error:', err);
      return NextResponse.json(
        { error: 'AI service returned an error. Try again.' },
        { status: 502 }
      );
    }

    const result = await response.json();
    const raw = result.choices?.[0]?.message?.content ?? '';

    // Robustly parse the JSON — strip any accidental markdown fences
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    let faqs: { question: string; answer: string }[];
    try {
      faqs = JSON.parse(cleaned);
    } catch {
      console.error('[AI FAQ] Parse error. Raw output:', raw);
      return NextResponse.json(
        { error: 'AI returned unexpected format. Try regenerating.' },
        { status: 422 }
      );
    }

    // Validate shape
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
    console.error('[AI FAQ]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
