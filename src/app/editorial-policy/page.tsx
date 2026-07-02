import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbs } from '@/lib/jsonld';
import {
  Shield, Search, Users, RefreshCw, AlertCircle,
  BookOpen, MessageSquare, ExternalLink, CheckCircle2, FileText
} from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  title: 'Editorial Policy — How OneMint Researches, Writes & Fact-Checks',
  description:
    'OneMint\'s editorial standards: how we select topics, verify facts, attribute sources, and correct errors. Our commitment to accuracy, independence, and reader trust.',
  alternates: { canonical: `${SITE_URL}/editorial-policy` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/editorial-policy`,
    title: 'Editorial Policy — OneMint',
    description:
      'How OneMint researches, fact-checks, and publishes expert-level content on personal finance, health, technology, and more.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'OneMint Editorial Policy' }],
  },
};

const sections = [
  {
    id: 'mission',
    icon: <BookOpen size={22} className="text-[var(--color-accent)]" />,
    title: 'Our Editorial Mission',
    content: `OneMint exists to give every Indian access to expert-level knowledge — explained simply, without jargon, without hidden agendas.

We believe the best kind of article reads like advice from a brilliant friend who happens to be a domain expert: direct, honest, and genuinely useful. Every piece we publish is held to that standard.

Our coverage spans personal finance, technology, health & wellness, career development, education, and world affairs — the topics that shape people's financial and physical wellbeing.`,
  },
  {
    id: 'independence',
    icon: <Shield size={22} className="text-[var(--color-accent)]" />,
    title: 'Editorial Independence',
    content: `OneMint's editorial content is strictly independent from commercial considerations:

**No sponsored articles.** We do not publish paid-for editorial content. Advertisements are clearly labelled and physically separated from editorial content.

**No affiliate bias.** When we recommend a product, service, or financial instrument, it is because our research supports that recommendation — not because we receive a commission. Any commercial relationships that could affect coverage are disclosed prominently.

**No advertiser influence.** Advertisers cannot request, preview, or alter any editorial content before or after publication. Our commercial team has no editorial input.

**Separation of church and state.** Editors and writers operate independently. Revenue concerns do not enter the editorial process.`,
  },
  {
    id: 'authorship',
    icon: <Users size={22} className="text-[var(--color-accent)]" />,
    title: 'Who Writes for OneMint',
    content: `We maintain high authorship standards to ensure E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness):

**Domain experts.** Personal finance articles are written by qualified financial professionals (CFPs, CAs, MBAs in Finance). Health articles are reviewed by registered medical practitioners or licensed nutritionists. Technology pieces are authored by practising engineers and researchers.

**Professional journalists.** Staff writers and contributing editors hold journalism qualifications or have relevant domain experience. All writers undergo a rigorous editorial onboarding.

**Every author is identified.** We display the author's name, role, and bio on every article. We do not publish anonymously attributed content.

**Disclosure of conflicts.** Authors disclose any financial interest, past or present employment, or personal relationship with subjects covered in their articles.`,
  },
  {
    id: 'research',
    icon: <Search size={22} className="text-[var(--color-accent)]" />,
    title: 'Research & Fact-Checking Standards',
    content: `Every OneMint article undergoes a structured research and verification process before publication:

**Primary sources first.** We cite original research, government notifications (RBI, SEBI, MCA, ICMR), peer-reviewed studies, and official statistics. Secondary sources are used only to cross-reference primary data.

**Multiple source verification.** Any fact presented as true is corroborated by at least two independent, authoritative sources.

**Data currency.** Financial data (interest rates, tax slabs, thresholds, limits) is verified against the most recent official circulars and budget notifications. Our tools reflect the current financial year unless stated otherwise.

**Medical and health claims.** Health content is reviewed against published clinical guidelines (WHO, ICMR, AIIMS) and peer-reviewed literature. We do not make diagnostic claims. Articles carry appropriate disclaimers.

**Quotes and attribution.** All direct quotes are attributed to identified individuals. We do not use anonymous quotes to make factual claims.

**AI assistance disclosure.** OneMint may use AI tools to assist with research and drafting. All AI-assisted content is reviewed, verified, and edited by qualified human authors before publication. AI-generated text is never published without substantial human editorial oversight.`,
  },
  {
    id: 'corrections',
    icon: <RefreshCw size={22} className="text-[var(--color-accent)]" />,
    title: 'Corrections & Updates Policy',
    content: `We are committed to correcting errors promptly and transparently:

**Factual corrections.** If a published article contains a factual error, we correct it as soon as it is identified. Corrections are noted at the top or bottom of the article with the date of change and a brief description of what was corrected.

**Material corrections.** If a correction materially changes the meaning or conclusion of an article, we add a prominent correction notice and, where appropriate, republish the article with a new publication date.

**Regular updates.** Financial regulations, tax rules, interest rates, and health guidelines change. We review and update time-sensitive articles on a regular schedule. Updated articles display both the original publication date and the most recent update date.

**Reader corrections.** We welcome readers who spot errors. Use the feedback button on any article or email us at editorial@onemint.in. We investigate every reported concern.

**Transparency log.** Significant corrections and retractions are documented. We do not silently delete or alter published content.`,
  },
  {
    id: 'editorial-process',
    icon: <CheckCircle2 size={22} className="text-[var(--color-accent)]" />,
    title: 'Our Editorial Process',
    content: `Every article published on OneMint passes through the following stages:

**1. Topic selection.** Topics are chosen for genuine reader value, not search volume alone. We ask: does this help a real Indian reader make a better decision or understand something important?

**2. Research brief.** The assigned author receives a research brief outlining the scope, key questions to answer, required sources, and the target audience level (beginner / intermediate / advanced).

**3. Draft and self-review.** The author writes the first draft and performs a self-check against the research brief and source list.

**4. Editorial review.** A senior editor reviews for accuracy, clarity, logical structure, completeness, and editorial standards compliance.

**5. Fact-check.** A second reviewer independently verifies key claims against primary sources.

**6. Legal and compliance check.** Articles involving financial advice, health claims, or legal matters are reviewed to ensure appropriate disclaimers are present and that content does not constitute regulated advice.

**7. Publication and metadata.** The article is published with accurate metadata (publication date, author, category, tags) and structured data for search engines.`,
  },
  {
    id: 'reader-trust',
    icon: <MessageSquare size={22} className="text-[var(--color-accent)]" />,
    title: 'Our Commitment to Reader Trust',
    content: `**Disclaimers, not advice.** OneMint's articles on personal finance, taxation, investing, and health are for informational purposes only and do not constitute regulated financial or medical advice. We always encourage readers to consult a certified professional for their specific situation.

**No clickbait.** Headlines accurately represent article content. We do not use misleading headlines to drive traffic.

**No manufactured urgency.** We do not use artificial scarcity, manipulative countdown timers, or psychological pressure tactics.

**Privacy.** We do not sell reader data to third parties. Our newsletter subscribers receive only editorial content — no third-party marketing.

**Transparency about data.** Where we present statistics, market data, or research findings, we cite the original source so readers can verify independently.`,
  },
  {
    id: 'complaints',
    icon: <AlertCircle size={22} className="text-[var(--color-accent)]" />,
    title: 'Complaints & Reader Feedback',
    content: `We take editorial complaints seriously. If you believe any OneMint article is factually incorrect, misleading, or violates the standards on this page:

**Step 1.** Use the feedback button on the relevant article page or email editorial@onemint.in with the article URL and your specific concern.

**Step 2.** We will acknowledge your complaint within 48 hours and investigate.

**Step 3.** If the complaint is upheld, we will correct the article and inform you of the action taken within 7 business days.

**Step 4.** If you are not satisfied with our response, you may escalate to our Editor-in-Chief at editor@onemint.in.

We are committed to resolving all genuine complaints fairly and promptly.`,
  },
];

