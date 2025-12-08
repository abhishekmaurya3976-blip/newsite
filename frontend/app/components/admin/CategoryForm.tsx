// components/admin/CategoryForm.tsx
'use client';
import { useState } from 'react';

export default function CategoryForm({ initial, onSubmit }: { initial?: any; onSubmit: (payload: any) => Promise<void> }) {
  const [name, setName] = useState(initial?.name || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || '');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, slug, imageUrl });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 p-2 border rounded w-full" />
      </div>
      <div>
        <label className="block text-sm">Slug</label>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 p-2 border rounded w-full" />
      </div>
      <div>
        <label className="block text-sm">Image URL</label>
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-1 p-2 border rounded w-full" />
      </div>
      <div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}
