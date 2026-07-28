import { AdSlot } from '@/components/AdSlot';

/**
 * Shared layout for all tools pages (/tools/*).
 * Injects a Display ad below the tool content automatically —
 * no changes needed in individual ToolClient files.
 * Hidden on very small screens to avoid cluttering mobile UX.
 */
export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* Below-tools ad — shown after user gets their result, high attention moment */}
      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <AdSlot
          slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BELOW_TOOLS}
          format="auto"
          label="Below Calculator"
        />
      </div>
    </>
  );
}
