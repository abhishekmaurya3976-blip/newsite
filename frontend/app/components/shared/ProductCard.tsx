import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../../../types/product';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link href={`/products/${product.slug}`}>
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              {discountPercent}% OFF
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
              Best Seller
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
              Featured
            </span>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Category */}
        {product.category && (
          <Link 
            href={`/categories/${product.category.slug}`}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            {product.category.name}
          </Link>
        )}

        {/* Product name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 mt-1 hover:text-blue-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mt-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-4 h-4 text-yellow-400 fill-current"
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-1">4.8</span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.compareAtPrice?.toLocaleString()}
              </span>
            )}
          </div>

          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Add to Cart
          </button>
        </div>

        {/* Stock status */}
        <div className="mt-3">
          {product.stock > 10 ? (
            <span className="text-xs text-green-600">In Stock</span>
          ) : product.stock > 0 ? (
            <span className="text-xs text-yellow-600">Only {product.stock} left</span>
          ) : (
            <span className="text-xs text-red-600">Out of Stock</span>
          )}
        </div>
      </div>
    </div>
  );
}