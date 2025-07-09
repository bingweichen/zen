import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@/generated/prisma/index";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { createUser } from '@/services/user/createUser';

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });
        if (user && await bcrypt.compare(credentials.password, user.password)) {
          // 返回用户对象（不要包含密码）
          return { id: String(user.id), name: user.username, email: user.username};
        }
        return null;
      },
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
          await createUser({
            email: user.email,
            source: 'google',
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }: { token: any; user: any; account: any }) {
      // 首次登录时，user 对象包含数据库中的用户信息
      if (account && user) {
        // 从数据库获取完整的用户信息
        const dbUser = await prisma.user.findUnique({
          where: { username: user.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // 从 JWT token 中获取用户 ID
      if (token && token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  // 可根据需要添加 callbacks、adapter 等
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 