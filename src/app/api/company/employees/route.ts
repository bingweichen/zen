import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import { PrismaClient } from "@/generated/prisma/index";
const prisma = new PrismaClient();

// 工具函数：判断当前用户是否为公司管理员
async function isAdmin(userId: number, companyId: number) {
  const employee = await prisma.employee.findFirst({
    where: { userId, companyId },
    include: { role: true },
  });
  return employee?.role?.name === 'admin';
}

// 获取当前用户的公司ID（假设已存于 session）
async function getCurrentCompanyId(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.currentCompanyId;
}

// GET: 获取公司员工列表
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ code: 401, message: '未登录' }, { status: 401 });
  }
  const userId = session.user.id;
  const companyId = await getCurrentCompanyId(userId);
  if (!companyId) {
    return NextResponse.json({ code: 400, message: '未选择公司' }, { status: 400 });
  }
  const employees = await prisma.employee.findMany({
    where: { companyId },
    include: {
      user: { select: { id: true, username: true } },
      role: { select: { id: true, name: true, description: true } },
    },
  });
  return NextResponse.json({ code: 0, data: employees, message: 'ok' });
}

// POST: 添加公司员工
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ code: 401, message: '未登录' }, { status: 401 });
  }
  const userId = session.user.id;
  const companyId = await getCurrentCompanyId(userId);
  if (!companyId) {
    return NextResponse.json({ code: 400, message: '未选择公司' }, { status: 400 });
  }
  if (!(await isAdmin(userId, companyId))) {
    return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 });
  }
  const body = await req.json();
  const { email } = body;
  if (!email) {
    return NextResponse.json({ code: 400, message: '参数错误，缺少邮箱' }, { status: 400 });
  }
  // 查找用户（通过邮箱）
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ code: 404, message: '用户不存在' }, { status: 404 });
  }
  // 检查是否已是员工
  const exist = await prisma.employee.findFirst({ where: { userId: user.id, companyId } });
  if (exist) {
    return NextResponse.json({ code: 409, message: '该用户已是员工' }, { status: 409 });
  }
  // 获取默认角色
  const defaultRole = await prisma.role.findFirst({ where: { companyId } });
  if (!defaultRole) {
    return NextResponse.json({ code: 400, message: '未找到默认角色' }, { status: 400 });
  }
  const employee = await prisma.employee.create({
    data: { userId: user.id, companyId, roleId: defaultRole.id },
  });
  return NextResponse.json({ code: 0, data: employee, message: '添加成功' });
}

// DELETE: 移除公司员工
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ code: 401, message: '未登录' }, { status: 401 });
  }
  const userId = session.user.id;
  const companyId = await getCurrentCompanyId(userId);
  if (!companyId) {
    return NextResponse.json({ code: 400, message: '未选择公司' }, { status: 400 });
  }
  if (!(await isAdmin(userId, companyId))) {
    return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const employeeId = Number(searchParams.get('employeeId'));
  if (!employeeId) {
    return NextResponse.json({ code: 400, message: '参数错误' }, { status: 400 });
  }
  await prisma.employee.delete({ where: { id: employeeId } });
  return NextResponse.json({ code: 0, message: '移除成功' });
}

// PATCH: 修改员工角色
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ code: 401, message: '未登录' }, { status: 401 });
  }
  const userId = session.user.id;
  const companyId = await getCurrentCompanyId(userId);
  if (!companyId) {
    return NextResponse.json({ code: 400, message: '未选择公司' }, { status: 400 });
  }
  if (!(await isAdmin(userId, companyId))) {
    return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 });
  }
  const body = await req.json();
  const { employeeId, roleId } = body;
  if (!employeeId || !roleId) {
    return NextResponse.json({ code: 400, message: '参数错误' }, { status: 400 });
  }
  const employee = await prisma.employee.update({
    where: { id: employeeId },
    data: { roleId },
  });
  return NextResponse.json({ code: 0, data: employee, message: '角色修改成功' });
} 