import { BaseApiService } from './baseApi';

export interface BannerAction {
  type: 'product' | 'category' | 'url' | 'none';
  target?: string;
  title?: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  imagePath: string;
  isClickable: boolean;
  actionType: BannerAction | null;
  from: string | null;
  to: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerData {
  banner: File;
  isClickable: boolean;
  actionType?: BannerAction;
  from?: string;
  to?: string;
}

export class BannerApiService extends BaseApiService {
  async getBanners(): Promise<Banner[]> {
    const response = await this.request<Banner[]>('/banners');
    return response.data || [];
  }

  async uploadBanner(data: CreateBannerData): Promise<{ bannerId: string; imageUrl: string }> {
    const formData = new FormData();
    formData.append('banner', data.banner);
    formData.append('isClickable', data.isClickable.toString());
    
    if (data.actionType) {
      formData.append('actionType', JSON.stringify(data.actionType));
    }
    
    if (data.from) {
      formData.append('from', data.from);
    }
    
    if (data.to) {
      formData.append('to', data.to);
    }

    const response = await this.request<{ bannerId: string; imageUrl: string }>('/banners/upload', {
      method: 'POST',
      body: formData
    });

    return response.data;
  }

  async deleteBanner(bannerId: string): Promise<void> {
    await this.request(`/banners/${bannerId}`, {
      method: 'DELETE'
    });
  }

  async updateBanner(bannerId: string, updates: Partial<Banner>): Promise<void> {
    const response = await this.request(`/banners/${bannerId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }
}

export const bannerApi = new BannerApiService();
