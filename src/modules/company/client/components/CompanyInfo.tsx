import React, { useMemo } from 'react';
import { Tag } from 'antd';
import { 
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { Company } from '../types';

// 公司信息展示组件
interface CompanyInfoProps {
  company: Company;
}

export const CompanyInfo: React.FC<CompanyInfoProps> = ({ company }) => {
  const infoItems = useMemo(() => [
    { icon: <EnvironmentOutlined />, text: company.address, label: '地址' },
    { icon: <PhoneOutlined />, text: company.phone, label: '电话' },
    { icon: <MailOutlined />, text: company.email, label: '邮箱' },
    { icon: <GlobalOutlined />, text: company.website, label: '网站' }
  ].filter(item => item.text), [company]);

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Tag color="blue">ID: {company.id}</Tag>
      </div>
      {infoItems.map((item, index) => (
        <div key={index} style={{ marginBottom: 4, color: '#666' }}>
          {item.icon} {item.label}: {item.text}
        </div>
      ))}
    </div>
  );
}; 