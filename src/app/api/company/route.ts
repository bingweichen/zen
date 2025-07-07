import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  // 获取当前登录用户
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  const userId = session.user.id;

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

  return NextResponse.json(allCompanies);
}

export async function POST(req: NextRequest) {
  // 获取当前登录用户
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  const userId = session.user.id;

  // 解析请求体，获取公司信息
  const body = await req.json();
  const { name, description, address, phone, email, website, taxNumber, businessLicense } = body;
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: '公司名称不能为空' }, { status: 400 });
  }

  // 检查公司名称是否已存在
  const existingCompany = await prisma.company.findUnique({
    where: { name },
  });
  
  if (existingCompany) {
    return NextResponse.json({ error: '公司名称已存在' }, { status: 400 });
  }

  // 创建公司
  try {
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
    return NextResponse.json(company);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: '创建公司失败', detail: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  // 获取当前登录用户
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  const userId = session.user.id;

  // 解析请求体
  const body = await req.json();
  const { id, name, description, address, phone, email, website, taxNumber, businessLicense } = body;
  
  if (!id || !name || typeof name !== 'string') {
    return NextResponse.json({ error: '公司ID和名称不能为空' }, { status: 400 });
  }

  // 检查用户是否有权限修改该公司（必须是公司所有者）
  const company = await prisma.company.findFirst({
    where: { 
      id: parseInt(id),
      ownerId: userId 
    },
  });

  if (!company) {
    return NextResponse.json({ error: '公司不存在或无权限修改' }, { status: 403 });
  }

  // 检查新名称是否与其他公司重复
  const existingCompany = await prisma.company.findFirst({
    where: { 
      name,
      id: { not: parseInt(id) }
    },
  });
  
  if (existingCompany) {
    return NextResponse.json({ error: '公司名称已存在' }, { status: 400 });
  }

  // 更新公司
  try {
    const updatedCompany = await prisma.company.update({
      where: { id: parseInt(id) },
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
    return NextResponse.json(updatedCompany);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: '更新公司失败', detail: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  // 获取当前登录用户
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  const userId = session.user.id;

  // 从URL参数获取公司ID
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: '公司ID不能为空' }, { status: 400 });
  }

  // 检查用户是否有权限删除该公司（必须是公司所有者）
  const company = await prisma.company.findFirst({
    where: { 
      id: parseInt(id),
      ownerId: userId 
    },
  });

  if (!company) {
    return NextResponse.json({ error: '公司不存在或无权限删除' }, { status: 403 });
  }

  // 删除公司（需要先删除相关的外键记录）
  try {
    // 使用事务确保数据一致性
    await prisma.$transaction(async (tx) => {
      // 删除员工记录
      await tx.employee.deleteMany({
        where: { companyId: parseInt(id) },
      });
      
      // 删除角色权限记录
      await tx.rolePermission.deleteMany({
        where: {
          role: { companyId: parseInt(id) }
        },
      });
      
      // 删除角色记录
      await tx.role.deleteMany({
        where: { companyId: parseInt(id) },
      });
      
      // 删除公司
      await tx.company.delete({
        where: { id: parseInt(id) },
      });
    });
    
    return NextResponse.json({ message: '公司删除成功' });
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: '删除公司失败', detail: errorMsg }, { status: 500 });
  }
} 