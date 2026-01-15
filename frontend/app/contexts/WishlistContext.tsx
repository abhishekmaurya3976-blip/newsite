// app/context/WishlistContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '../../types/product';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  loginRequired: () => void;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      const user = localStorage.getItem('userData');
      if (token && user) {
        setIsAuthenticated(true);
        loadWishlistFromBackend();
      } else {
        setIsAuthenticated(false);
        setWishlist([]);
      }
    }
  };

  const loginRequired = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
    }
  };

  const loadWishlistFromBackend = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/wishlist`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Backend wishlist response:', data);
        
        if (data.success && data.data?.wishlist) {
          const products = data.data.wishlist
            .map((item: any) => {
              const product = item.product;
              // Ensure product has _id field
              if (product && !product._id && product.id) {
                product._id = product.id;
              }
              // Ensure product has all required fields
              return {
                ...product,
                _id: product._id || '',
                id: product._id || '',
                images: Array.isArray(product.images) ? product.images.map((img: any) => ({
                  url: img.url || img,
                  altText: img.altText || product.name
                })) : [],
                tags: product.tags || [],
                stock: product.stock || 0,
                isActive: product.isActive !== false,
                isFeatured: product.isFeatured || false,
                isBestSeller: product.isBestSeller || false
              };
            })
            .filter((product: Product | null) => product && product._id);

          console.log('Extracted products:', products);
          setWishlist(products);
        }
      } else if (response.status === 401) {
        // Unauthorized - clear auth
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        setIsAuthenticated(false);
        setWishlist([]);
      }
    } catch (error) {
      console.error('Failed to load wishlist from backend:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product: Product) => {
    if (!isAuthenticated) {
      loginRequired();
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        loginRequired();
        return;
      }

      // Check if already in wishlist
      if (wishlist.some(item => item._id === product._id)) {
        return;
      }

      // Optimistic update
      setWishlist(prev => [...prev, product]);

      // Call backend API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/wishlist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product._id
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        // Revert optimistic update on error
        setWishlist(prev => prev.filter(item => item._id !== product._id));
        console.warn('Failed to add to wishlist:', data.message);
        
        if (response.status === 401) {
          loginRequired();
        }
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      // Revert optimistic update
      setWishlist(prev => prev.filter(item => item._id !== product._id));
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      loginRequired();
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        loginRequired();
        return;
      }

      // Optimistic update
      const previousWishlist = [...wishlist];
      setWishlist(prev => prev.filter(item => item._id !== productId));

      // Call backend API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/wishlist/${productId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        // Revert optimistic update on error
        setWishlist(previousWishlist);
        console.warn('Failed to remove from wishlist:', data.message);
        
        if (response.status === 401) {
          loginRequired();
        }
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Don't revert on error
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item._id === productId);
  };

  const clearWishlist = async () => {
    if (!isAuthenticated) {
      loginRequired();
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        loginRequired();
        return;
      }

      // Clear local state
      setWishlist([]);

      // Call backend API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/wishlist/clear`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        console.warn('Failed to clear wishlist:', data.message);
        
        if (response.status === 401) {
          loginRequired();
        }
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    }
  };

  const refreshWishlist = async () => {
    if (isAuthenticated) {
      await loadWishlistFromBackend();
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        loading,
        isAuthenticated,
        loginRequired,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};