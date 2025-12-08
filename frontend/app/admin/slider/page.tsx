'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sliderAPI, SliderImage } from '../../lib/api/slider';

export default function AdminSliderPage() {
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    altText: '',
    title: '',
    subtitle: '',
    link: '',
    order: 0,
    isActive: true
  });

  const fetchSliderImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await sliderAPI.getSliderImages(true);
      
      if (result.success && result.data) {
        setSliderImages(result.data);
      } else {
        setError(result.error || 'Failed to load slider images');
      }
    } catch (error) {
      console.error('Error fetching slider images:', error);
      setError('Failed to load slider images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliderImages();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    const file = fileInput.files?.[0];
    
    if (!file) {
      alert('Please select an image file');
      return;
    }

    if (!formData.altText.trim()) {
      alert('Please enter alt text for the image');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await sliderAPI.uploadSlider(file, {
        ...formData,
        order: parseInt(formData.order.toString())
      });

      if (result.success) {
        alert('Slider image uploaded successfully!');
        setFormData({
          altText: '',
          title: '',
          subtitle: '',
          link: '',
          order: 0,
          isActive: true
        });
        fileInput.value = '';
        fetchSliderImages();
      } else {
        throw new Error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slider image?')) {
      return;
    }

    try {
      const result = await sliderAPI.deleteSlider(id);

      if (result.success) {
        alert('Slider image deleted successfully!');
        fetchSliderImages();
      } else {
        throw new Error(result.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image. Please try again.');
    }
  };

  const toggleImageStatus = async (id: string, currentStatus: boolean) => {
    try {
      const result = await sliderAPI.updateSlider(id, { isActive: !currentStatus });

      if (result.success) {
        fetchSliderImages();
      } else {
        throw new Error(result.error || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating image status:', error);
      alert('Error updating image status. Please try again.');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-8 max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Slider Management</h1>
        <p className="text-gray-600">Upload and manage homepage slider images</p>
        <Link href="/admin" className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block">
          ← Back to Admin Panel
        </Link>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Upload Form */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload New Slider Image</h2>
        
        <form onSubmit={handleImageUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-2">
                Image File *
              </label>
              <input
                type="file"
                id="imageFile"
                accept="image/*"
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">Max file size: 5MB. Recommended: 1920x1080px</p>
            </div>

            <div>
              <label htmlFor="altText" className="block text-sm font-medium text-gray-700 mb-2">
                Alt Text *
              </label>
              <input
                type="text"
                id="altText"
                name="altText"
                value={formData.altText}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Description for accessibility"
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Slide title (optional)"
              />
            </div>

            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Slide subtitle (optional)"
              />
            </div>

            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
                Link URL
              </label>
              <input
                type="url"
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="https://example.com (optional)"
              />
            </div>

            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active (show on homepage)
            </label>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>
      </section>

      {/* Existing Images */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          Existing Slider Images ({sliderImages.length})
        </h2>
        
        {sliderImages.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">No slider images uploaded yet.</p>
            <p className="text-gray-400 text-sm mt-2">Upload your first image using the form above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sliderImages.map((image) => (
              <div key={image._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={image.imageUrl}
                    alt={image.altText}
                    className="w-full h-full object-cover"
                  />
                  {!image.isActive && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <span className="text-white font-bold bg-red-500 px-3 py-1 rounded-lg">INACTIVE</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {image.title || 'No Title'}
                  </h3>
                  <p className="text-sm text-gray-600 truncate mb-2">{image.altText}</p>
                  
                  {image.link && (
                    <p className="text-xs text-blue-600 truncate mb-2" title={image.link}>
                      Link: {image.link}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Order: {image.order}</span>
                    <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => toggleImageStatus(image._id, image.isActive)}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        image.isActive 
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {image.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    <button
                      onClick={() => deleteImage(image._id)}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}