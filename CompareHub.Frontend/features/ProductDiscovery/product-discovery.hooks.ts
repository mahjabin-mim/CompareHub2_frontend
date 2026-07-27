'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productDiscoveryService } from './product-discovery.services';
import { UpsertProductSourcePayload } from './product-discovery.types';

export const useProductSearch = (query: string) =>
  useQuery({
    queryKey: ['products', query],
    queryFn: () => productDiscoveryService.searchProducts(query),
    enabled: query.trim().length > 0
  });

export const useProductSources = () =>
  useQuery({
    queryKey: ['product-sources'],
    queryFn: productDiscoveryService.getProductSources
  });

export const useCreateProductSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertProductSourcePayload) => productDiscoveryService.createProductSource(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-sources'] });
    }
  });
};

export const useUpdateProductSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertProductSourcePayload }) =>
      productDiscoveryService.updateProductSource(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-sources'] });
    }
  });
};

export const useDeleteProductSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productDiscoveryService.deleteProductSource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-sources'] });
    }
  });
};

export const useTestProductSourceConnection = () => {
  return useMutation({
    mutationFn: (payload: {
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
    }) => productDiscoveryService.testProductSourceConnection(payload),
    onSuccess: () => {
    }
  });
};
