import Link from 'next/link';
import Image from 'next/image';
import { authors } from '@/data/authors';
import { Target, Handshake, Brain } from 'lucide-react';

export const metadata = {
  title: 'About OneMint',
  description: 'OneMint is India\'s most trusted knowledge platform — expert articles on finance, technology, health, career, and everything that matters.',
};

export default function AboutPage() {
  return (
    <div className="pt-16 lg:pt-[72px] pb-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--color-accent-light)] via-[var(--color-surface)] to-[var(--color-surface)]">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-ink)] mb-6 leading-tight">
            India&apos;s Most Trusted<br />Knowledge Platform
          </h1>
          <p className="text-lg lg:text-xl text-[var(--color-ink-secondary)] max-w-2xl mx-auto font-[family-name:var(--font-body)] leading-relaxed">
            We believe everyone deserves access to expert-level knowledge — explained simply, without jargon, without clickbait. Just truth, depth, and clarity.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[var(--color-border)]">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[var(--color-border)]">
            {[
              { num: '500K+', label: 'Monthly readers' },
              { num: '2,000+', label: 'Expert articles' },
              { num: '25+', label: 'Free tools' },
              { num: '12', label: 'Topic categories' },
            ].map((s) => (
              <div key={s.label} className="py-8 text-center">
                <p className="font-[family-name:var(--font-mono)] text-3xl lg:text-4xl font-bold text-[var(--color-accent)]">{s.num}</p>
                <p className="text-sm text-[var(--color-ink-tertiary)] mt-1 font-[family-name:var(--font-ui)]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-ink)] mb-6">Our Mission</h2>
          <div className="article-body">
            <p>OneMint exists because India needs better information. Not more content — better content. Every article we publish goes through a rigorous editorial process: researched by domain experts, fact-checked against primary sources, and written to be understood by anyone.</p>
            <p>We cover the topics that matter most: personal finance, technology, health, careers, real estate, education, and more. We don&apos;t chase clicks. We chase clarity.</p>
            <blockquote>&ldquo;Like a brilliant friend who happens to know everything.&rdquo;</blockquote>
            <p>Whether you&apos;re figuring out your first SIP, understanding the new tax regime, or wondering if that health supplement actually works — OneMint has your answer. No ads disguised as articles. No affiliate links hidden in recommendations. Just honest, expert knowledge.</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[var(--color-surface-alt)] border-y border-[var(--color-border)]">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-ink)] mb-12 text-center">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Target size={28} className="text-[var(--color-accent)]" />, title: 'Accuracy First', desc: 'Every claim is verified. We cite primary sources and update articles when facts change.' },
              { icon: <Handshake size={28} className="text-[var(--color-accent)]" />, title: 'Reader Trust', desc: 'No sponsored content disguised as editorial. No affiliate bias. Our readers come first.' },
              { icon: <Brain size={28} className="text-[var(--color-accent)]" />, title: 'Depth Over Clicks', desc: 'We write 2,000-word deep dives, not 300-word SEO filler. Quality always beats quantity.' },
            ].map((v) => (
              <div key={v.title} className="bg-[var(--color-surface)] rounded-2xl p-8 border border-[var(--color-border)] shadow-sm hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-light)] flex items-center justify-center mb-5">{v.icon}</div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[var(--color-ink)] mb-2">{v.title}</h3>
                <p className="text-sm text-[var(--color-ink-secondary)] leading-relaxed font-[family-name:var(--font-body)]">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-ink)] mb-4 text-center">Our Editorial Team</h2>
        <p className="text-[var(--color-ink-secondary)] text-center mb-12 max-w-xl mx-auto font-[family-name:var(--font-body)]">
          Domain experts and storytellers who turn complex topics into clear, actionable knowledge.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {authors.map((author) => (
            <Link
              key={author.id}
              href={`/author/${author.slug}`}
              className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 text-center hover:border-[var(--color-accent)] transition-all shadow-sm hover:shadow-[var(--shadow-card-hover)]"
            >
              <Image
                src={author.avatar}
                alt={author.name}
                width={80}
                height={80}
                className="rounded-full mx-auto mb-4 border-4 border-[var(--color-surface-alt)] group-hover:border-[var(--color-accent-light)] transition-colors"
              />
              <h3 className="font-[family-name:var(--font-heading)] font-bold text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
                {author.name}
              </h3>
              <p className="text-xs text-[var(--color-accent)] font-semibold uppercase tracking-wider mt-1 font-[family-name:var(--font-ui)]">
                {author.role}
              </p>
              <p className="text-xs text-[var(--color-ink-tertiary)] mt-2 line-clamp-2 font-[family-name:var(--font-body)]">
                {author.bio}
              </p>
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--color-ink-tertiary)] mt-3 block">
                {author.articleCount} articles
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-accent-light)]">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl lg:text-3xl font-bold text-[var(--color-ink)] mb-4">
            Want to write for OneMint?
          </h2>
          <p className="text-[var(--color-ink-secondary)] max-w-lg mx-auto mb-8 font-[family-name:var(--font-body)]">
            We&apos;re always looking for domain experts who can explain complex topics simply.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[var(--color-accent)] text-white font-semibold hover:opacity-90 transition-opacity text-sm font-[family-name:var(--font-ui)]">
            Apply to Contribute →
          </Link>
        </div>
      </section>
    </div>
  );
}
