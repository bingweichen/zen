import React from 'react';
import { Form, Alert, Button, Space } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { FORM_FIELDS } from '../config';
import { COMPANY_PAGE_STYLES } from '../styles';

// 表单字段类型
export interface CompanyFormValues {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxNumber?: string;
  businessLicense?: string;
}

// 公司表单组件
interface CompanyFormProps {
  form: FormInstance<CompanyFormValues>;
  onFinish: (values: CompanyFormValues) => void;
  loading: boolean;
  error: string;
  submitText: string;
  cancelText: string;
  onCancel: () => void;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({ 
  form, 
  onFinish, 
  loading, 
  error, 
  submitText, 
  cancelText, 
  onCancel 
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      autoComplete="off"
    >
      {FORM_FIELDS.map(({ name, label, rules, component: Component, props }) => (
        <Form.Item
          key={name}
          label={label}
          name={name}
          rules={rules}
        >
          <Component 
            {...props}
            disabled={loading}
          />
        </Form.Item>
      ))}

      {error && (
        <Alert
          message="错误"
          description={error}
          type="error"
          showIcon
          style={COMPANY_PAGE_STYLES.errorAlert}
        />
      )}

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            size="large"
          >
            {submitText}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}; 