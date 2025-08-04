import { BaseApiService } from './baseApi';

export class ProfileApiService extends BaseApiService {
  async uploadProfilePhoto(file: File) {
    const formData = new FormData();
    formData.append('profileImage', file);

    return this.request('/profile/photo', {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: formData,
    });
  }

  async deleteProfilePhoto() {
    return this.request('/profile/photo', {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  }

  async updateProfile(values: any){
    return this.request("/profile", {
        method: "PUT",
        headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
    })
  }
}

export const profileApi = new ProfileApiService(); 