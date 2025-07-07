import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// ====== 频率控制函数抽取 ======
async function checkEmailRateLimit(prisma: any, email: string) {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // 1分钟内只能请求1次
  const minuteCount = await prisma.emailVerificationCode.count({
    where: {
      email,
      createdAt: { gte: oneMinuteAgo },
    },
  });
  if (minuteCount >= 1) {
    return { limited: true, message: '请求过于频繁，请1分钟后再试' };
  }

  // 1小时内最多5次
  const hourCount = await prisma.emailVerificationCode.count({
    where: {
      email,
      createdAt: { gte: oneHourAgo },
    },
  });
  if (hourCount >= 5) {
    return { limited: true, message: '请求次数过多，请1小时后再试' };
  }

  return { limited: false };
}
// ====== 频率控制函数抽取结束 ======

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: '邮箱不能为空' }, { status: 400 });
  }

  // 调用频率控制函数
  const rateLimit = await checkEmailRateLimit(prisma, email);
  if (rateLimit.limited) {
    return NextResponse.json({ error: rateLimit.message }, { status: 429 });
  }

  // 生成6位数字验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // 有效期5分钟
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // 先删除该邮箱的所有验证码记录
  await prisma.emailVerificationCode.deleteMany({ where: { email } });

  // 存入数据库
  await prisma.emailVerificationCode.create({
    data: { email, code, expiresAt }
  });


  // 配置SMTP（这里用ethereal测试邮箱，生产请替换为真实服务）
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // 465 用 SSL
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // 发送邮件
  try {
    await transporter.verify();

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: '您的验证码',
      text: `您的验证码是：${code}，有效期5分钟。`
    });
  } catch (err) {
    console.error('发送邮件出错:', err);
    return NextResponse.json({ error: '邮件发送失败', detail: String(err) }, { status: 500 });
  }

  return NextResponse.json({ message: '验证码已发送' });
} 