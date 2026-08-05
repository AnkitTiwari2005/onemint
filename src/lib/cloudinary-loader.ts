/**
 * cloudinary-loader.ts
 *
 * Custom Next.js image loader that routes ALL <Image> optimization through
 * Cloudinary's "fetch" endpoint instead of Vercel's image optimizer.
 *
 * How it works:
 *  1. Next.js calls this with { src, width, quality } for every <Image>
 *  2. We build a Cloudinary fetch URL wrapping the original src
 *  3. Cloudinary fetches the image from its origin once, transforms it,
 *     and serves WebP/AVIF from its global CDN on every subsequent request
 *  4. Vercel never sees the image — zero transformations consumed
 *
 * Cloudinary free tier: 25 GB storage, 25 GB bandwidth, unlimited transforms.
 *
 * Format: https://res.cloudinary.com/{cloudName}/image/fetch/{transforms}/{encodedSrc}
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'lcloknqr';

interface LoaderParams {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudinaryLoader({ src, width, quality }: LoaderParams): string {
  // If the src is already a Cloudinary URL, return it as-is to avoid double-wrapping.
  if (src.includes('res.cloudinary.com')) return src;

  // Local / relative paths (e.g. /og-image.png from /public) — serve directly,
  // no need to route through Cloudinary since they're already edge-cached by Vercel.
  if (src.startsWith('/')) {
    return src;
  }

  const q = quality ?? 80;

  // Build Cloudinary transformation string:
  //   w_   — resize to the requested width (Next.js provides srcset widths)
  //   q_   — quality (default 80, good balance of size vs. sharpness)
  //   f_auto — auto-select best format (WebP for Chrome, AVIF for supported browsers)
  //   c_limit — only shrink, never upscale (preserves original for small images)
  const transforms = `w_${width},q_${q},f_auto,c_limit`;

  // Cloudinary fetch requires the source URL to be URL-encoded
  const encodedSrc = encodeURIComponent(src);

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transforms}/${encodedSrc}`;
}
