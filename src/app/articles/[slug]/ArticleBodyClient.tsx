'use client';

import { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GlossaryLinker } from '@/components/GlossaryLinker';

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
 * Client wrapper for article prose.
 * Renders ReactMarkdown + auto-links glossary terms via GlossaryLinker.
 */
export function ArticleBodyClient({ content }: ArticleBodyClientProps) {
  const proseRef = useRef<HTMLDivElement>(null);

  return (
    <div className="prose prose-slate max-w-none" ref={proseRef}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {content}
      </ReactMarkdown>
      {/* Glossary auto-linker runs after render, walks text nodes */}
      <GlossaryLinker containerRef={proseRef} />
    </div>
  );
}
