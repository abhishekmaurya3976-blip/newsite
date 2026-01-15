// app/components/admin/WishlistTable.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Trash2, 
  Eye, 
  User, 
  Package, 
  Calendar,
  ChevronRight,
  ExternalLink,
  Filter
} from 'lucide-react';
import { AdminWishlistItem } from '../../../types/admin';

interface WishlistTableProps {
  wishlists: AdminWishlistItem[];
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export default function WishlistTable({ wishlists, onDelete, loading = false }: WishlistTableProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedItems.length === wishlists.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlists.map(item => item._id));
    }
  };

  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this wishlist item?')) {
      onDelete?.(id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-16"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedItems.length === wishlists.length && wishlists.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                {selectedItems.length} selected
              </span>
            </div>
            
            {selectedItems.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${selectedItems.length} selected items?`)) {
                    selectedItems.forEach(id => onDelete?.(id));
                    setSelectedItems([]);
                  }
                }}
                className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">
              {wishlists.length} items
            </span>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Added Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {wishlists.map((item) => (
              <tr 
                key={item._id} 
                className={`hover:bg-gray-50 transition-colors ${
                  selectedItems.includes(item._id) ? 'bg-purple-50' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 relative rounded-lg overflow-hidden bg-gray-100 mr-3">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName || 'Product'}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-gray-400 absolute inset-0 m-auto" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {item.productName || 'Unknown Product'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.productCategory || 'Uncategorized'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.userName || 'Unknown User'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.userEmail || 'No email'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-gray-900">
                    ₹{item.productPrice?.toLocaleString() || '0'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    (item.productStock || 0) > 10 
                      ? 'bg-green-100 text-green-800'
                      : (item.productStock || 0) > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.productStock || 0} in stock
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDate(item.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/products/${item.productId}`}
                      className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="View Product"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    
                    <Link
                      href={`/admin/users/${item.userId}`}
                      className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View User"
                    >
                      <User className="w-4 h-4" />
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Wishlist Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <Link
                      href={`/products/${item.productId}`}
                      target="_blank"
                      className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="View Product Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {wishlists.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No wishlist items found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            There are no wishlist items to display. Users will appear here when they add products to their wishlist.
          </p>
        </div>
      )}
    </div>
  );
}