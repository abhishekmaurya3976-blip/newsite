import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Category } from '../../../types/category';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  // Handle image - could be string or object
  const imageUrl = typeof category.image === 'string' 
    ? category.image 
    : category.image?.url;

  return (
    <Link 
      href={`/categories/${category.slug}`} 
      className="group block"
    >
      <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-[4/3]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={typeof category.image !== 'string' && category.image?.altText 
              ? category.image.altText 
              : category.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <span className="text-3xl font-bold text-gray-400">
              {category.name.charAt(0)}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-xl font-bold mb-2">{category.name}</h3>
          {category.description && (
            <p className="text-sm text-gray-200 mb-4 line-clamp-2">
              {category.description}
            </p>
          )}
          
          <div className="flex items-center text-sm font-medium">
            <span>Explore</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}