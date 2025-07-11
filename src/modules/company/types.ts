import type { CompanyType } from "./server/type";

// 重新导出 CompanyType
export type { CompanyType };

// API 响应接口
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  currentCompany?: CompanyType;
}