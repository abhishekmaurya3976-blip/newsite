// components/shared/ShareButtons.tsx
'use client';

import { MessageCircle } from 'lucide-react';
import type { Product } from '../../../types/product';

interface ShareButtonsProps {
  product: Product;
}

export default function ShareButtons({ product }: ShareButtonsProps) {
  // Share on WhatsApp
  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const text = `Check out "${product.name}" on Art Plazaa!\n${product.shortDescription || ''}\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="pt-6 md:pt-8 border-t border-gray-200">
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-1">
          Share this product
        </h4>
        <p className="text-sm text-gray-500">Help others discover this amazing product!</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        {/* Only WhatsApp Button */}
        <button
          onClick={shareOnWhatsApp}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 font-medium shadow hover:shadow-md active:scale-95 cursor-pointer min-w-[140px]"
          title="Share on WhatsApp"
          type="button"
          aria-label="Share on WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">WhatsApp</span>
        </button>
      </div>
    </div>
  );
}