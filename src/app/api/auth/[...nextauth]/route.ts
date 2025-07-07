import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@/generated/prisma/index";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }: { token: any; user: any; account: any }) {
      // 首次登录时，user 对象包含数据库中的用户信息
      console.log('jwt', token, user, account);
      if (account && user) {
        // 从数据库获取完整的用户信息
        const dbUser = await prisma.user.findUnique({
          where: { username: user.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // 从 JWT token 中获取用户 ID
      if (token && token.id) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  // 可根据需要添加 callbacks、adapter 等
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 