// components/shared/ShareButtons.tsx
'use client';

import { MessageCircle, Link as LinkIcon, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Product } from '../../../types/product';

interface ShareButtonsProps {
  product: Product;
}

export default function ShareButtons({ product }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [supportsNativeShare, setSupportsNativeShare] = useState(false);

  // Check for native share support on component mount
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setSupportsNativeShare(
        'share' in navigator && typeof navigator.share === 'function'
      );
    }
  }, []);

  // Share on WhatsApp
  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const text = `Check out "${product.name}" on Art Plazaa!\n${product.shortDescription || ''}\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  // Copy link to clipboard with fallback
  const copyLink = async () => {
    const url = window.location.href;
    
    try {
      // Modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers or HTTP
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback: Show manual copy option
      fallbackCopy(url);
    }
  };

  // Alternative copy method for older browsers
  const fallbackCopy = (url: string) => {
    const input = document.createElement('input');
    input.value = url;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    input.setSelectionRange(0, 99999);
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback copy failed:', err);
      // Show URL for manual copy
      alert(`Please copy this link manually:\n\n${url}`);
    } finally {
      document.body.removeChild(input);
    }
  };

  // Native Share API (for mobile devices)
  const handleNativeShare = async () => {
    if (!supportsNativeShare) return;
    
    try {
      await navigator.share({
        title: product.name,
        text: product.shortDescription || '',
        url: window.location.href,
      });
    } catch (err) {
      // Share was cancelled or failed
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
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
        {/* WhatsApp Button */}
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

        {/* Copy Link Button */}
        <button
          onClick={copyLink}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium shadow hover:shadow-md active:scale-95 cursor-pointer min-w-[140px] ${
            copied 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-gray-800 hover:bg-gray-900 text-white'
          }`}
          title="Copy product link"
          type="button"
          aria-label={copied ? "Link copied" : "Copy link"}
        >
          {copied ? (
            <Check className="w-5 h-5" />
          ) : (
            <LinkIcon className="w-5 h-5" />
          )}
          <span className="font-medium">
            {copied ? 'Copied!' : 'Copy Link'}
          </span>
        </button>

        {/* Native Share Button (shows only on supported devices) */}
        {supportsNativeShare && (
          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 font-medium shadow hover:shadow-md active:scale-95 cursor-pointer min-w-[140px] md:hidden"
            title="Share via device share sheet"
            type="button"
            aria-label="Share via device share sheet"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
            </svg>
            <span className="font-medium">Share</span>
          </button>
        )}
      </div>


      {/* Toast notification for copy confirmation */}
      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-up z-50">
          ✓ Link copied to clipboard!
        </div>
      )}
    </div>
  );
}