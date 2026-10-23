import type { ProductGroup } from './product-discovery.grouping';

export type ProductSortOrder = 'best-match' | 'price-asc' | 'price-desc' | 'most-stores';

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

export const sortGroups = (groups: ProductGroup[], order: ProductSortOrder, query: string) => {
  const sorted = [...groups];
  if (order === 'price-asc') {
    return sorted.sort((a, b) => a.lowestPrice - b.lowestPrice);
  }

  if (order === 'price-desc') {
    return sorted.sort((a, b) => b.lowestPrice - a.lowestPrice);
  }

  if (order === 'most-stores') {
    return sorted.sort((a, b) => b.storeCount - a.storeCount || a.lowestPrice - b.lowestPrice);
  }

  // Among equally relevant products, ones sold in more stores are the ones worth comparing.
  const relevance = new Map(sorted.map((group) => [group, getRelevance(group.name, query)]));
  return sorted.sort(
    (a, b) => relevance.get(b)! - relevance.get(a)! || b.storeCount - a.storeCount || a.lowestPrice - b.lowestPrice
  );
};

export const filterGroupsByStore = (groups: ProductGroup[], storeKey: string | null) =>
  storeKey ? groups.filter((group) => group.offers.some((offer) => offer.storeKey === storeKey)) : groups;
