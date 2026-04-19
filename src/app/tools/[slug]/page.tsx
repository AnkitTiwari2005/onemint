import Link from 'next/link';
import { Hammer, ArrowLeft, Bell } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tool in Development | OneMint',
  description: 'This calculator is currently being built by our financial experts.',
};

export default async function ToolComingSoonPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  // Format slug to readable title
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="pt-16 lg:pt-[72px] pb-20 min-h-screen bg-[var(--color-surface)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink-secondary)] hover:text-[var(--color-accent)] transition-colors mb-8 font-[family-name:var(--font-ui)]"
        >
          <ArrowLeft size={16} /> Back to Tools
        </Link>

        <div className="bg-[var(--color-surface-alt)] rounded-3xl border border-[var(--color-border)] p-8 sm:p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Hammer size={32} className="text-[var(--color-accent)]" />
          </div>
          
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-[var(--color-ink)] mb-4">
            {title} Calculator
          </h1>
          <p className="text-lg text-[var(--color-ink-secondary)] mb-8 font-[family-name:var(--font-body)] max-w-md mx-auto">
            Our experts are currently building and verifying the data models for this tool. It will be available soon.
          </p>
          
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 max-w-sm mx-auto">
            <Bell size={24} className="text-[var(--color-accent-warm)] mx-auto mb-3" />
            <h3 className="font-bold text-[var(--color-ink)] mb-2">Want to be notified?</h3>
            <p className="text-sm text-[var(--color-ink-tertiary)] mb-4">
              Join our newsletter to get updates when new tools are launched.
            </p>
            <Link 
              href="/newsletter" 
              className="block w-full py-2.5 rounded-lg bg-[var(--color-ink)] text-[var(--color-surface)] font-semibold hover:opacity-90 transition-opacity text-sm"
            >
              Subscribe Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
