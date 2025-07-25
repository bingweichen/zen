# Vercel 部署配置指南

本文档说明如何将 Next.js 项目部署到 Vercel 平台。

## 前置条件

- 项目代码已推送到 GitHub、GitLab 或 Bitbucket 等 Git 仓库
- 项目使用 Next.js 框架
- 已注册 Vercel 账号

## 部署步骤

### 1. 连接 Git 仓库

1. 登录 [Vercel 官网](https://vercel.com/)
2. 点击 "New Project"
3. 选择你的 Git 仓库（GitHub/GitLab/Bitbucket）
4. 授权 Vercel 访问你的仓库

### 2. 配置项目设置

在项目导入页面，Vercel 会自动检测 Next.js 项目并配置：

- **Framework Preset**: Next.js
- **Root Directory**: `./` (项目根目录)
- **Build Command**: `npm run build` 或 `yarn build`
- **Output Directory**: `.next` (Next.js 默认)
- **Install Command**: `npm install` 或 `yarn install`

### 3. 环境变量配置

如果项目使用了环境变量，需要在 Vercel 中配置：

1. 在项目设置中找到 "Environment Variables" 部分
2. 添加以下环境变量：
   ```
   DATABASE_URL=你的数据库连接字符串
   NEXTAUTH_SECRET=你的 NextAuth 密钥
   NEXTAUTH_URL=https://你的域名.vercel.app
   GOOGLE_CLIENT_ID=你的 Google OAuth 客户端 ID
   GOOGLE_CLIENT_SECRET=你的 Google OAuth 客户端密钥
   ```

### 4. 数据库配置

由于项目使用 PostgreSQL，需要配置生产环境数据库：

1. **使用 Supabase**（推荐）：
   - 在 Supabase 中创建生产环境项目
   - 获取生产环境的连接字符串
   - 在 Vercel 环境变量中设置 `DATABASE_URL`

2. **数据库迁移**：
   - 确保 `prisma/schema.prisma` 文件已提交到仓库
   - 在 Vercel 的构建命令中添加数据库迁移：
     ```bash
     npx prisma migrate deploy && npm run build
     ```

### 5. 部署配置

在项目根目录创建 `vercel.json` 文件（可选）：

```json
{
  "buildCommand": "npx prisma migrate deploy && npm run build",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### 6. 开始部署

1. 点击 "Deploy" 按钮
2. Vercel 会自动构建和部署项目
3. 部署完成后会获得一个 `.vercel.app` 域名

### 7. 自定义域名（可选）

1. 在项目设置中找到 "Domains" 部分
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录

## 注意事项

### 数据库连接
- 确保生产环境数据库允许外部连接
- 使用连接池优化数据库性能
- 定期备份数据库

### 环境变量安全
- 不要在代码中硬编码敏感信息
- 使用 Vercel 的环境变量功能
- 定期轮换密钥和密码

### 性能优化
- 启用 Vercel 的缓存功能
- 使用 Next.js 的图片优化
- 配置 CDN 加速

## 常见问题

### 构建失败
- 检查 `package.json` 中的依赖是否正确
- 确认所有环境变量已配置
- 查看构建日志定位问题

### 数据库连接失败
- 检查 `DATABASE_URL` 是否正确
- 确认数据库服务是否正常运行
- 验证网络连接和防火墙设置

### 环境变量未生效
- 重新部署项目
- 检查环境变量名称是否正确
- 确认环境变量已保存

## 后续维护

1. **自动部署**：每次推送到主分支会自动触发部署
2. **预览部署**：Pull Request 会创建预览环境
3. **回滚**：可以在 Vercel 控制台回滚到之前的版本
4. **监控**：使用 Vercel Analytics 监控应用性能

## 相关链接

- [Vercel 官方文档](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment) 