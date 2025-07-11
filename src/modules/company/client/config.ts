import { Input } from 'antd';

// 表单字段配置
export interface FormField {
  name: string;
  label: string;
  rules?: any[];
  component: any;
  props: any;
}

export const FORM_FIELDS: FormField[] = [
  {
    name: 'name',
    label: '公司名称',
    rules: [
      { required: true, message: '请输入公司名称' },
      { min: 2, message: '公司名称至少2个字符' },
      { max: 50, message: '公司名称不能超过50个字符' }
    ],
    component: Input,
    props: { placeholder: '请输入公司名称', size: 'large' as const }
  },
  {
    name: 'description',
    label: '公司描述',
    component: Input.TextArea,
    props: { placeholder: '请输入公司描述', rows: 3 }
  },
  {
    name: 'address',
    label: '公司地址',
    component: Input,
    props: { placeholder: '请输入公司地址' }
  },
  {
    name: 'phone',
    label: '联系电话',
    component: Input,
    props: { placeholder: '请输入联系电话' }
  },
  {
    name: 'email',
    label: '联系邮箱',
    rules: [
      { type: 'email' as const, message: '请输入有效的邮箱地址' }
    ],
    component: Input,
    props: { placeholder: '请输入联系邮箱' }
  },
  {
    name: 'website',
    label: '公司网站',
    component: Input,
    props: { placeholder: '请输入公司网站' }
  },
  {
    name: 'taxNumber',
    label: '税号',
    component: Input,
    props: { placeholder: '请输入税号' }
  },
  {
    name: 'businessLicense',
    label: '营业执照号',
    component: Input,
    props: { placeholder: '请输入营业执照号' }
  }
]; 