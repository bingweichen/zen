import React from 'react';
import { List, Button, Popconfirm, Card, Typography } from 'antd';
import { 
  BuildOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined
} from '@ant-design/icons';
import { Company } from '../types';
import { CompanyInfo } from './CompanyInfo';
import { COMPANY_PAGE_STYLES } from '../styles';

const { Title, Text } = Typography;

// 公司列表组件
interface CompanyListProps {
  companies: Company[];
  currentCompany: Company | null;
  loading: boolean;
  onSelectCompany: (companyId: number) => void;
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (companyId: number) => void;
}

export const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  currentCompany,
  loading,
  onSelectCompany,
  onEditCompany,
  onDeleteCompany
}) => {
  const isCurrentCompany = (companyId: number) => {
    return currentCompany?.id === companyId;
  };

  if (companies.length === 0 && !loading) {
    return (
      <Card style={COMPANY_PAGE_STYLES.emptyCard}>
        <BuildOutlined style={COMPANY_PAGE_STYLES.emptyIcon} />
        <Title level={4} style={COMPANY_PAGE_STYLES.emptyTitle}>
          你还未加入任何公司
        </Title>
        <Text type="secondary">
          请先创建公司或联系管理员邀请你加入现有公司
        </Text>
      </Card>
    );
  }

  return (
    <List
      dataSource={companies}
      renderItem={(company: Company) => (
        <List.Item
          actions={[
            isCurrentCompany(company.id) ? (
              <Button
                key="selected"
                type="text"
                icon={<CheckCircleOutlined />}
                style={COMPANY_PAGE_STYLES.selectedButton}
                disabled
              >
                当前公司
              </Button>
            ) : (
              <Button
                key="select"
                type="text"
                icon={<CheckCircleOutlined />}
                onClick={() => onSelectCompany(company.id)}
                disabled={loading}
              >
                选择
              </Button>
            ),
            <Button
              key="edit"
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEditCompany(company)}
              disabled={loading}
            >
              编辑
            </Button>,
            <Popconfirm
              key="delete"
              title="确认删除"
              description={`确定要删除公司"${company.name}"吗？此操作不可恢复。`}
              onConfirm={() => onDeleteCompany(company.id)}
              okText="确认"
              cancelText="取消"
              okType="danger"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={loading}
              >
                删除
              </Button>
            </Popconfirm>
          ]}
        >
          <List.Item.Meta
            avatar={<BuildOutlined style={COMPANY_PAGE_STYLES.companyIcon} />}
            title={company.name}
            description={<CompanyInfo company={company} />}
          />
        </List.Item>
      )}
    />
  );
}; 