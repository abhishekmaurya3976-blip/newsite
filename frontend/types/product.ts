export type ProductImage = {
  id?: string;
  url: string;
  altText?: string;
  publicId?: string;
  isPrimary?: boolean;
  order?: number;
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