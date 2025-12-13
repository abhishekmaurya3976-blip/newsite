import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw, 
  Tag, 
  Check, 
  Package,
  ChevronRight
} from 'lucide-react';
import { productApi } from '../../lib/api/products';
import ProductGrid from '../../components/shared/ProductGrid';
import { Product } from '../../../types/product';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await productApi.getBySlug(slug);
  
  return {
    title: `${product?.name || 'Product'} | Art Supplies Store`,
    description: product?.shortDescription || product?.description?.substring(0, 160) || '',
    openGraph: {
      images: product?.images?.slice(0, 1).map(img => ({ url: img.url })) || [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await productApi.getBySlug(slug);
  
  if (!product || !product.isActive) {
    notFound();
  }

  // Fetch related products in parallel with main product data
  const [relatedProductsData] = await Promise.all([
    productApi.getProducts({
      categoryId: product.categoryId,
      limit: 4,
      isActive: true,
    }).catch(() => ({ products: [] })) // Fallback if related products fail
  ]);

  const relatedProducts = relatedProductsData.products.filter(p => p._id !== product._id);

  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  // Generate optimized image sizes
  const imageSizes = "(max-width: 768px) 100vw, 50vw";
  const thumbnailSizes = "(max-width: 768px) 25vw, 12.5vw";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/products" className="hover:text-blue-600 transition-colors">
              Products
            </Link>
            {product.category && (
              <>
                <ChevronRight className="w-4 h-4 mx-2" />
                <Link 
                  href={`/categories/${product.category.slug}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-8">
                {/* Main Image - Optimized */}
                <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                  {primaryImage ? (
                    <Image
                      src={primaryImage.url}
                      alt={primaryImage.altText || product.name}
                      fill
                      className="object-contain"
                      sizes={imageSizes}
                      priority
                      quality={85} // Reduced quality for faster loading
                      loading="eager"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-24 h-24 text-gray-400" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {hasDiscount && (
                      <span className="px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-full">
                        {discountPercent}% OFF
                      </span>
                    )}
                    {product.isBestSeller && (
                      <span className="px-3 py-1.5 bg-yellow-500 text-white text-sm font-bold rounded-full">
                        Best Seller
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="px-3 py-1.5 bg-purple-500 text-white text-sm font-bold rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnail Images - Lazy Loaded */}
                {product.images && product.images.length > 1 && (
                  <div className="mt-6 grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {product.images.slice(0, 4).map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square overflow-hidden rounded-lg border-2 border-transparent hover:border-blue-500 cursor-pointer"
                      >
                        <Image
                          src={image.url}
                          alt={image.altText || `${product.name} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes={thumbnailSizes}
                          loading="lazy" // Lazy load thumbnails
                          quality={65} // Lower quality for thumbnails
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              {product.category && (
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  {product.category.name}
                </Link>
              )}

              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <div className="flex items-center flex-wrap gap-4 mb-6">
                <div className="flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">4.8 (128 reviews)</span>
                </div>
                <div className="flex items-center">
                  <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                  {product.stock > 0 && product.stock <= 10 && (
                    <span className="ml-2 text-sm text-yellow-600">
                      (Only {product.stock} left)
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-2xl text-gray-500 line-through">
                        ₹{product.compareAtPrice?.toLocaleString()}
                      </span>
                      <span className="px-3 py-1 bg-red-100 text-red-800 font-bold rounded-full">
                        Save ₹{(product.compareAtPrice! - product.price).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-gray-500 text-sm">Inclusive of all taxes</p>
              </div>

              {product.shortDescription && (
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {product.shortDescription.split('.').filter(f => f.trim()).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{feature.trim()}.</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button className="px-4 py-3 text-gray-600 hover:bg-gray-100">
                      -
                    </button>
                    <span className="px-4 py-3 text-gray-900 font-medium min-w-[60px] text-center">
                      1
                    </span>
                    <button className="px-4 py-3 text-gray-600 hover:bg-gray-100">
                      +
                    </button>
                  </div>

                  <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Add to Cart
                  </button>

                  <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>

                <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
                  Buy Now
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start text-gray-600">
                  <Truck className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Free Shipping</p>
                    <p className="text-sm">Orders over ₹999 • Delivered in 3-5 days</p>
                  </div>
                </div>
                <div className="flex items-start text-gray-600">
                  <RotateCcw className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">30-Day Returns</p>
                    <p className="text-sm">Easy returns & exchanges</p>
                  </div>
                </div>
                <div className="flex items-start text-gray-600">
                  <Shield className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Secure Payment</p>
                    <p className="text-sm">SSL encrypted & secure</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-200">
                <div className="flex items-center">
                  <span className="text-gray-600 mr-4">Share:</span>
                  <div className="flex items-center space-x-3">
                    <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                      <span className="text-sm">📱</span>
                    </button>
                    <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                      <span className="text-sm">📧</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">SKU</h3>
                <p className="text-gray-600">{product.sku}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Category</h3>
                <p className="text-gray-600">{product.category?.name || 'Uncategorized'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Weight</h3>
                <p className="text-gray-600">{product.weight ? `${product.weight}g` : 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Stock</h3>
                <p className="text-gray-600">{product.stock} units available</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Dimensions</h3>
                <p className="text-gray-600">
                  {product.dimensions 
                    ? `${product.dimensions.length || 0} × ${product.dimensions.width || 0} × ${product.dimensions.height || 0} cm`
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Barcode</h3>
                <p className="text-gray-600">{product.barcode || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  );
}