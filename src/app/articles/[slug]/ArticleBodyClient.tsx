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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  h2: ({ node: _node, children, ...props }: any) => {
    const id = headingId(extractText(children));
    return <h2 id={id} {...props}>{children}</h2>;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  h3: ({ node: _node, children, ...props }: any) => {
    const id = headingId(extractText(children));
    return <h3 id={id} {...props}>{children}</h3>;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  a: ({ node: _node, href, children, ...props }: any) => {
    const text = extractText(children).toLowerCase();
    const isAffiliate =
      Boolean(href && (href.includes('onelink.me') || href.includes('paytmmoney.com') || href.includes('affiliate'))) ||
      text.includes('affiliate');
    const isExternal = Boolean(href && href.startsWith('http') && !href.includes('onemint.com') && !href.includes('onemint.in'));

    if (isAffiliate) {
      return (
        <a
          href={href}
          target="_blank"
          rel="sponsored nofollow noopener"
          {...props}
        >
          {children}
        </a>
      );
    }

    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
};

interface ArticleBodyClientProps {
  content: string;
}

/**
 * Split markdown into two halves at the nearest paragraph boundary
 * after the midpoint. Skips code fences (```) and tables so formatting is never broken.
 * Used to inject a mid-article ad slot.
 */
function splitAtMidpoint(md: string): [string, string] {
  if (!md) return ['', ''];
  const lines = md.split('\n');
  if (lines.length < 8) return [md, ''];

  const mid = Math.floor(lines.length / 2);
  let inCodeFence = false;
  let splitLineIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('```')) {
      inCodeFence = !inCodeFence;
      continue;
    }

    // Don't split inside a code block, inside a table, or right after a heading
    if (!inCodeFence && i >= mid) {
      const isBlank = trimmed === '';
      const prevLine = i > 0 ? lines[i - 1].trim() : '';
      const isPrevHeading = prevLine.startsWith('#');
      const isTable = trimmed.startsWith('|') || prevLine.startsWith('|');

      if (isBlank && !isPrevHeading && !isTable) {
        splitLineIndex = i;
        break;
      }
    }
  }

  if (splitLineIndex === -1) {
    return [md, ''];
  }

  const firstHalf = lines.slice(0, splitLineIndex).join('\n');
  const secondHalf = lines.slice(splitLineIndex + 1).join('\n');
  return [firstHalf, secondHalf];
}

const MID_SLOT  = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MID;
const END_SLOT  = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_END;

/**
 * Client wrapper for article prose.
 * Renders ReactMarkdown + auto-links glossary terms via GlossaryLinker.
 * Injects AdSense slots at mid-article and end of article.
 */
export function ArticleBodyClient({ content }: ArticleBodyClientProps) {
  const [firstHalf, secondHalf] = splitAtMidpoint(content);
  const hasSecondHalf = secondHalf.trim().length > 200;

  return (
    <div id="article-prose" className="prose prose-slate max-w-none">
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

      {/* Glossary auto-linker client island */}
      <GlossaryLinker containerId="article-prose" />
    </div>
  );
}
