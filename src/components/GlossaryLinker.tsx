'use client';

import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GlossaryTooltip } from './GlossaryTooltip';
import { glossaryTerms } from '@/data/glossary';

// Build sorted list of all terms + abbreviations (longest first to avoid partial matches)
const allTerms: Array<{ pattern: string; id: string; term: string; shortDefinition: string }> = [];
for (const t of glossaryTerms) {
  allTerms.push({ pattern: t.term.replace(/\s*\(.*?\)/g, '').trim(), id: t.id, term: t.term, shortDefinition: t.shortDefinition });
  // Add abbreviation (e.g. "SIP" from "SIP (Systematic...)")
  const abbr = t.term.match(/^([A-Z]{2,})\s*\(/);
  if (abbr) {
    allTerms.push({ pattern: abbr[1], id: t.id, term: t.term, shortDefinition: t.shortDefinition });
  }
}
// Longest patterns first (prevents "SIP" matching inside "SHIP" etc)
allTerms.sort((a, b) => b.pattern.length - a.pattern.length);

// Remove duplicates
const seen = new Set<string>();
const uniqueTerms = allTerms.filter(t => {
  const key = t.pattern.toLowerCase();
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

/**
 * GlossaryLinker
 * Scans the article prose after render and wraps glossary terms
 * in interactive tooltip spans. Uses DOM manipulation on text nodes only
 * (never touches element nodes) so it can't break the HTML structure.
 *
 * Terms are only highlighted once per article to keep the prose clean.
 */
export function GlossaryLinker({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    const container = containerRef.current;
    if (!container) return;

    // Walk all text nodes in the article body
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        // Skip text inside code blocks, pre, headings, and already-processed spans
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName;
        if (['CODE', 'PRE', 'SCRIPT', 'STYLE', 'A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(tag)) return NodeFilter.FILTER_REJECT;
        if (parent.dataset.glossary) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const highlights: Array<{
      node: Text;
      term: typeof uniqueTerms[0];
      matchStart: number;
      matchEnd: number;
    }> = [];

    // First pass — collect all matches (one per term across entire article)
    const usedTerms = new Set<string>();
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      const text = node.textContent ?? '';
      for (const term of uniqueTerms) {
        if (usedTerms.has(term.id)) continue;
        // Word boundary match, case-insensitive
        const re = new RegExp(`\\b${term.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        const m = re.exec(text);
        if (m) {
          highlights.push({ node, term, matchStart: m.index, matchEnd: m.index + m[0].length });
          usedTerms.add(term.id);
          break; // one term per text node — move to next node
        }
      }
    }

    // Second pass — apply highlights in reverse order so offsets stay valid
    for (const { node: textNode, term, matchStart, matchEnd } of highlights) {
      try {
        const before = textNode.textContent!.slice(0, matchStart);
        const matched = textNode.textContent!.slice(matchStart, matchEnd);
        const after = textNode.textContent!.slice(matchEnd);

        const parent = textNode.parentNode!;

        // Replace text node with [before text] + [tooltip span] + [after text]
        const wrapper = document.createElement('span');
        wrapper.dataset.glossary = 'true';

        if (before) parent.insertBefore(document.createTextNode(before), textNode);
        parent.insertBefore(wrapper, textNode);
        if (after) parent.insertBefore(document.createTextNode(after), textNode);
        parent.removeChild(textNode);

        // Mount React tooltip into the wrapper span
        const root = createRoot(wrapper);
        root.render(
          <GlossaryTooltip term={term.id}>
            {matched}
          </GlossaryTooltip>
        );
      } catch { /* skip if DOM manipulation fails */ }
    }

    done.current = true;
  }, [containerRef]);

  return null;
}
