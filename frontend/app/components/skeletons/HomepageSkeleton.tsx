'use client';

export default function HomepageSkeleton() {
  return (
    <main className="min-h-screen bg-white">
      {/* Top bar skeleton */}
      <div className="bg-gray-900 h-10 animate-pulse" />
      
      {/* Hero slider skeleton */}
      <div className="w-full aspect-[16/7] bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse" />
      
      {/* Main content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories skeleton */}
        <div className="mb-12">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
        
        {/* Products skeleton */}
        <div className="mb-12">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
        
        {/* Features skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}