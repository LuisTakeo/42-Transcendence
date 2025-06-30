// Common API response types
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}

export interface SimpleResponse<T> {
  success: boolean;
  data: T[];
  count: number;
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
}
