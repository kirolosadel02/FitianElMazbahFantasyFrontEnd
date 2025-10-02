// Pagination interfaces
export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Common HTTP options
export interface HttpOptions {
  headers?: { [key: string]: string };
  params?: { [key: string]: string | number | boolean };
}

// Loading state
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}
