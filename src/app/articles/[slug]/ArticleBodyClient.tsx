'use client';

import { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GlossaryLinker } from '@/components/GlossaryLinker';
import { AdSlot } from '@/components/AdSlot';

/** Slugify a heading text into an HTML-safe id */
function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/** Recursively extract plain text from ReactMarkdown children. */
function extractText(children: React.ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (children && typeof children === 'object' && 'props' in (children as object)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return extractText((children as any).props?.children);
  }
  return '';
}

const mdComponents = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h2: ({ children, ...props }: any) => {
    const id = headingId(extractText(children));
    return <h2 id={id} {...props}>{children}</h2>;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h3: ({ children, ...props }: any) => {
    const id = headingId(extractText(children));
    return <h3 id={id} {...props}>{children}</h3>;
  },
};

interface ArticleBodyClientProps {
  content: string;
}

/**
 * Split markdown into two halves at the nearest paragraph boundary
 * after the midpoint. Used to inject a mid-article ad slot.
 */
function splitAtMidpoint(md: string): [string, string] {
  const mid = Math.floor(md.length / 2);
  // Find next double-newline after midpoint (paragraph break)
  const splitIdx = md.indexOf('\n\n', mid);
  if (splitIdx === -1) return [md, ''];
  return [md.slice(0, splitIdx + 2), md.slice(splitIdx + 2)];
}

const MID_SLOT  = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MID;
const END_SLOT  = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_END;

/**
 * Client wrapper for article prose.
 * Renders ReactMarkdown + auto-links glossary terms via GlossaryLinker.
 * Injects AdSense slots at mid-article and end of article.
 */
export function ArticleBodyClient({ content }: ArticleBodyClientProps) {
  const proseRef = useRef<HTMLDivElement>(null);
  const [firstHalf, secondHalf] = splitAtMidpoint(content);
  const hasSecondHalf = secondHalf.trim().length > 200;

  return (
    <div className="prose prose-slate max-w-none" ref={proseRef}>
      {/* First half of article */}
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {firstHalf}
      </ReactMarkdown>

      {/* Mid-article ad — only when article is long enough to split */}
      {hasSecondHalf && (
        <AdSlot
          slotId={MID_SLOT}
          format="fluid"
          label="Mid-article"
        />
      )}

      {/* Second half of article */}
      {hasSecondHalf && (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {secondHalf}
        </ReactMarkdown>
      )}

      {/* End-of-article ad */}
      <AdSlot
        slotId={END_SLOT}
        format="auto"
        label="End of article"
      />

      {/* Glossary auto-linker runs after render, walks text nodes */}
      <GlossaryLinker containerRef={proseRef} />
    </div>
  );
}
