'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, ChevronDown, X } from 'lucide-react';
import { Category } from '../../../types/category';

interface FiltersProps {
  categories: Category[];
}

export default function Filters({ categories }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('createdAt');

  // Initialize from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort');
    const search = searchParams.get('search');

    if (category) setSelectedCategory(category);
    if (minPrice) setPriceRange(prev => ({ ...prev, min: minPrice }));
    if (maxPrice) setPriceRange(prev => ({ ...prev, max: maxPrice }));
    if (sort) setSortBy(sort);
  }, [searchParams]);

  const handleApply = () => {
    const params = new URLSearchParams();
    
    // Get existing search term
    const search = searchParams.get('search');
    if (search) {
      params.set('search', search);
    }
    
    if (selectedCategory) {
      params.set('category', selectedCategory);
    }
    
    if (priceRange.min) {
      params.set('minPrice', priceRange.min);
    }
    
    if (priceRange.max) {
      params.set('maxPrice', priceRange.max);
    }
    
    if (sortBy && sortBy !== 'createdAt') {
      params.set('sort', sortBy);
    }

    // Always reset to page 1 when filters change
    params.set('page', '1');
    
    router.push(`/products?${params.toString()}`);
    setIsOpen(false);
  };

  const handleReset = () => {
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('createdAt');
    
    // Keep search term if exists
    const search = searchParams.get('search');
    if (search) {
      router.push(`/products?search=${search}`);
    } else {
      router.push('/products');
    }
    setIsOpen(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden flex items-center justify-between w-full p-4 bg-gray-50"
      >
        <div className="flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          <span className="font-medium">Filters</span>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter content */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block p-4`}>
        {/* Search Input */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Search</h3>
          <form action="/products" method="GET" className="space-y-2">
            <input type="hidden" name="page" value="1" />
            <input
              type="text"
              name="search"
              defaultValue={searchParams.get('search') || ''}
              placeholder="Search products..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
            {priceRange.min && <input type="hidden" name="minPrice" value={priceRange.min} />}
            {priceRange.max && <input type="hidden" name="maxPrice" value={priceRange.max} />}
            {sortBy !== 'createdAt' && <input type="hidden" name="sort" value={sortBy} />}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Search
            </button>
          </form>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory('')}
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === '' 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
            
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === category._id
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'hover:bg-gray-50'
                }`}
              >
                {category.name}
                {category.children && category.children.length > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({category.children.length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Price Range (₹)</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Min</label>
              <input
                type="number"
                placeholder="0"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Max</label>
              <input
                type="number"
                placeholder="10000"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Sort By */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Sort By</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="createdAt">Newest First</option>
            <option value="price">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Apply Filters
          </button>
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}