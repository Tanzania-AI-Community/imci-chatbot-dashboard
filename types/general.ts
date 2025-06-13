/**
 * Common response type for all server actions
 */
export type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Common pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Common sort parameters
 */
export interface SortParams {
  field: string;
  order: "asc" | "desc";
}

/**
 * Common filter parameters
 */
export interface FilterParams {
  field: string;
  value: string | number | boolean;
  operator?: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains" | "in";
}
