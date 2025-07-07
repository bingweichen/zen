# 邮箱注册功能实现指南

本文档详细说明了如何在 Zen 系统中实现邮箱注册功能，包括用户注册、邮箱验证、密码登录等完整流程。

## 功能概述

邮箱注册功能将允许用户通过邮箱地址注册账户，并通过邮件验证来确保邮箱的有效性。该功能将与现有的 Google 登录功能并存，为用户提供多种登录方式。

## 实现步骤

### 1. 安装依赖包

```bash
# 安装密码加密库
npm install bcryptjs
npm install @types/bcryptjs --save-dev

# 安装邮件发送库
npm install nodemailer
npm install @types/nodemailer --save-dev
```

### 2. 环境变量配置

在 `.env.local` 文件中添加邮件服务配置：

```env
# 邮件服务配置
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# 应用配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

**注意：** 如果使用 Gmail，需要在 Google 账户设置中开启两步验证并生成应用专用密码。

### 3. 创建邮件服务工具

创建 `src/lib/email.ts` 文件：

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '验证您的邮箱地址',
    html: `
      <h1>欢迎注册 Zen 系统</h1>
      <p>请点击下面的链接验证您的邮箱地址：</p>
      <a href="${verificationUrl}">验证邮箱</a>
      <p>如果您没有注册账户，请忽略此邮件。</p>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '重置您的密码',
    html: `
      <h1>密码重置请求</h1>
      <p>请点击下面的链接重置您的密码：</p>
      <a href="${resetUrl}">重置密码</a>
      <p>如果您没有请求重置密码，请忽略此邮件。</p>
    `,
  });
};
```

### 4. 更新数据库模型

在 `prisma/schema.prisma` 中添加邮箱验证相关字段：

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String
  role      String   // 如 'admin' 或 'staff'
  source    String   @default("google") // 用户来源，如 'google'、'email' 等
  emailVerified DateTime? // 邮箱验证时间
  emailVerificationToken String? // 邮箱验证令牌
  passwordResetToken String? // 密码重置令牌
  passwordResetExpires DateTime? // 密码重置过期时间
  currentCompanyId Int? // 当前选择的公司ID
  createdAt DateTime @default(now())
  ownedCompanies Company[] @relation("CompanyOwner")
  employees Employee[]
  currentCompany Company? @relation("CurrentCompany", fields: [currentCompanyId], references: [id])
}
```

### 5. 创建注册 API 路由

创建 `src/app/api/auth/register/route.ts`：

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/index';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // 验证输入
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // 生成验证令牌
    const verificationToken = randomBytes(32).toString('hex');

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username: email,
        password: hashedPassword,
        role: 'staff',
        source: 'email',
        emailVerificationToken: verificationToken,
      },
    });

    // 发送验证邮件
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      { message: '注册成功，请查收验证邮件' },
      { status: 201 }
    );
  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
```

### 6. 创建邮箱验证 API 路由

创建 `src/app/api/auth/verify-email/route.ts`：

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/index';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: '无效的验证令牌' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: '无效的验证令牌' },
        { status: 400 }
      );
    }

    // 更新用户验证状态
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
      },
    });

    return NextResponse.json(
      { message: '邮箱验证成功' },
      { status: 200 }
    );
  } catch (error) {
    console.error('邮箱验证错误:', error);
    return NextResponse.json(
      { error: '验证失败，请稍后重试' },
      { status: 500 }
    );
  }
}
```

### 7. 更新 NextAuth 配置

更新 `src/app/api/auth/[...nextauth]/route.ts`，添加 Credentials provider：

