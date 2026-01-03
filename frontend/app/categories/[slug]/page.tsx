import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ChevronRight, 
  Crown,
  Sparkles,
  Search,
  X,
  ArrowRight,
  Package
} from 'lucide-react';
import { categoryApi } from '../../lib/api/categories';
import { productApi } from '../../lib/api/products';
import CategoryCard from '../../components/shared/CategoryCard';
import ProductGrid from '../../components/shared/ProductGrid';
import SortSelect from '../../components/shared/SortSelect';
import { Suspense } from 'react';

// Cache duration for revalidation (in seconds)
export const revalidate = 3600; // Revalidate every hour

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    search?: string;
  }>;
}

// Optimized data fetching with caching
async function getCategoryData(slug: string) {
  try {
    const category = await categoryApi.getBySlug(slug);
    if (!category || !category.isActive) {
      return null;
    }
    
    // Fetch all categories in parallel with the main category
    const allCategoriesPromise = categoryApi.getAll();
    
    return {
      category,
      allCategories: await allCategoriesPromise,
    };
  } catch (error) {
    console.error('Error fetching category data:', error);
    return null;
  }
}

async function getProductsData(categoryId: string, page: number, sortBy: string, searchQuery: string) {
  try {
    const productsData = await productApi.getProducts({
      page,
      limit: 12,
      categoryId,
      isActive: true,
      sortBy: sortBy === 'price-desc' ? 'price' : sortBy,
      sortOrder: sortBy.includes('desc') ? 'desc' : 'asc',
      search: searchQuery,
    });
    
    return productsData;
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], total: 0, totalPages: 0 };
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const data = await getCategoryData(slug);
    
    if (!data) {
      return {
        title: 'Category Not Found | Art Plaza',
        description: 'The requested category could not be found',
      };
    }
    
    return {
      title: `${data.category.name} | Premium Collection | Art Plaza`,
      description: data.category.description || `Explore premium ${data.category.name} collection at Art Plaza`,
      openGraph: {
        title: `${data.category.name} | Art Plaza`,
        description: data.category.description || `Explore our ${data.category.name} collection`,
        type: 'website',
      },
    };
  } catch (error) {
    return {
      title: 'Category | Art Plaza',
      description: 'Explore premium art supplies and stationery collections',
    };
  }
}

