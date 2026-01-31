'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent } from 'react';

interface SortSelectProps {
  currentSort: string;
  categorySlug?: string; // Make optional
}

export default function SortSelect({ currentSort, categorySlug }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    
    // Get all current search params
    const params = new URLSearchParams(searchParams.toString());
    
    // Update sort parameter
    if (newSort !== 'createdAt') {
      params.set('sort', newSort);
    } else {
      params.delete('sort');
    }
    
    // Always reset to page 1 when sort changes
    params.set('page', '1');
    
    // Determine the route
    let route = '/products';
    if (categorySlug) {
      route = `/categories/${categorySlug}`;
    }
    
    // Update URL
    router.push(`${route}?${params.toString()}`);
  };

  return (
    <select
      value={currentSort}
      onChange={handleSortChange}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="createdAt">Newest First</option>
      <option value="price">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="name">Name: A to Z</option>
      <option value="name-desc">Name: Z to A</option>
    </select>
  );
}