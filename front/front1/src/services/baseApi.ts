import type { ApiResponse } from '@/types';

// Clase padre para todas las operaciones de API
export class BaseApiService {
  protected baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Si el body es FormData, no establecer Content-Type para que el navegador lo haga automáticamente
    const headers: Record<string, string> = {}
    
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }
    
    // Agregar headers de autenticación
    const authHeaders = this.getAuthHeaders()
    
    const config: RequestInit = {
      headers: {
        ...headers,
        ...authHeaders,
        ...options.headers,
      },
      ...options,
    };



    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Error en la petición');
      }
      
      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error desconocido');
    }
  }

  protected getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
} 