```typescript
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@/generated/prisma/index";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.email },
        });

        if (!user || user.source !== 'email') {
          return null;
        }

        // 检查邮箱是否已验证
        if (!user.emailVerified) {
          throw new Error('请先验证您的邮箱地址');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.username,
          role: user.role,
        };
      }
    }),
  ],
  callbacks: {
    async signIn(params: {
      user: any;
      account: any;
      profile?: any;
    }) {
      const { user, account } = params;
      if (account?.provider === "google" && user?.email) {
        // 检查用户是否已存在
        const exist = await prisma.user.findUnique({
          where: { username: user.email },
        });
        if (!exist) {
          // 首次登录，创建用户
          await prisma.user.create({
            data: {
              username: user.email,
              password: randomBytes(16).toString("hex"), // 随机密码
              role: "staff",
              source: "google",
              emailVerified: new Date(), // Google 用户默认已验证
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }: { token: any; user: any; account: any }) {
      if (account && user) {
        // 从数据库获取完整的用户信息
        const dbUser = await prisma.user.findUnique({
          where: { username: user.email || user.username },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && token.id) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### 8. 创建注册页面

创建 `src/app/register/page.tsx`：

```typescript
"use client";
import { useState } from "react";
import { Card, Typography, Button, Form, Input, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          name: values.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('注册成功！请查收验证邮件');
      } else {
        message.error(data.error || '注册失败');
      }
    } catch (error) {
      message.error('注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, textAlign: 'center', boxShadow: '0 2px 8px #f0f1f2' }}>
        <Typography.Title level={2} style={{ marginBottom: 32 }}>注册 Zen 账户</Typography.Title>
        
        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="姓名" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="邮箱" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="确认密码" 
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              style={{ width: '100%' }}
              loading={loading}
            >
              注册
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 16 }}>
          已有账户？ <Link href="/login">立即登录</Link>
        </div>
      </Card>
    </div>
  );
}
```

### 9. 更新登录页面

更新 `src/app/login/page.tsx`，添加邮箱登录功能：

```typescript
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Card, Typography, Button, Form, Input, message, Divider } from "antd";
import { GoogleOutlined, UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        message.error(result.error);
      } else {
        window.location.href = '/home';
      }
    } catch (error) {
      message.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, textAlign: 'center', boxShadow: '0 2px 8px #f0f1f2' }}>
        <Typography.Title level={2} style={{ marginBottom: 32 }}>登录到 Zen</Typography.Title>
        
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="邮箱" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码" 
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              style={{ width: '100%' }}
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider>或</Divider>

        <Button
          icon={<GoogleOutlined />}
          size="large"
          style={{ width: '100%' }}
          onClick={() => signIn('google', { callbackUrl: '/home' })}
        >
          使用 Google 登录
        </Button>

        <div style={{ marginTop: 16 }}>
          还没有账户？ <Link href="/register">立即注册</Link>
        </div>
      </Card>
    </div>
  );
}
```

### 10. 创建邮箱验证页面

创建 `src/app/verify-email/page.tsx`：

```typescript
"use client";
import { useEffect, useState } from "react";
import { Card, Typography, Button, Result } from "antd";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('无效的验证链接');
    }
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('邮箱验证成功！');
      } else {
        setStatus('error');
        setMessage(data.error || '验证失败');
      }
    } catch (error) {
      setStatus('error');
      setMessage('验证失败，请稍后重试');
    }
  };

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
        <Card style={{ width: 400, textAlign: 'center' }}>
          <Typography.Title level={3}>正在验证邮箱...</Typography.Title>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, textAlign: 'center' }}>
        <Result
          status={status === 'success' ? 'success' : 'error'}
          title={status === 'success' ? '验证成功' : '验证失败'}
          subTitle={message}
          extra={[
            <Link key="login" href="/login">
              <Button type="primary">前往登录</Button>
            </Link>
          ]}
        />
      </Card>
    </div>
  );
}
```

### 11. 运行数据库迁移

```bash
# 生成迁移文件
npx prisma migrate dev --name add-email-verification

# 更新 Prisma 客户端
npx prisma generate
```

### 12. 测试功能

1. 启动开发服务器：`npm run dev`
2. 访问注册页面：`http://localhost:3000/register`
3. 填写注册信息并提交
4. 检查邮箱中的验证邮件
5. 点击验证链接完成邮箱验证
6. 使用邮箱和密码登录系统

## 功能特性

### 安全特性
- ✅ 密码使用 bcryptjs 加密存储
- ✅ 邮箱验证机制防止虚假注册
- ✅ 验证令牌使用加密随机字符串
- ✅ 输入验证和错误处理
- ✅ 防止重复注册

### 用户体验
- ✅ 响应式设计，适配各种设备
- ✅ 友好的错误提示信息
- ✅ 加载状态指示
- ✅ 与现有 Google 登录无缝集成
- ✅ 完整的注册到登录流程

### 技术特性
- ✅ 基于 Next.js App Router
- ✅ 使用 NextAuth.js 进行身份验证
- ✅ Prisma ORM 数据库操作
- ✅ TypeScript 类型安全
- ✅ Ant Design UI 组件库

## 注意事项

### 邮件服务配置
1. **Gmail 配置**：需要在 Google 账户设置中开启两步验证并生成应用专用密码
2. **生产环境**：建议使用专业的邮件服务如 SendGrid、Mailgun 等
3. **邮件模板**：可以根据需要自定义邮件内容和样式

### 安全考虑
1. **验证令牌过期**：建议为验证令牌设置24小时过期时间
2. **密码策略**：可以添加更严格的密码复杂度要求
3. **验证码**：考虑添加图形验证码或短信验证码防止恶意注册
4. **速率限制**：对注册和验证接口添加速率限制

### 扩展功能
1. **密码重置**：可以按照类似的模式实现密码重置功能
2. **邮箱变更**：允许用户修改邮箱地址
3. **多因素认证**：添加短信或应用验证码
4. **社交登录**：集成更多第三方登录方式

## 故障排除

### 常见问题
1. **邮件发送失败**：检查邮件服务配置和网络连接
2. **验证链接无效**：确保 NEXTAUTH_URL 配置正确
3. **数据库连接错误**：检查 DATABASE_URL 配置
4. **类型错误**：确保安装了所有必要的类型定义包

### 调试技巧
1. 检查浏览器控制台的错误信息
2. 查看服务器日志输出
3. 使用 Prisma Studio 查看数据库状态
4. 测试邮件服务连接

## 相关文档

- [NextAuth.js 官方文档](https://next-auth.js.org/)
- [Prisma 官方文档](https://www.prisma.io/docs/)
- [Nodemailer 官方文档](https://nodemailer.com/)
- [bcryptjs 官方文档](https://github.com/dcodeIO/bcrypt.js/) 