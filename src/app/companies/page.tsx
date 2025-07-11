"use client";

import React, { useState, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Form, 
  Spin, 
  Alert, 
  Typography, 
  Modal,
  message
} from 'antd';
import { 
  PlusOutlined, 
  BuildOutlined
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { 
  CompanyType as Company, 
  CompanyForm, 
  CompanyList, 
  COMPANY_PAGE_STYLES 
} from '@/modules/company/client';
import {
  fetchCompanies,
  fetchCurrentCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  selectCompany
} from '@/modules/company/client/service';

const { Title } = Typography;

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');
  
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // 获取公司列表
  const { loading: companiesLoading, run: fetchCompaniesData } = useRequest(
    fetchCompanies,
    {
      onSuccess: (data) => {
        setCompanies(data);
      },
      onError: (error) => {
        console.error('获取公司列表失败:', error);
        message.error(error.message);
      }
    }
  );

  // 获取当前选择的公司
  const { loading: currentCompanyLoading, run: fetchCurrentCompanyData } = useRequest(
    fetchCurrentCompany,
    {
      onSuccess: (data) => {
        setCurrentCompany(data.currentCompany);
      },
      onError: (error) => {
        console.error('获取当前公司失败:', error);
        message.error(error.message);
      }
    }
  );

  // 创建公司
  const { loading: createLoading, run: createCompanyData } = useRequest(
    createCompany,
    {
      manual: true,
      onSuccess: () => {
        message.success('公司创建成功！');
        setShowCreateModal(false);
        createForm.resetFields();
        setCreateError('');
        fetchCompaniesData();
      },
      onError: (error) => {
        setCreateError(error.message);
      }
    }
  );

  // 修改公司
  const { loading: editLoading, run: editCompanyData } = useRequest(
    async (values: Partial<Company>) => {
      if (!editingCompany) return;
      return updateCompany(editingCompany.id, values);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('公司修改成功！');
        setShowEditModal(false);
        setEditingCompany(null);
        editForm.resetFields();
        setEditError('');
        fetchCompaniesData();
      },
      onError: (error) => {
        setEditError(error.message);
      }
    }
  );

  // 删除公司
  const { loading: deleteLoading, run: deleteCompanyData } = useRequest(
    deleteCompany,
    {
      manual: true,
      onSuccess: (_, [companyId]) => {
        message.success('公司删除成功！');
        fetchCompaniesData();
        
        // 如果删除的是当前公司，清空当前公司
        if (currentCompany?.id === companyId) {
          setCurrentCompany(null);
        }
      },
      onError: (error) => {
        message.error(error.message);
      }
    }
  );

  // 选择公司
  const { loading: selectLoading, run: selectCompanyData } = useRequest(
    selectCompany,
    {
      manual: true,
      onSuccess: (data) => {
        message.success('公司选择成功！');
        setCurrentCompany(data.currentCompany);
      },
      onError: (error) => {
        message.error(error.message);
      }
    }
  );

  // 初始化数据
  React.useEffect(() => {
    fetchCompaniesData();
    fetchCurrentCompanyData();
  }, []);

  // 打开编辑modal
  const openEditModal = useCallback((company: Company) => {
    setEditingCompany(company);
    editForm.setFieldsValue({
      name: company.name,
      description: company.description,
      address: company.address,
      phone: company.phone,
      email: company.email,
      website: company.website,
      taxNumber: company.taxNumber,
      businessLicense: company.businessLicense,
    });
    setShowEditModal(true);
  }, [editForm]);

  const handleCreateModalCancel = useCallback(() => {
    setShowCreateModal(false);
    createForm.resetFields();
    setCreateError('');
  }, [createForm]);

  const handleEditModalCancel = useCallback(() => {
    setShowEditModal(false);
    setEditingCompany(null);
    editForm.resetFields();
    setEditError('');
  }, [editForm]);

  const loading = companiesLoading || currentCompanyLoading || createLoading || editLoading || deleteLoading || selectLoading;

  return (
    <div style={COMPANY_PAGE_STYLES.container}>
      <Card>
        <div style={COMPANY_PAGE_STYLES.header}>
          <Title level={2} style={COMPANY_PAGE_STYLES.title}>
            <BuildOutlined style={{ marginRight: 8 }} />
            我的公司
          </Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setShowCreateModal(true)}
            size="large"
          >
            创建公司
          </Button>
        </div>

        <Spin spinning={loading}>
          <CompanyList
            companies={companies}
            currentCompany={currentCompany}
            loading={loading}
            onSelectCompany={selectCompanyData}
            onEditCompany={openEditModal}
            onDeleteCompany={deleteCompanyData}
          />
        </Spin>
      </Card>

      {/* 创建公司Modal */}
      <Modal
        title="创建新公司"
        open={showCreateModal}
        onCancel={handleCreateModalCancel}
        footer={null}
      >
        <CompanyForm
          form={createForm}
          onFinish={createCompanyData}
          loading={createLoading}
          error={createError}
          submitText="创建公司"
          cancelText="取消"
          onCancel={handleCreateModalCancel}
        />
      </Modal>

      {/* 编辑公司Modal */}
      <Modal
        title="修改公司信息"
        open={showEditModal}
        onCancel={handleEditModalCancel}
        footer={null}
      >
        <CompanyForm
          form={editForm}
          onFinish={editCompanyData}
          loading={editLoading}
          error={editError}
          submitText="保存修改"
          cancelText="取消"
          onCancel={handleEditModalCancel}
        />
      </Modal>
    </div>
  );
};

export default CompaniesPage; 