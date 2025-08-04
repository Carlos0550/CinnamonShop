export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  imagePath: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'CUSTOMER';
  isActive: boolean;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  onBoarding: boolean
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
} 