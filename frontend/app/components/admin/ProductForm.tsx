// components/admin/ProductForm.tsx
'use client';
import { useState, useEffect } from 'react';
import type { Product } from '../../../types/product';

export default function ProductForm({
  initial,
  onSubmit,
  categories,
}: {
  initial?: Partial<Product>;
  categories?: { id: string; name: string }[];
  onSubmit: (form: FormData) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [price, setPrice] = useState(initial?.price || 0);
  const [description, setDescription] = useState(initial?.description || '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId || '');
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!categoryId && categories?.length) setCategoryId(categories[0].id);
  }, [categories]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', title);
    fd.append('slug', slug);
    fd.append('price', String(price));
    fd.append('description', description);
    fd.append('categoryId', categoryId);
    if (images) {
      Array.from(images).forEach((f) => fd.append('images', f));
    }
    setLoading(true);
    try {
      await onSubmit(fd);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 p-2 border rounded w-full" />
      </div>
      <div>
        <label className="block text-sm">Slug</label>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 p-2 border rounded w-full" />
      </div>
      <div>
        <label className="block text-sm">Price</label>
        <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="mt-1 p-2 border rounded w-full" />
      </div>
      <div>
        <label className="block text-sm">Category</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1 p-2 border rounded w-full">
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 p-2 border rounded w-full" />
      </div>
      <div>
        <label className="block text-sm">Images (multiple)</label>
        <input type="file" multiple onChange={(e) => setImages(e.target.files)} className="mt-1" />
      </div>
      <div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}
