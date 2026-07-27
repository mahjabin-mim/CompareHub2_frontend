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
