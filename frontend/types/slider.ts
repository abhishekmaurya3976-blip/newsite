export interface SliderItem {
  _id?: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SliderResponse {
  success: boolean;
  data: SliderItem[];
}