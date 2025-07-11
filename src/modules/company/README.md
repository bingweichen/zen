# Company 模块

这个模块包含了公司相关的所有业务逻辑，包括增删改查操作。

## 文件结构

```
src/modules/company/
├── README.md              # 模块说明文档
├── index.ts               # 模块主入口，导出公共API
├── types.ts               # 模块类型定义
├── server/
│   └── api.ts             # 服务器端 API 函数
└── client/                # 前端相关文件
    ├── components/        # 组件
    ├── styles.ts          # 样式
    ├── hooks.ts           # Hooks
    └── config.ts          # 配置项
```

## API 函数

### getUserCompanies(userId: number)
获取用户所属的所有公司（包括作为所有者或员工的公司）

### createCompany(userId: number, companyData)
创建新公司
- 自动创建 admin 角色
- 将创建者设置为 admin 员工

### updateCompany(userId: number, companyData)
更新公司信息
- 只有公司所有者可以更新

### deleteCompany(userId: number, companyId)
删除公司
- 只有公司所有者可以删除
- 使用事务确保数据一致性

### getCompany(userId: number, companyId)
获取单个公司信息
- 只有公司所有者或员工可以访问

## 使用示例

```typescript
import { createCompany, getUserCompanies } from '@/modules/company';

// 在 API 路由中使用
const companies = await getUserCompanies(userId);
const newCompany = await createCompany(userId, {
  name: '新公司',
  description: '公司描述'
});
```

## 权限控制

- 创建公司：任何登录用户
- 查看公司：公司所有者或员工
- 更新公司：仅公司所有者
- 删除公司：仅公司所有者 