# Google 登录集成指南

本指南将帮助你在 Next.js + NextAuth.js 项目中集成 Google 登录功能，实现一键注册与登录。

---

## todo 步骤
- [x] 1. 注册 Google OAuth 应用，获取 Client ID 和 Client Secret
- [x] 2. 配置 .env 文件，添加 Google 相关环境变量
- [x] 3. 安装 NextAuth.js 依赖
- [x] 4. 配置 NextAuth.js，集成 GoogleProvider`/api/auth/[...nextauth].ts`
- [x] 5. 开发前端登录页面，添加 Google 登录按钮
- [x] 6. 回调，在数据库创建用户
- [ ] 7. （可选）JWT

next-auth 也支持 JWT 模式。你可以在 next-auth 配置中添加 session: { strategy: "jwt" }，这样 next-auth 就会在登录后生成一个 JWT token，前后端通过 token 进行身份验证。