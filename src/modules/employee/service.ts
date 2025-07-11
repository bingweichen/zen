import { EmployeeWithUserAndRole } from '@/server/employee';

// 基础API响应类型
interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// 获取员工列表
export const fetchEmployees = async (): Promise<EmployeeWithUserAndRole[]> => {
  const res = await fetch('/api/company/employees');
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || '获取员工列表失败');
  }
  const result = await res.json();
  return result.data || [];
};

// 邀请员工
export const inviteEmployee = async (email: string): Promise<ApiResponse<unknown>> => {
  const res = await fetch('/api/company/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || '邀请员工失败');
  }
  return res.json();
};

// 移除员工
export const removeEmployee = async (employeeId: number): Promise<ApiResponse<void>> => {
  const res = await fetch(`/api/company/employees?employeeId=${employeeId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || '移除员工失败');
  }
  return res.json();
};

// 修改员工角色
export const updateEmployeeRole = async (employeeId: number, roleId: number): Promise<ApiResponse<unknown>> => {
  const res = await fetch('/api/company/employees', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, roleId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || '修改员工角色失败');
  }
  return res.json();
};
