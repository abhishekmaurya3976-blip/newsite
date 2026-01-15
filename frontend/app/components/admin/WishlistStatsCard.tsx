// app/components/admin/WishlistStatsCard.tsx
import { TrendingUp, Users, Heart, Package } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: 'trending' | 'users' | 'heart' | 'package';
  change?: number;
  description?: string;
}

export default function WishlistStatsCard({ title, value, icon, change, description }: StatsCardProps) {
  const getIcon = () => {
    switch (icon) {
      case 'trending':
        return <TrendingUp className="w-6 h-6" />;
      case 'users':
        return <Users className="w-6 h-6" />;
      case 'heart':
        return <Heart className="w-6 h-6" />;
      case 'package':
        return <Package className="w-6 h-6" />;
      default:
        return <TrendingUp className="w-6 h-6" />;
    }
  };

  const getIconColor = () => {
    switch (icon) {
      case 'trending':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'users':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'heart':
        return 'bg-gradient-to-r from-rose-500 to-pink-500';
      case 'package':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`${getIconColor()} p-3 rounded-xl`}>
          {getIcon()}
        </div>
        {change !== undefined && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            change >= 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </div>
        )}
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 font-medium">{title}</p>
      
      {description && (
        <p className="text-sm text-gray-500 mt-2">{description}</p>
      )}
    </div>
  );
}