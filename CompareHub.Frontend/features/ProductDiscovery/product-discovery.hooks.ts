'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { productDiscoveryService } from './product-discovery.services';
import {
  PublicSearchStart,
  PublicSourceResult,
  StoreProductResult,
  StoreProgress,
  UpsertProductSourcePayload
} from './product-discovery.types';

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

export const usePublicProductSearchStream = () => {
  const [query, setQuery] = useState('');
  const [stores, setStores] = useState<StoreProgress[]>([]);
  const [results, setResults] = useState<StoreProductResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const eventSourceRef = useRef<EventSource | null>(null);

  const closeStream = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  }, []);

  useEffect(() => closeStream, [closeStream]);

  const search = useCallback(
    (rawQuery: string) => {
      const trimmedQuery = rawQuery.trim();
      if (!trimmedQuery) {
        return;
      }

      closeStream();
      setQuery(trimmedQuery);
      setStores([]);
      setResults([]);
      setError('');
      setIsSearching(true);

      const eventSource = productDiscoveryService.streamPublicProducts(trimmedQuery);
      eventSourceRef.current = eventSource;
      let started = false;

      eventSource.addEventListener('start', (event) => {
        started = true;
        const data = JSON.parse((event as MessageEvent<string>).data) as PublicSearchStart;
        setStores(data.sources.map((sourceWebsite) => ({ sourceWebsite, status: 'searching', resultCount: 0 })));
      });

      eventSource.addEventListener('source', (event) => {
        const data = JSON.parse((event as MessageEvent<string>).data) as PublicSourceResult;
        setStores((current) =>
          current.map((store) =>
            store.sourceWebsite === data.sourceWebsite
              ? { ...store, status: 'done', resultCount: data.results.length }
              : store
          )
        );
        setResults((current) => [
          ...current,
          ...data.results.map((product) => ({ ...product, storeKey: data.sourceWebsite }))
        ]);
      });

      eventSource.addEventListener('done', () => {
        closeStream();
        setIsSearching(false);
      });

      eventSource.onerror = () => {
        // EventSource reconnects on its own after an error, which would rerun the whole search.
        closeStream();
        setIsSearching(false);
        setStores((current) =>
          current.map((store) => (store.status === 'searching' ? { ...store, status: 'failed' } : store))
        );
        setError(
          started
            ? 'The connection dropped before every store answered. Showing the results found so far.'
            : 'Unable to reach the search server right now. Please try again in a moment.'
        );
      };
    },
    [closeStream]
  );

  return { query, stores, results, isSearching, error, search };
};
