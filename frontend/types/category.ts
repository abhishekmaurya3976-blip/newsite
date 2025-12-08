export type CategoryImage = {
  url: string;
  publicId?: string;
  altText?: string;
};

export type Category = {
  _id: string;
  id?: string; // For backward compatibility
  name: string;
  slug: string;
  description?: string;
  image?: CategoryImage | string; // Can be object or string URL
  parentId?: string | null;
  parent?: Category; // Populated parent
  children?: Category[]; // Populated children
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  __v?: number;
};

export type CategoryTreeItem = Category & { 
  children?: CategoryTreeItem[] 
};

export type CreateCategoryDto = {
  name: string;
  description?: string;
  parentId?: string | null;
  isActive?: boolean;
  image?: string | CategoryImage;
};

export type UpdateCategoryDto = Partial<CreateCategoryDto>;