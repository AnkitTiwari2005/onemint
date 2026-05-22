/**
 * JsonLd — server-safe component that injects a JSON-LD <script> tag.
 * Use in Server Components (page.tsx / layout.tsx) only.
 * Never import this in a 'use client' component.
 */

interface JsonLdProps {
  /** A single schema object or an array of schema objects */
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // Safe: we fully control the data — it comes from our own builders
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
