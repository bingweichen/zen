import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// 获取当前选择的公司
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { currentCompany: true },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({ currentCompany: user.currentCompany });
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: '获取当前公司失败', detail: errorMsg }, { status: 500 });
  }
}

// 设置当前公司
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json();
  const { companyId } = body;
  
  if (!companyId) {
    return NextResponse.json({ error: '公司ID不能为空' }, { status: 400 });
  }

  try {
    // 检查用户是否有权限选择该公司（必须是公司所有者或员工）
    const company = await prisma.company.findFirst({
      where: {
        id: parseInt(companyId),
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
      return NextResponse.json({ error: '公司不存在或无权限访问' }, { status: 403 });
    }

    // 更新用户的当前公司
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { currentCompanyId: parseInt(companyId) },
      include: { currentCompany: true },
    });

    return NextResponse.json({ 
      message: '当前公司设置成功',
      currentCompany: updatedUser.currentCompany 
    });
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: '设置当前公司失败', detail: errorMsg }, { status: 500 });
  }
} 