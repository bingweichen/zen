import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export interface CreateUserParams {
  email: string;
  password?: string; // 可选，第三方登录可不传
  source?: string;
}

export async function createUser({ email, password, source = 'email' }: CreateUserParams) {
  let passwordHash = '';
  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  } else {
    // 第三方登录生成随机密码
    passwordHash = Math.random().toString(36).slice(-12);
  }
  return prisma.user.create({
    data: {
      username: email,
      email,
      password: passwordHash,
      source,
      createdAt: new Date(),
    },
  });
} 