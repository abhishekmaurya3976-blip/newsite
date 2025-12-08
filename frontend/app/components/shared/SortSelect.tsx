'use client';

import { useRouter } from 'next/navigation';
import { ChangeEvent } from 'react';

interface SortSelectProps {
  currentSort: string;
  categorySlug: string;
}

export default function SortSelect({ currentSort, categorySlug }: SortSelectProps) {
  const router = useRouter();

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    // Update URL with new sort parameter
    const params = new URLSearchParams();
    if (newSort !== 'createdAt') {
      params.set('sort', newSort);
    }
    // Reset to page 1 when sort changes
    router.push(`/categories/${categorySlug}?${params.toString()}`);
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