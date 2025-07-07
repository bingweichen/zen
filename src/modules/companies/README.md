# Companies 模块

这个模块包含了所有与公司管理相关的功能。

## 文件结构

```
src/modules/companies/
├── README.md           # 模块说明文档
├── index.ts            # 模块主入口，导出所有公共API
├── types.ts            # 类型定义
├── config.ts           # 配置常量
├── styles.ts           # 样式常量
├── hooks.ts            # 自定义Hooks
└── components/         # 组件目录
    ├── index.ts        # 组件导出
    ├── CompanyForm.tsx # 公司表单组件
    ├── CompanyInfo.tsx # 公司信息展示组件
    └── CompanyList.tsx # 公司列表组件
```

## 使用方式

### 导入整个模块
```typescript
import { 
  Company, 
  useApiRequest, 
  CompanyForm, 
  CompanyList, 
  COMPANY_PAGE_STYLES 
} from '@/modules/companies';
```

### 按需导入
```typescript
// 导入类型
import { Company } from '@/modules/companies/types';

// 导入Hook
import { useApiRequest } from '@/modules/companies/hooks';

// 导入组件
import { CompanyForm } from '@/modules/companies/components';

// 导入配置
import { FORM_FIELDS } from '@/modules/companies/config';
```

## 主要功能

- **公司管理**: 创建、编辑、删除公司
- **公司选择**: 设置当前工作公司
- **表单验证**: 完整的表单验证规则
- **API集成**: 统一的API请求处理
- **响应式设计**: 适配不同屏幕尺寸

## 组件说明

### CompanyForm
公司表单组件，支持创建和编辑模式。

### CompanyInfo
公司信息展示组件，显示公司的详细信息。

### CompanyList
公司列表组件，包含选择、编辑、删除等操作。

## 类型定义

### Company
```typescript
interface Company {
  id: number;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxNumber?: string;
  businessLicense?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

## 自定义Hook

### useApiRequest
提供统一的API请求处理，包含加载状态和错误处理。 