import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

// 通用用户认证函数
export async function getAuthenticatedUser(): Promise<number | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  return session.user.id;
}
