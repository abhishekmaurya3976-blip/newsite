export interface SliderImage {
  _id: string;
  imageUrl: string;
  publicId: string;
  altText: string;
  title?: string;
  subtitle?: string;
  link?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class SliderAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }

  async getSliderImages(admin: boolean = false): Promise<ApiResponse<SliderImage[]>> {
    try {
      const url = `${this.baseUrl}/slider${admin ? '?admin=true' : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch slider images: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching slider images:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch slider images'
      };
    }
  }

  async uploadSlider(
    file: File, 
    sliderData: Omit<SliderImage, '_id' | 'imageUrl' | 'publicId' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<SliderImage>> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('altText', sliderData.altText);
      formData.append('title', sliderData.title || '');
      formData.append('subtitle', sliderData.subtitle || '');
      formData.append('link', sliderData.link || '');
      formData.append('order', sliderData.order.toString());
      formData.append('isActive', sliderData.isActive.toString());

      const response = await fetch(`${this.baseUrl}/slider`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading slider:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload slider'
      };
    }
  }

  async updateSlider(id: string, data: Partial<SliderImage>): Promise<ApiResponse<SliderImage>> {
    try {
      const response = await fetch(`${this.baseUrl}/slider/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Update failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating slider:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update slider'
      };
    }
  }

  async deleteSlider(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/slider/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Delete failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting slider:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete slider'
      };
    }
  }
}

export const sliderAPI = new SliderAPI();