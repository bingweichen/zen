# zen

一个基于 Next.js 和 PostgreSQL 的简单进销存（库存管理）系统。

## 项目简介
本项目旨在帮助中小型企业或个人高效管理商品的采购、销售与库存。通过现代 Web 技术实现数据的可视化与便捷操作。

## 技术栈
- 前端/后端：Next.js (React + Node.js)
- 数据库：PostgreSQL (Supabase)
- ORM：Prisma
- UI 框架：Ant Design 

## 主要功能
- 用户管理：注册 + 登录
- 员工权限管理：
- 商品管理：添加、编辑、删除商品信息
- 采购管理：记录采购单，更新库存
- 销售管理：记录销售单，扣减库存
- 库存查询：实时查看库存数量与变动
- 基础报表：采购、销售、库存统计

## todo
- [x] 初始化 Next.js 项目
- [ ] 配置数据库
  - [x] 本地
  - [ ] Supabase
- [x] 使用 ORM Prisma
- [x] 建立用户表（User）
- [ ] 搭建用户注册与登录功能
  - [x] google 登录 ()[./google-login.md]
  - [ ] 邮箱注册 ()[./email-registration.md]
  - [ ] 完成用户 auth session 的使用
- [ ] 用户管理
  - [ ] 用户
  - [ ] 公司
  - [ ] 权限

## 页面
- 登录
- 注册
- 公司管理
- 员工管理
- 权限管理
- 商品管理

# 章节说明

## 配置数据库（Supabase）
- 注册并登录 [Supabase 官网](https://supabase.com/)
- 创建新项目，获取 PostgreSQL 连接字符串

## 使用 ORM Prisma
 - 编辑 `prisma/schema.prisma`，配置数据源为 PostgreSQL。
- 生成并应用数据库迁移：
  ```bash
  npx prisma migrate dev --name init
  ```

## 公司管理
- [x] feat: 创建公司
  - [x] 名称唯一
- [x] feat: 修改公司，删除公司
  - [x] 增加修改公司 api
  - [x] 增加删除公司 api
  - [x] 修改公司管理页面 增加修改公司modal
  - [x] 修改公司管理页面 增加删除公司按钮
  - [x] 增加公司其他字段，如地址，联系方式等
- [] feat: 选择当前公司，进入主页

## 员工管理
