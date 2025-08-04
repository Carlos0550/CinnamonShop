import { BaseApiService } from './baseApi';

export class AuthApiService extends BaseApiService {
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request('/auth/profile', {
      headers: this.getAuthHeaders(),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async deactivateAccount() {
    return this.request('/auth/deactivate', {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  }
}

export const authApi = new AuthApiService(); 