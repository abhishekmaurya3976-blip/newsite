import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Package } from 'lucide-react';
import { categoryApi } from '../../lib/api/categories';
import { productApi } from '../../lib/api/products';
import CategoryCard from '../../components/shared/CategoryCard';
import ProductGrid from '../../components/shared/ProductGrid';
import SortSelect from '../../components/shared/SortSelect';
import { Category } from '../../../types/category';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await categoryApi.getBySlug(slug);
  
  return {
    title: `${category?.name || 'Category'} | Art Supplies Store`,
    description: category?.description || `Browse ${category?.name || 'category'} products`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  // Await the promises
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  
  const category = await categoryApi.getBySlug(slug);
  
  if (!category || !category.isActive) {
    notFound();
  }

  // Parse search params
  const page = parseInt(resolvedSearchParams.page || '1');
  const limit = 12;
  const sortBy = resolvedSearchParams.sort || 'createdAt';
  const sortOrder = sortBy.includes('desc') ? 'desc' : 'asc';

  // Fetch data in parallel
  const [allCategories, productsData] = await Promise.all([
    categoryApi.getAll(),
    productApi.getProducts({
      page,
      limit,
      categoryId: category._id,
      isActive: true,
      sortBy,
      sortOrder,
    }),
  ]);

  // Get subcategories
  const subcategories = allCategories.filter(cat => 
    cat.isActive && cat.parentId === category._id
  );

  // Get sibling categories (same parent)
  const siblingCategories = category.parentId 
    ? allCategories.filter(cat => 
        cat.isActive && cat.parentId === category.parentId && cat._id !== category._id
      )
    : [];

  // Find parent category
  const parentCategory = category.parentId 
    ? allCategories.find(cat => cat._id === category.parentId)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-lg md:text-xl opacity-90 max-w-3xl">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/categories" className="hover:text-blue-600 transition-colors">
              Categories
            </Link>
            {parentCategory && (
              <>
                <ChevronRight className="w-4 h-4 mx-2" />
                <Link 
                  href={`/categories/${parentCategory.slug}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {parentCategory.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900 font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Subcategories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {subcategories.map(subcategory => (
                <CategoryCard key={subcategory._id} category={subcategory} />
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {category.name} Products
              </h2>
              <p className="text-gray-600">
                Showing {productsData.products.length} of {productsData.total} products
              </p>
            </div>

            {/* Sort - Using Client Component */}
            <div>
              <SortSelect 
                currentSort={sortBy}
                categorySlug={slug}
              />
            </div>
          </div>

          {productsData.products.length > 0 ? (
            <>
              <ProductGrid products={productsData.products} />
              
              {/* Pagination */}
              {productsData.totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.min(5, productsData.totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      const isActive = pageNum === page;
                      
                      // Build URL with current parameters
                      const params = new URLSearchParams();
                      if (pageNum > 1) params.set('page', pageNum.toString());
                      if (sortBy !== 'createdAt') params.set('sort', sortBy);
                      
                      const url = `/categories/${slug}${params.toString() ? `?${params.toString()}` : ''}`;
                      
                      return (
                        <Link
                          key={pageNum}
                          href={url}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}
                    
                    {productsData.totalPages > 5 && (
                      <>
                        <span className="px-2 text-gray-500">...</span>
                        <Link
                          href={`/categories/${slug}?${new URLSearchParams({
                            page: productsData.totalPages.toString(),
                            ...(sortBy !== 'createdAt' && { sort: sortBy }),
                          }).toString()}`}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {productsData.totalPages}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">No products available in this category yet.</p>
              <Link
                href="/products"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          )}
        </div>

        {/* Sibling Categories */}
        {siblingCategories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {siblingCategories.map(sibling => (
                <CategoryCard key={sibling._id} category={sibling} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}