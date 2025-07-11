# 使用 ahooks useRequest 替代自定义 useApiRequest

## 概述

我们将自定义的 `useApiRequest` hook 替换为 ahooks 的 `useRequest`，以获得更好的功能和性能。

## 主要变化

### 1. 安装依赖

```bash
npm install ahooks
```

### 2. 导入 useRequest

```typescript
import { useRequest } from 'ahooks';
```

### 3. API 调用模式变化

#### 之前的模式（自定义 useApiRequest）

```typescript
const { request, loading, error, setError } = useApiRequest();

const fetchData = useCallback(async () => {
  try {
    const data = await request<DataType>('/api/endpoint');
    setData(data);
  } catch (e) {
    console.error('请求失败:', e);
  }
}, [request]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

#### 现在的模式（ahooks useRequest）

```typescript
const { loading, run: fetchData } = useRequest(
  async () => {
    const res = await fetch('/api/endpoint');
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || '请求失败');
    }
    return res.json();
  },
  {
    onSuccess: (data) => {
      setData(data);
    },
    onError: (error) => {
      console.error('请求失败:', error);
      message.error(error.message);
    }
  }
);

// 自动执行
useEffect(() => {
  fetchData();
}, []);
```

### 4. 手动触发的请求

对于需要手动触发的请求（如提交表单），使用 `manual: true` 选项：

```typescript
const { loading, run: submitData } = useRequest(
  async (values) => {
    const res = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || '提交失败');
    }
    return res.json();
  },
  {
    manual: true,
    onSuccess: () => {
      message.success('操作成功！');
      // 其他成功后的操作
    },
    onError: (error) => {
      setError(error.message);
    }
  }
);

// 在表单提交时调用
const handleSubmit = (values) => {
  submitData(values);
};
```

## 优势

1. **更好的错误处理**：自动处理 loading 状态和错误状态
2. **缓存支持**：内置缓存机制，避免重复请求
3. **防抖和节流**：内置防抖和节流功能
4. **轮询支持**：支持自动轮询
5. **依赖管理**：支持基于依赖的自动重新请求
6. **TypeScript 支持**：更好的类型推断

## 注意事项

1. 确保在 `package.json` 中添加 `ahooks` 依赖
2. 错误处理现在通过 `onError` 回调进行
3. 成功处理通过 `onSuccess` 回调进行
4. 手动触发的请求需要设置 `manual: true`

## 示例

参考 `src/app/companies/page.tsx` 文件中的完整实现示例。 