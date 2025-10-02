import { User } from './user.interface';

// Authentication request interfaces
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// Authentication response interfaces
export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

// API response interfaces
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  violations?: string[];
}

export interface ErrorResponse {
  message: string;
  violations?: string[];
  statusCode?: number;
}

// Success message response
export interface SuccessResponse {
  message: string;
}
