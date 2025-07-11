import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';
import { createUser } from '@/server/user/service';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { email, code, password } = await req.json();
  if (!email || !code || !password) {
    return NextResponse.json({ error: '参数不完整' }, { status: 400 });
  }

  // 查找验证码
  const record = await prisma.emailVerificationCode.findFirst({
    where: {
      email,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });
  if (!record) {
    return NextResponse.json({ error: '验证码无效或已过期' }, { status: 400 });
  }

  // 检查用户是否已存在
  const exist = await prisma.user.findUnique({ where: { username: email } });
  if (exist) {
    return NextResponse.json({ error: '用户已存在' }, { status: 400 });
  }

  // 密码加密
  const passwordHash = await bcrypt.hash(password, 10);

  // 创建用户
  await createUser({
    email,
    password,
    source: 'email',
  });

  // 标记验证码为已使用
  await prisma.emailVerificationCode.update({
    where: { id: record.id },
    data: { used: true },
  });

  return NextResponse.json({ message: '注册成功' });
} 