import { API_BASE_URL, apiClient } from '@/lib/api-client';
import { ApiResponse, ProductSearchResponse, ProductSource, UpsertProductSourcePayload } from './product-discovery.types';

export const productDiscoveryService = {
  async searchProducts(query: string): Promise<ProductSearchResponse> {
    const response = await apiClient.get<ApiResponse<ProductSearchResponse>>('/api/v1/products/search', {
      params: { query }
    });
    return response.data.data;
  },

  async searchKoreanMartProducts(query: string): Promise<ProductSearchResponse> {
    const response = await apiClient.get<ApiResponse<ProductSearchResponse>>('/api/v1/products/search/koreanmart', {
      params: { query }
    });
    return response.data.data;
  },

  async searchPublicProducts(query: string): Promise<ProductSearchResponse> {
    const response = await apiClient.get<ApiResponse<ProductSearchResponse>>('/api/v1/products/search/public', {
      params: { query }
    });
    return response.data.data;
  },

  // Server-sent events: "start" lists the stores, "source" arrives once per store, then "done".
  streamPublicProducts(query: string): EventSource {
    const params = new URLSearchParams({ query });
    return new EventSource(`${API_BASE_URL}/api/v1/products/search/public/stream?${params}`);
  },

  async getProductSources(): Promise<ProductSource[]> {
    const response = await apiClient.get<ApiResponse<ProductSource[]>>('/api/v1/product-sources');
    return response.data.data;
  },

  async createProductSource(payload: UpsertProductSourcePayload): Promise<ProductSource> {
    const response = await apiClient.post<ApiResponse<ProductSource>>('/api/v1/product-sources', payload);
    return response.data.data;
  },

  async updateProductSource(id: string, payload: UpsertProductSourcePayload): Promise<ProductSource> {
    const response = await apiClient.put<ApiResponse<ProductSource>>(`/api/v1/product-sources/${id}`, payload);
    return response.data.data;
  },

  async deleteProductSource(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/product-sources/${id}`);
  },

  async testProductSourceConnection(payload: {
    baseUrl: string;
    searchEndpoint: string;
    queryParamName: string;
    httpMethod: string;
    apiKey?: string;
    headersJson: string;
    namePath: string;
    pricePath: string;
    imagePath: string;
    productUrlPath: string;
    testQuery: string;
  }): Promise<{ success: boolean; message: string; resultCount: number }> {
    const response = await apiClient.post<ApiResponse<{ success: boolean; message: string; resultCount: number }>>(
      '/api/v1/product-sources/test-connection',
      payload
    );
    return response.data.data;
  }
};
