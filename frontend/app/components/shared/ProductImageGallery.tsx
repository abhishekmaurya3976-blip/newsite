// components/shared/ProductImageGallery.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';

type ImageType = { url: string; altText?: string; isPrimary?: boolean };

interface Props {
  images?: ImageType[];
  productName?: string;
}

export default function ProductImageGallery({ images = [], productName = '' }: Props) {
  // choose primary if present, otherwise first image (or -1 if none)
  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    const primary = images.findIndex((i) => i.isPrimary);
    if (primary >= 0) return primary;
    return images.length ? 0 : -1;
  });

  const selectedImage = images[selectedIndex] ?? images[0];

  return (
    <div className="sticky top-8">
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-8">
        {/* Main Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
          {selectedImage ? (
            <Image
              src={selectedImage.url}
              alt={selectedImage.altText || productName}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-24 h-24 text-gray-400" />
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images && images.length > 1 && (
          <div className="mt-6 grid grid-cols-4 sm:grid-cols-5 gap-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 focus:outline-none ${
                  idx === selectedIndex ? 'border-blue-500' : 'border-transparent'
                }`}
                aria-label={`Show image ${idx + 1}`}
              >
                <Image
                  src={img.url}
                  alt={img.altText || `${productName} - Image ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 12.5vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
