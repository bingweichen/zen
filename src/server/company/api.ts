import { PrismaClient } from '@/generated/prisma';
import type { CompanyType, CreateCompanyData, UpdateCompanyData } from './type';
import { createDefaultRolesForCompany, DEFAULT_ROLES } from '../role';

const prisma = new PrismaClient();

// 获取用户所属的所有公司
export async function getUserCompanies(userId: number): Promise<CompanyType[]> {
  // 查询用户所属公司（作为owner或员工）
  const ownedCompanies = await prisma.company.findMany({
    where: { ownerId: userId },
  });
  const employeeCompanies = await prisma.company.findMany({
    where: {
      employees: {
        some: { userId },
      },
    },
  });

  // 合并去重
  const allCompanies = [
    ...ownedCompanies,
    ...employeeCompanies.filter(
      (ec) => !ownedCompanies.some((oc) => oc.id === ec.id)
    ),
  ];

  return allCompanies;
}

// 创建公司
export async function createCompany(userId: number, companyData: CreateCompanyData): Promise<CompanyType> {
  const { name, description, address, phone, email, website, taxNumber, businessLicense } = companyData;
  
  if (!name || typeof name !== 'string') {
    throw new Error('公司名称不能为空');
  }

  // 检查公司名称是否已存在
  const existingCompany = await prisma.company.findUnique({
    where: { name },
  });
  
  if (existingCompany) {
    throw new Error('公司名称已存在');
  }

  // 创建公司
  try {
    // 1. 创建公司
    const company = await prisma.company.create({
      data: {
        name,
        ownerId: userId,
        description: description ?? null,
        address: address ?? null,
        phone: phone ?? null,
        email: email ?? null,
        website: website ?? null,
        taxNumber: taxNumber ?? null,
        businessLicense: businessLicense ?? null,
      },
    });

    // 2. 创建默认角色
    await createDefaultRolesForCompany(company.id);
    // 获取 admin 角色
    const adminRole = await prisma.role.findFirst({
      where: {
        companyId: company.id,
        name: DEFAULT_ROLES[0].name, // 'admin'
      },
    });
    if (!adminRole) throw new Error('默认管理员角色创建失败');

    // 3. 创建员工记录（创建者为 admin）
    await prisma.employee.create({
      data: {
        userId: userId,
        companyId: company.id,
        roleId: adminRole.id,
      },
    });

    return company;
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    throw new Error(`创建公司失败: ${errorMsg}`);
  }
}

// 更新公司
export async function updateCompany(userId: number, companyData: UpdateCompanyData): Promise<CompanyType> {
  const { id, name, description, address, phone, email, website, taxNumber, businessLicense } = companyData;
  
  if (!id || !name || typeof name !== 'string') {
    throw new Error('公司ID和名称不能为空');
  }

  // 检查用户是否有权限修改该公司（必须是公司所有者）
  const company = await prisma.company.findFirst({
    where: { 
      id: parseInt(id.toString()),
      ownerId: userId 
    },
  });

  if (!company) {
    throw new Error('公司不存在或无权限修改');
  }

  // 检查新名称是否与其他公司重复
  const existingCompany = await prisma.company.findFirst({
    where: { 
      name,
      id: { not: parseInt(id.toString()) }
    },
  });
  
  if (existingCompany) {
    throw new Error('公司名称已存在');
  }

  // 更新公司
  try {
    const updatedCompany = await prisma.company.update({
      where: { id: parseInt(id.toString()) },
      data: {
        name,
        description: description ?? null,
        address: address ?? null,
        phone: phone ?? null,
        email: email ?? null,
        website: website ?? null,
        taxNumber: taxNumber ?? null,
        businessLicense: businessLicense ?? null,
      },
    });
    return updatedCompany;
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    throw new Error(`更新公司失败: ${errorMsg}`);
  }
}

// 删除公司
export async function deleteCompany(userId: number, companyId: string | number): Promise<{ message: string }> {
  if (!companyId) {
    throw new Error('公司ID不能为空');
  }

  // 检查用户是否有权限删除该公司（必须是公司所有者）
  const company = await prisma.company.findFirst({
    where: { 
      id: parseInt(companyId.toString()),
      ownerId: userId 
    },
  });

  if (!company) {
    throw new Error('公司不存在或无权限删除');
  }

  // 删除公司（需要先删除相关的外键记录）
  try {
    // 使用事务确保数据一致性
    await prisma.$transaction(async (tx) => {
      // 删除员工记录
      await tx.employee.deleteMany({
        where: { companyId: parseInt(companyId.toString()) },
      });
      
      // 删除角色权限记录
      await tx.rolePermission.deleteMany({
        where: {
          role: { companyId: parseInt(companyId.toString()) }
        },
      });
      
      // 删除角色记录
      await tx.role.deleteMany({
        where: { companyId: parseInt(companyId.toString()) },
      });
      
      // 删除公司
      await tx.company.delete({
        where: { id: parseInt(companyId.toString()) },
      });
    });
    
    return { message: '公司删除成功' };
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    throw new Error(`删除公司失败: ${errorMsg}`);
  }
}

// 获取单个公司信息
export async function getCompany(userId: number, companyId: string | number): Promise<CompanyType> {
  if (!companyId) {
    throw new Error('公司ID不能为空');
  }

  const company = await prisma.company.findFirst({
    where: { 
      id: parseInt(companyId.toString()),
      OR: [
        { ownerId: userId },
        {
          employees: {
            some: { userId }
          }
        }
      ]
    },
  });

  if (!company) {
    throw new Error('公司不存在或无权限访问');
  }

  return company;
}

// 获取当前选择的公司
export async function getCurrentCompany(userId: number): Promise<{ currentCompany: CompanyType | null }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { currentCompany: true },
  });

  if (!user) {
    throw new Error('用户不存在');
  }

  return { currentCompany: user.currentCompany };
}

// 设置当前公司
export async function setCurrentCompany(userId: number, companyId: number): Promise<{ message: string; currentCompany: CompanyType | null }> {
  if (!companyId) {
    throw new Error('公司ID不能为空');
  }

  // 检查用户是否有权限选择该公司（必须是公司所有者或员工）
  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
      OR: [
        { ownerId: userId },
        {
          employees: {
            some: { userId }
          }
        }
      ]
    },
  });

  if (!company) {
    throw new Error('公司不存在或无权限访问');
  }

  // 更新用户的当前公司
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { currentCompanyId: companyId },
    include: { currentCompany: true },
  });

  return { 
    message: '当前公司设置成功',
    currentCompany: updatedUser.currentCompany 
  };
}
