// components/shared/ShareButtons.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Share2,
  Copy as CopyIcon,
  Facebook,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Twitter,
  Linkedin,
  Mail,
  ExternalLink
} from 'lucide-react';
import type { Product } from '../../../types/product';

interface ShareButtonsProps {
  product: Product;
}

export default function ShareButtons({ product }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [absoluteUrl, setAbsoluteUrl] = useState('');

  useEffect(() => {
    setMounted(true);
    // Set absolute URL only on client side
    const url = typeof window !== 'undefined' 
      ? `${window.location.origin}/products/${product.slug}`
      : '';
    setAbsoluteUrl(url);
  }, [product.slug]);

  // Robust copy helper
  const robustCopy = async (text: string) => {
    setErrorMsg(null);

    try {
      // Use the modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers or insecure contexts
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.opacity = '0';
        
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        try {
          const successful = document.execCommand('copy');
          document.body.removeChild(textarea);
          
          if (!successful) {
            throw new Error('execCommand failed');
          }
          return true;
        } catch (err) {
          document.body.removeChild(textarea);
          throw err;
        }
      }
    } catch (err) {
      console.error('Copy failed:', err);
      setErrorMsg('Failed to copy. Please select and copy manually.');
      return false;
    }
  };

  // Button handlers
  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setCopied(false);
    setErrorMsg(null);

    if (!absoluteUrl) {
      setErrorMsg('URL is not available. Please refresh the page.');
      return;
    }

    const ok = await robustCopy(absoluteUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!absoluteUrl) return;
    
    const shareText = `Check out "${product.name}" on Art Plazaa!\n\n${absoluteUrl}\n\n${product.shortDescription || 'Premium art supplies and stationery'}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFacebook = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!absoluteUrl) return;
    
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluteUrl)}&quote=${encodeURIComponent(`Check out "${product.name}" on Art Plazaa`)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  const handleTwitter = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!absoluteUrl) return;
    
    const shareText = `Check out "${product.name}" on Art Plazaa! ${product.shortDescription || ''}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(absoluteUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  const handleLinkedIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!absoluteUrl) return;
    
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(absoluteUrl)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!absoluteUrl) return;
    
    const subject = encodeURIComponent(`Check out "${product.name}" on Art Plazaa`);
    const body = encodeURIComponent(`Check out "${product.name}" on Art Plazaa!\n\n${absoluteUrl}\n\n${product.shortDescription || 'Premium art supplies and stationery'}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank', 'noopener,noreferrer');
  };

  const openProductInNewTab = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!absoluteUrl) return;
    
    window.open(absoluteUrl, '_blank', 'noopener,noreferrer');
  };

  // Don't render buttons until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="pt-6 md:pt-8 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
              <Share2 className="w-5 h-5 mr-3 text-purple-600" />
              Share this product
            </h4>
            <p className="text-sm text-gray-500">
              Help others discover this amazing product!
            </p>
          </div>
        </div>
        <div className="h-12 bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="pt-6 md:pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
            <Share2 className="w-5 h-5 mr-3 text-purple-600" />
            Share this product
          </h4>
          <p className="text-sm text-gray-500">
            Help others discover this amazing product!
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsApp}
          type="button"
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg active:scale-95 cursor-pointer group"
          title="Share on WhatsApp"
        >
          <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm sm:text-base">WhatsApp</span>
        </button>

        {/* Facebook Button */}
        <button
          onClick={handleFacebook}
          type="button"
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg active:scale-95 cursor-pointer group"
          title="Share on Facebook"
        >
          <Facebook className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm sm:text-base">Facebook</span>
        </button>

        {/* Twitter Button */}
        <button
          onClick={handleTwitter}
          type="button"
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg active:scale-95 cursor-pointer group"
          title="Share on Twitter"
        >
          <Twitter className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm sm:text-base">Twitter</span>
        </button>

        {/* LinkedIn Button */}
        <button
          onClick={handleLinkedIn}
          type="button"
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg active:scale-95 cursor-pointer group"
          title="Share on LinkedIn"
        >
          <Linkedin className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm sm:text-base">LinkedIn</span>
        </button>

        {/* Email Button */}
        <button
          onClick={handleEmail}
          type="button"
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg active:scale-95 cursor-pointer group"
          title="Share via Email"
        >
          <Mail className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm sm:text-base">Email</span>
        </button>

        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          type="button"
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg active:scale-95 cursor-pointer group relative"
          title="Copy product link"
        >
          {copied ? (
            <CheckCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          ) : (
            <CopyIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-sm sm:text-base">{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      {/* Link Preview */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
        <p className="text-xs text-gray-500 mb-1">Product Link:</p>
        <div className="flex items-center justify-between">
          <code className="text-sm text-gray-700 truncate font-mono bg-gray-100 px-2 py-1.5 rounded flex-1 mr-2">
            {absoluteUrl}
          </code>
          <button
            onClick={openProductInNewTab}
            className="inline-flex items-center text-xs text-purple-600 hover:text-purple-800 font-medium whitespace-nowrap px-2 py-1 hover:bg-purple-50 rounded transition-colors cursor-pointer"
            title="Open in new tab"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Open
          </button>
        </div>
      </div>

      {/* Toast */}
      {copied && (
        <div className="fixed bottom-4 right-4 z-50 animate-fadeIn">
          <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Link copied to clipboard!</span>
          </div>
        </div>
      )}
    </div>
  );
}