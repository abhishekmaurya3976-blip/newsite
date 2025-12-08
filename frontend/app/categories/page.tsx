import { Metadata } from 'next';
import Link from 'next/link';
import { categoryApi } from '../lib/api/categories';
import CategoryCard from '../components/shared/CategoryCard';
import { Category } from '../../types/category';

export const metadata: Metadata = {
  title: 'Product Categories | Art Supplies Store',
  description: 'Browse our wide range of art supplies, stationery, and creative material categories.',
};

export default async function CategoriesPage() {
  const categories = await categoryApi.getAll();
  const activeCategories = categories.filter(cat => cat.isActive);
  
  // Get parent categories (no parentId)
  const parentCategories = activeCategories.filter(cat => !cat.parentId);
  
  // Get subcategories grouped by parent
  const categoryTree = parentCategories.map(parent => ({
    ...parent,
    children: activeCategories.filter(cat => cat.parentId === parent._id),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Shop by Category</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Explore our curated collection of art supplies, stationery, and creative materials
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Categories</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories available</h3>
            <p className="text-gray-500">Check back later for our product categories.</p>
          </div>
        ) : (
          <>
            {/* Featured Categories */}
            {parentCategories.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Categories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {parentCategories.slice(0, 3).map(category => (
                    <CategoryCard key={category._id} category={category} />
                  ))}
                </div>
              </div>
            )}

            {/* All Categories */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">All Categories</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {activeCategories.map(category => (
                  <CategoryCard key={category._id} category={category} />
                ))}
              </div>
            </div>

            {/* Category Hierarchy */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Category Hierarchy</h2>
              <div className="space-y-4">
                {categoryTree.map(parent => (
                  <div key={parent._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{parent.name}</h3>
                      <Link 
                        href={`/categories/${parent.slug}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View All
                      </Link>
                    </div>
                    
                    {parent.children && parent.children.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {parent.children.map(child => (
                          <Link
                            key={child._id}
                            href={`/categories/${child.slug}`}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* CTA Section */}
        <div className="mt-12">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Can't find what you're looking for?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Explore our entire product collection or contact our support team for assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View All Products
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}