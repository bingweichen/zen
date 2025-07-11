import type { CompanyType } from "./server/type";

// API 响应接口
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  currentCompany?: CompanyType;
}