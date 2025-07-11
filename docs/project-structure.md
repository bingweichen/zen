# 项目结构设计

## 整体架构

```
zen/
├── docs/                    # 项目文档
├── prisma/                  # 数据库模型和迁移
├── public/                  # 静态资源
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # 后端 API 路由
│   │   └── (pages)/         # 前端页面路由
│   ├── modules/             # 业务模块（核心）
│   ├── shared/              # 全局共享内容
│   │   ├── config/          # 全局配置
│   │   ├── constants/       # 全局常量
│   │   ├── components/      # 全局组件
│   │   ├── lib/             # 全局工具函数
│   └── generated/           # 自动生成的文件
└── package.json
```

## 模块

```
src/modules/{module-name}/
├── README.md              # 模块说明文档
├── index.ts               # 模块主入口，导出公共API
├── client                 # 前端
│   ├── components          # 组件
│   ├── styles.ts           # 样式
│   ├── hooks.ts            # Hooks
│   ├── service.ts          # API 的封装
│   ├── config.ts           # 配置项
├── server                 # 后端
│   ├── api                 # 后端 API 函数逻辑
│   ├── lib                 # 工具函数
│   ├── types.ts            # 后端类型定义

```
