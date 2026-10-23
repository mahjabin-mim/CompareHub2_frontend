'use client';

import { useState } from 'react';

type ProductImageProps = {
  // One URL, or several to try in order (the same product's image from different stores).
  src: string | string[];
  alt: string;
  fallbackLabel: string;
  className?: string;
};

// Store images are hotlinked and often 404 or block other sites; try the next candidate and
// finally show the store name instead of a broken image.
export function ProductImage({ src, alt, fallbackLabel, className = '' }: ProductImageProps) {
  const candidates = (Array.isArray(src) ? src : [src]).filter(Boolean);
  const [failed, setFailed] = useState<string[]>([]);
  const current = candidates.find((candidate) => !failed.includes(candidate));

  if (!current) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm font-semibold text-brand-500">
        {fallbackLabel}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={current}
      src={current}
      alt={alt}
      loading="lazy"
      onError={() => setFailed((list) => [...list, current])}
      className={className}
    />
  );
}
