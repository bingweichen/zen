// 公司相关类型定义
export interface Company {
  id: number;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxNumber?: string;
  businessLicense?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  currentCompany?: Company;
} 