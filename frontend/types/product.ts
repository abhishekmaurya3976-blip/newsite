// types/product.ts
export type ProductImage = {
  id?: string;
  url: string;
  altText?: string;
  publicId?: string;
  isPrimary?: boolean;
  order?: number;
};

export type RatingBreakdown = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

export type ProductRating = {
  average: number;
  count: number;
  breakdown?: RatingBreakdown;
};

export type ProductReview = {
  _id?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku: string;
  barcode?: string;
  stock: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  metaTitle?: string;
  metaDescription?: string;
  images: ProductImage[];
  rating?: ProductRating;
  reviews?: ProductReview[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateProductDto = {
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku: string;
  barcode?: string;
  stock: number;
  weight?: number;
  categoryId?: string;
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  images?: ProductImage[];
};

export type UpdateProductDto = Partial<CreateProductDto>;