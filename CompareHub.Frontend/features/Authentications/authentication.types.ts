export type AuthResponse = {
  userId: string;
  email: string;
  token: string;
  fullName?: string;
};

export type AuthUser = {
  email: string;
  fullName: string;
};

export type AuthConfig = {
  googleClientId: string | null;
};

export type AccountSettings = {
  email: string;
  fullName: string;
  emailAlertsEnabled: boolean;
  hasPassword: boolean;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
