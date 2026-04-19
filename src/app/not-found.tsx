import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="pt-16 lg:pt-[72px] pb-20 min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <p className="font-[family-name:var(--font-mono)] text-8xl lg:text-[160px] font-bold text-[var(--color-border)] leading-none">
          404
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl lg:text-4xl font-bold text-[var(--color-ink)] mt-4 mb-4">
          Page not found
        </h1>
        <p className="text-[var(--color-ink-secondary)] mb-8 max-w-md mx-auto font-[family-name:var(--font-body)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-[var(--color-accent)] text-white font-semibold hover:opacity-90 transition-opacity text-sm font-[family-name:var(--font-ui)]"
          >
            Go to Homepage
          </Link>
          <Link
            href="/search"
            className="px-6 py-3 rounded-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-[var(--color-ink)] font-semibold hover:border-[var(--color-accent)] transition-colors text-sm font-[family-name:var(--font-ui)]"
          >
            Search Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