// ProductsContent component - optimized
async function ProductsContent({ 
  slug, 
  page, 
  sortBy, 
  searchQuery,
  categoryName 
}: { 
  slug: string; 
  page: number; 
  sortBy: string; 
  searchQuery: string;
  categoryName: string;
}) {
  const categoryData = await getCategoryData(slug);
  
  if (!categoryData) {
    return (
      <div className="text-center py-12 md:py-16">
        <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
            <Package className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
          </div>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
          Category not found
        </h3>
      </div>
    );
  }

  const productsData = await getProductsData(categoryData.category._id, page, sortBy, searchQuery);

  if (productsData.products.length === 0) {
    return (
      <div className="text-center py-12 md:py-16">
        <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
            <Package className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
          </div>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
          {searchQuery ? 'No Products Found' : 'No Products Available'}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {searchQuery 
            ? `No products matching "${searchQuery}" in ${categoryName}`
            : `No products available in ${categoryName} yet.`}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {searchQuery && (
            <Link
              href={`/categories/${slug}`}
              className="px-4 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
            >
              Clear Search
            </Link>
          )}
          <Link
            href="/products"
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProductGrid 
        products={productsData.products} 
        loading={false}
      />
      
      {/* Pagination */}
      {productsData.totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={`/categories/${slug}?${new URLSearchParams({
                  page: (page - 1).toString(),
                  ...(sortBy !== 'createdAt' && { sort: sortBy }),
                  ...(searchQuery && { search: searchQuery }),
                }).toString()}`}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center text-sm"
              >
                ← Previous
              </Link>
            )}
            
            {Array.from({ length: Math.min(5, productsData.totalPages) }, (_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === page;
              
              return (
                <Link
                  key={pageNum}
                  href={`/categories/${slug}?${new URLSearchParams({
                    ...(pageNum > 1 && { page: pageNum.toString() }),
                    ...(sortBy !== 'createdAt' && { sort: sortBy }),
                    ...(searchQuery && { search: searchQuery }),
                  }).toString()}`}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}
            
            {page < productsData.totalPages && (
              <Link
                href={`/categories/${slug}?${new URLSearchParams({
                  page: (page + 1).toString(),
                  ...(sortBy !== 'createdAt' && { sort: sortBy }),
                  ...(searchQuery && { search: searchQuery }),
                }).toString()}`}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center text-sm"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Subcategories component
async function SubcategoriesContent({ categoryId, allCategories }: { 
  categoryId: string;
  allCategories: any[];
}) {
  const subcategories = allCategories.filter(cat => 
    cat.isActive && cat.parentId === categoryId
  );

  if (subcategories.length === 0) return null;

  return (
    <section className="mb-12 md:mb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
            Subcategories
          </h2>
          <p className="text-gray-600 text-sm">
            Explore related collections
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {subcategories.length} subcategories
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {subcategories.map((subcategory, index) => (
          <CategoryCard 
            key={subcategory._id} 
            category={subcategory} 
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

// Related categories component
async function RelatedCategoriesContent({ 
  categoryId, 
  parentId,
  allCategories 
}: { 
  categoryId: string; 
  parentId?: string | null;
  allCategories: any[];
}) {
  if (!parentId) return null;
  
  const siblingCategories = allCategories.filter(cat => 
    cat.isActive && cat.parentId === parentId && cat._id !== categoryId
  );

  if (siblingCategories.length === 0) return null;

  return (
    <section className="mb-12 md:mb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
            Related Collections
          </h2>
          <p className="text-gray-600 text-sm">
            Explore other collections in the same category
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {siblingCategories.map((sibling, index) => (
          <CategoryCard 
            key={sibling._id} 
            category={sibling} 
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  
  // Fetch all initial data in parallel
  const categoryData = await getCategoryData(slug);
  
  if (!categoryData) {
    notFound();
  }

  const { category, allCategories } = categoryData;
  const parentCategory = category.parentId 
    ? allCategories.find(cat => cat._id === category.parentId)
    : null;

  const page = parseInt(resolvedSearchParams.page || '1');
  const sortBy = resolvedSearchParams.sort || 'createdAt';
  const searchQuery = resolvedSearchParams.search || '';

  return (
    <main className="min-h-screen bg-white">
      {/* 1. HEADER */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-24 pb-8 md:pb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-xl">
                  <Crown className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                  {category.name} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Collection</span>
                </h1>
                {category.description && (
                  <p className="text-gray-600 text-sm md:text-base mt-1 max-w-2xl">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Product Count - Will be updated by ProductsContent */}
            <div className="bg-gradient-to-r from-gray-900 to-black text-white px-4 py-3 rounded-xl shadow-lg">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold">-</div>
                <div className="text-xs text-gray-300">Premium Products</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BREADCRUMB */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <nav className="flex items-center text-sm text-gray-600 overflow-x-auto">
            <Link href="/" className="hover:text-purple-600 transition-colors flex items-center whitespace-nowrap">
              <Crown className="w-3 h-3 mr-1" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" />
            <Link href="/categories" className="hover:text-purple-600 transition-colors whitespace-nowrap">
              Collections
            </Link>
            {parentCategory && (
              <>
                <ChevronRight className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" />
                <Link 
                  href={`/categories/${parentCategory.slug}`}
                  className="hover:text-purple-600 transition-colors whitespace-nowrap"
                >
                  {parentCategory.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" />
            <span className="text-gray-900 font-medium truncate">
              {category.name}
            </span>
          </nav>
        </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Subcategories - Preloaded data */}
        <SubcategoriesContent 
          categoryId={category._id} 
          allCategories={allCategories}
        />

        {/* 4. PRODUCTS SECTION */}
        <section className="mb-12 md:mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                Products in {category.name}
              </h2>
              <p className="text-gray-600 text-sm">
                Premium products
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <form action={`/categories/${slug}`} method="GET" className="relative">
                <input
                  type="text"
                  name="search"
                  defaultValue={searchQuery}
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-48 md:w-64 text-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                {searchQuery && (
                  <Link 
                    href={`/categories/${slug}`}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </Link>
                )}
              </form>

              {/* Sort */}
              <SortSelect 
                currentSort={sortBy}
                categorySlug={slug}
              />
            </div>
          </div>

          {/* PRODUCTS DISPLAY - With Suspense */}
          <Suspense fallback={<ProductGrid loading={true} />}>
            <ProductsContent 
              slug={slug}
              page={page}
              sortBy={sortBy}
              searchQuery={searchQuery}
              categoryName={category.name}
            />
          </Suspense>
        </section>

        {/* 5. RELATED CATEGORIES */}
        <RelatedCategoriesContent 
          categoryId={category._id}
          parentId={category.parentId}
          allCategories={allCategories}
        />

        {/* 6. PREMIUM CTA */}
        <section>
          <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-8 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
              Need More Options?
            </h2>
            <p className="text-gray-300 text-sm md:text-base mb-6 max-w-2xl mx-auto">
              Explore our complete collection of premium art supplies and stationery
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-all duration-300 group"
              >
                Shop All Products
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/categories"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                All Collections
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}