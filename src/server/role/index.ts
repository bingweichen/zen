// 一些默认角色

import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export const DEFAULT_ROLES = [
  { name: 'admin', description: '公司管理员' },
  { name: 'staff', description: '公司员工' },
];

/**
 * 为指定公司创建默认角色
 * @param companyId 公司ID
 */
export async function createDefaultRolesForCompany(companyId: number) {
  return prisma.role.createMany({
    data: DEFAULT_ROLES.map(role => ({
      ...role,
      companyId,
    })),
  });
}