export default function EditorialPolicyPage() {
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: 'Editorial Policy', url: `${SITE_URL}/editorial-policy` },
  ]);

  return (
    <div className="pt-16 lg:pt-[72px] pb-20">
      <JsonLd data={breadcrumbSchema} />

      {/* Hero */}
      <header className="bg-gradient-to-br from-[var(--color-accent-light)] via-[var(--color-surface)] to-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <nav className="flex items-center gap-2 text-xs font-medium text-[var(--color-ink-tertiary)] mb-8 font-[family-name:var(--font-ui)]" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">Home</Link>
            <span aria-hidden="true">›</span>
            <span className="text-[var(--color-ink-secondary)]">Editorial Policy</span>
          </nav>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-accent-light)] border border-[var(--color-border)] flex items-center justify-center">
              <FileText size={22} className="text-[var(--color-accent)]" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] font-[family-name:var(--font-ui)]">Editorial Standards</p>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-ink)] leading-tight mb-4">
            How We Research, Write<br className="hidden sm:block" /> &amp; Fact-Check
          </h1>
          <p className="text-lg text-[var(--color-ink-secondary)] max-w-2xl font-[family-name:var(--font-body)] leading-relaxed">
            Our editorial standards exist to ensure that every article on OneMint is accurate, independent, and genuinely useful — not just well-ranked. This page explains exactly how we work.
          </p>
          <p className="mt-4 text-sm text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
            Last reviewed: July 2025 · Questions? <a href="mailto:editorial@onemint.in" className="text-[var(--color-accent)] hover:underline">editorial@onemint.in</a>
          </p>
        </div>
      </header>

      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-16">

          {/* Sticky sidebar nav */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-tertiary)] mb-4 font-[family-name:var(--font-ui)]">On this page</p>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block text-sm text-[var(--color-ink-secondary)] hover:text-[var(--color-accent)] transition-colors py-1.5 font-[family-name:var(--font-ui)] leading-snug"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
              <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
                <Link href="/about" className="flex items-center gap-2 text-xs text-[var(--color-ink-tertiary)] hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-ui)]">
                  <ExternalLink size={12} /> About OneMint
                </Link>
                <Link href="/contact" className="flex items-center gap-2 text-xs text-[var(--color-ink-tertiary)] hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-ui)] mt-2">
                  <ExternalLink size={12} /> Contact Us
                </Link>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="space-y-14">
            {sections.map((section, idx) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-accent-light)] flex items-center justify-center shrink-0">
                    {section.icon}
                  </div>
                  <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[var(--color-ink)]">
                    {section.title}
                  </h2>
                </div>
                <div className="prose prose-slate max-w-none font-[family-name:var(--font-body)]">
                  {section.content.split('\n\n').map((para, i) => {
                    if (para.startsWith('**') && para.includes('.**')) {
                      // Bold label paragraphs (like "**No sponsored articles.** ...")
                      const boldEnd = para.indexOf('.**') + 3;
                      const label = para.slice(0, boldEnd);
                      const rest = para.slice(boldEnd);
                      return (
                        <p key={i} className="text-[var(--color-ink-secondary)] leading-relaxed mb-4">
                          <strong className="text-[var(--color-ink)]">{label.replace(/\*\*/g, '')}</strong>
                          {rest}
                        </p>
                      );
                    }
                    if (para.startsWith('**')) {
                      // Number-prefixed bold headers (like "**1. Topic selection.**")
                      const match = para.match(/^\*\*(.+?)\*\*\s*([\s\S]*)/);
                      if (match) {
                        return (
                          <div key={i} className="mb-4">
                            <p className="font-semibold text-[var(--color-ink)] mb-1">{match[1]}</p>
                            {match[2] && <p className="text-[var(--color-ink-secondary)] leading-relaxed">{match[2]}</p>}
                          </div>
                        );
                      }
                    }
                    return (
                      <p key={i} className="text-[var(--color-ink-secondary)] leading-relaxed mb-4">
                        {para}
                      </p>
                    );
                  })}
                </div>
                {idx < sections.length - 1 && (
                  <div className="mt-10 border-b border-[var(--color-border)]" />
                )}
              </section>
            ))}

            {/* Footer note */}
            <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-2xl p-6">
              <p className="text-sm font-semibold text-[var(--color-ink)] mb-2 font-[family-name:var(--font-ui)]">A living document</p>
              <p className="text-sm text-[var(--color-ink-secondary)] font-[family-name:var(--font-body)] leading-relaxed">
                This editorial policy is reviewed and updated at least annually, or whenever significant changes are made to our editorial process. The version history is maintained internally. If you have questions about our standards or a specific editorial decision, please contact{' '}
                <a href="mailto:editorial@onemint.in" className="text-[var(--color-accent)] hover:underline">editorial@onemint.in</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
