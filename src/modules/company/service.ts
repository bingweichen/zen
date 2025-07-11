import { CompanyType as Company } from '@/server/company';

// 基础API响应类型
interface ApiResponse<T> {
  data?: T;
  error?: string;
//   currentCompany?: Company;
}

// 获取公司列表
export const fetchCompanies = async (): Promise<Company[]> => {
  const res = await fetch('/api/company');
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '获取公司列表失败');
  }
  return res.json();
};

// 获取当前选择的公司
export const fetchCurrentCompany = async (): Promise<{ currentCompany: Company | null }> => {
  const res = await fetch('/api/company/current');
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '获取当前公司失败');
  }
  return res.json();
};

// 创建公司
export const createCompany = async (values: Partial<Company>): Promise<ApiResponse<Company>> => {
  const res = await fetch('/api/company', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '创建公司失败');
  }
  return res.json();
};

// 修改公司
export const updateCompany = async (companyId: number, values: Partial<Company>): Promise<ApiResponse<Company>> => {
  const res = await fetch('/api/company', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: companyId, ...values }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '修改公司失败');
  }
  return res.json();
};

// 删除公司
export const deleteCompany = async (companyId: number): Promise<ApiResponse<void>> => {
  const res = await fetch(`/api/company?id=${companyId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '删除公司失败');
  }
  return res.json();
};

// 选择公司
export const selectCompany = async (companyId: number): Promise<{ currentCompany: Company }> => {
  const res = await fetch('/api/company/current', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '选择公司失败');
  }
  return res.json();
};
