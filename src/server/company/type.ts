import type { Company } from "@/generated/prisma";

// 公司相关类型定义
export type CompanyType = Company;

// 创建公司时的数据接口
export type CreateCompanyData = Pick<CompanyType, "name" | "description" | "address" | "phone" | "email" | "website" | "taxNumber" | "businessLicense">;

// 更新公司时的数据接口
export type UpdateCompanyData = Pick<CompanyType, "id" | "name" | "description" | "address" | "phone" | "email" | "website" | "taxNumber" | "businessLicense">;

