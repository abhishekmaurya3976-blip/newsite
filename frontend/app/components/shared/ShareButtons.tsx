// components/shared/ShareButtons.tsx
'use client';

import { MessageCircle, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Product } from '../../../types/product';

interface ShareButtonsProps {
  product: Product;
}

export default function ShareButtons({ product }: ShareButtonsProps) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [supportsShare, setSupportsShare] = useState(false);

  // Get current URL and check if mobile
  useEffect(() => {
    setCurrentUrl(window.location.href);
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    setSupportsShare(typeof navigator.share !== 'undefined');
  }, []);

  // Share on WhatsApp with mobile/desktop detection
  const shareOnWhatsApp = () => {
    const text = `Check out "${product.name}" on Art Plazaa!\n${
      product.shortDescription || ''
    }\n\n${currentUrl}`;
    
    const encodedText = encodeURIComponent(text);
    
    if (isMobile) {
      // For mobile devices - use WhatsApp app
      window.open(`whatsapp://send?text=${encodedText}`, '_blank');
    } else {
      // For desktop - use web WhatsApp
      window.open(`https://web.whatsapp.com/send?text=${encodedText}`, '_blank', 'noopener,noreferrer');
    }
  };

  // Alternative method using API WhatsApp URL (works on both)
  const shareOnWhatsAppAlt = () => {
    const text = `Check out "${product.name}" on Art Plazaa!\n${
      product.shortDescription || ''
    }\n\n${currentUrl}`;
    
    const encodedText = encodeURIComponent(text);
    
    // This URL format works better cross-platform
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank', 'noopener,noreferrer');
  };

  // Use Web Share API if available (modern mobile browsers)
  const shareWithWebShareAPI = () => {
    navigator.share({
      title: product.name,
      text: `Check out "${product.name}" on Art Plazaa! ${
        product.shortDescription || ''
      }`,
      url: currentUrl,
    })
    .catch(error => {
      console.log('Web Share API error:', error);
      // Fallback to WhatsApp if Web Share fails
      shareOnWhatsAppAlt();
    });
  };

  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
  };

  // Universal share function that tries best method first
  const handleShare = () => {
    // Try Web Share API first (best for mobile)
    if (supportsShare) {
      shareWithWebShareAPI();
    } 
    // If on mobile but no Web Share API, try direct WhatsApp
    else if (isMobile) {
      shareOnWhatsApp();
    } 
    // Otherwise use the cross-platform WhatsApp method
    else {
      shareOnWhatsAppAlt();
    }
  };

  return (
    <div className="pt-6 md:pt-8 border-t border-gray-200">
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-1">
          Share this product
        </h4>
        <p className="text-sm text-gray-500">
          Help others discover this amazing product!
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Main Share Button - Universal Share */}
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 font-medium shadow hover:shadow-md active:scale-95 cursor-pointer min-w-[140px]"
          title="Share via WhatsApp or native share"
          type="button"
          aria-label="Share product"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Share</span>
        </button>

        {/* Alternative: Separate WhatsApp button for direct sharing */}
        <button
          onClick={shareOnWhatsAppAlt}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 font-medium shadow hover:shadow-md active:scale-95 cursor-pointer"
          title="Share on WhatsApp"
          type="button"
          aria-label="Share on WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">WhatsApp</span>
        </button>

        {/* Copy Link Button */}
        <button
          onClick={copyToClipboard}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 font-medium shadow hover:shadow-md active:scale-95 cursor-pointer"
          title="Copy product link"
          type="button"
          aria-label="Copy link"
        >
          <Share2 className="w-5 h-5" />
          <span className="font-medium">
            {isCopied ? 'Copied!' : 'Copy Link'}
          </span>
        </button>
      </div>

      {/* Instructions for mobile users */}
      {isMobile && !supportsShare && (
        <p className="mt-3 text-xs text-gray-500">
          <strong>Tip:</strong> If WhatsApp doesn't open, make sure it's installed on your device.
        </p>
      )}

      {/* Product URL (hidden on mobile, shown on desktop) */}
      {!isMobile && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Product URL:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm text-gray-800 truncate p-2 bg-white rounded border">
              {currentUrl}
            </code>
            <button
              onClick={copyToClipboard}
              className="px-3 py-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
            >
              {isCopied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}