// app/components/shared/LoadingFallback.tsx
export default function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}