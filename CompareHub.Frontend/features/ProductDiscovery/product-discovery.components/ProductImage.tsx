'use client';

import { useState } from 'react';

type ProductImageProps = {
  src: string;
  alt: string;
  fallbackLabel: string;
  className?: string;
};

// Store images are hotlinked and often 404; show the store name instead of a broken image.
export function ProductImage({ src, alt, fallbackLabel, className = '' }: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm font-semibold text-brand-500">
        {fallbackLabel}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} className={className} />
  );
}
