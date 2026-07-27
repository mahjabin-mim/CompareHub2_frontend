export type AuthResponse = {
  userId: string;
  email: string;
  token: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
