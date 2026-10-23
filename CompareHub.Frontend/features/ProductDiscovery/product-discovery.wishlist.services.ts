import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from './product-discovery.types';
import type { AddWishlistRequest, AlertsResponse, WishlistItem } from './product-discovery.wishlist';

export const wishlistService = {
  async list(): Promise<WishlistItem[]> {
    const response = await apiClient.get<ApiResponse<WishlistItem[]>>('/api/v1/wishlist');
    return response.data.data;
  },

  async add(request: AddWishlistRequest): Promise<WishlistItem> {
    const response = await apiClient.post<ApiResponse<WishlistItem>>('/api/v1/wishlist', request);
    return response.data.data;
  },

  async importItems(items: AddWishlistRequest[]): Promise<WishlistItem[]> {
    const response = await apiClient.post<ApiResponse<WishlistItem[]>>('/api/v1/wishlist/import', { items });
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/wishlist/${id}`);
  },

  async alerts(): Promise<AlertsResponse> {
    const response = await apiClient.get<ApiResponse<AlertsResponse>>('/api/v1/wishlist/alerts');
    return response.data.data;
  },

  async markAlertsRead(): Promise<void> {
    await apiClient.post('/api/v1/wishlist/alerts/read');
  }
};

export const pushService = {
  async publicKey(): Promise<string | null> {
    const response = await apiClient.get<ApiResponse<string | null>>('/api/v1/push/public-key');
    return response.data.data;
  },

  async subscribe(subscription: { endpoint: string; p256dh: string; auth: string }): Promise<void> {
    await apiClient.post('/api/v1/push/subscribe', subscription);
  },

  async unsubscribe(endpoint: string): Promise<void> {
    await apiClient.post('/api/v1/push/unsubscribe', { endpoint });
  }
};
