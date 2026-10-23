export type ProductResult = {
  productName: string;
  price: number;
  productUrl: string;
  imageUrl: string;
  sourceWebsite: string;
};

export type ProductSearchResponse = {
  query: string;
  results: ProductResult[];
  sourceChecks?: ProductSourceCheck[];
};

export type PublicSourceResult = {
  sourceWebsite: string;
  results: ProductResult[];
};

export type PublicSearchStart = {
  query: string;
  sources: string[];
};

export type StoreSearchStatus = 'searching' | 'done' | 'failed';

export type StoreProgress = {
  sourceWebsite: string;
  status: StoreSearchStatus;
  resultCount: number;
};

export type StoreProductResult = ProductResult & {
  // The store list's name for the source, which can differ from the scraper's sourceWebsite label.
  storeKey: string;
};

export type ProductSourceCheck = {
  sourceWebsite: string;
  isChecked: boolean;
  hasResults: boolean;
  resultCount: number;
};

export type ProductSource = {
  id: string;
  sourceName: string;
  sourceType: string;
  baseUrl: string;
  searchEndpoint: string;
  queryParamName: string;
  httpMethod: string;
  headersJson: string;
  namePath: string;
  pricePath: string;
  imagePath: string;
  productUrlPath: string;
  isActive: boolean;
  createdAt: string;
};

export type UpsertProductSourcePayload = {
  sourceName: string;
  sourceType: string;
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
  isActive: boolean;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
