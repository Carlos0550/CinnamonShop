import type { Banner, Category, Product, ProductFilters, PaginatedResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Banners
  async getBanners(): Promise<Banner[]> {
    const response = await this.request<{ success: boolean; data: Banner[] }>('/banners');
    return response.data;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await this.request<{ success: boolean; data: Category[] }>('/categories');
    return response.data;
  }

  async getCategoryById(id: string): Promise<Category> {
    const response = await this.request<{ success: boolean; data: Category }>(`/categories/${id}`);
    return response.data;
  }

  // Products
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    const response = await this.request<{ success: boolean; data: Product[]; pagination?: any }>(endpoint);
    
    // Si no hay paginación, crear una respuesta por defecto
    if (!response.pagination) {
      return {
        success: true,
        message: 'Productos obtenidos exitosamente',
        data: response.data,
        pagination: {
          page: 1,
          limit: response.data.length,
          total: response.data.length,
          totalPages: 1
        }
      };
    }
    
    return {
      success: response.success,
      message: 'Productos obtenidos exitosamente',
      data: response.data,
      pagination: response.pagination
    };
  }

  async getProductById(id: string): Promise<Product> {
    const response = await this.request<{ success: boolean; data: Product }>(`/products/${id}`);
    return response.data;
  }

  async getProductsByCategory(categoryId: string, limit: number = 12): Promise<Product[]> {
    const response = await this.request<{ success: boolean; data: Product[] }>(`/categories/${categoryId}/products?limit=${limit}`);
    return response.data;
  }

  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    const response = await this.request<{ success: boolean; data: Product[] }>(`/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
