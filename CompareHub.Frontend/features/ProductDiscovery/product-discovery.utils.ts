import { StoreProductResult } from './product-discovery.types';

export type ProductSortOrder = 'best-match' | 'price-asc' | 'price-desc';

const toTokens = (value: string) =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 2);

// Share of the query's words that appear in the product name, from 0 to 1.
export const getRelevance = (productName: string, query: string) => {
  const queryTokens = [...new Set(toTokens(query))];
  if (queryTokens.length === 0) {
    return 1;
  }

  const name = productName.toLowerCase();
  return queryTokens.filter((token) => name.includes(token)).length / queryTokens.length;
};

export const sortProducts = (products: StoreProductResult[], order: ProductSortOrder, query: string) => {
  const sorted = [...products];
  if (order === 'price-asc') {
    return sorted.sort((a, b) => a.price - b.price);
  }

  if (order === 'price-desc') {
    return sorted.sort((a, b) => b.price - a.price);
  }

  const relevance = new Map(sorted.map((product) => [product, getRelevance(product.productName, query)]));
  return sorted.sort((a, b) => relevance.get(b)! - relevance.get(a)! || a.price - b.price);
};

export const filterByStore = (products: StoreProductResult[], storeKey: string | null) =>
  storeKey ? products.filter((product) => product.storeKey === storeKey) : products;
