"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
import { 
  Company, 
  useApiRequest, 
  CompanyForm, 
  CompanyList, 
  COMPANY_PAGE_STYLES 
} from '@/modules/companies';

const { Title } = Typography;

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  
  const { request, loading, error, setError } = useApiRequest();

  // 获取公司列表
  const fetchCompanies = useCallback(async () => {
    try {
      const data = await request<Company[]>('/api/company');
      setCompanies(data);
    } catch (e) {
      console.error('获取公司列表失败:', e);
    }
  }, [request]);

  // 获取当前选择的公司
  const fetchCurrentCompany = useCallback(async () => {
    try {
      const data = await request<{ currentCompany: Company }>('/api/company/current');
      setCurrentCompany(data.currentCompany);
    } catch (e) {
      console.error('获取当前公司失败:', e);
    }
  }, [request]);

  useEffect(() => {
    fetchCompanies();
    fetchCurrentCompany();
  }, [fetchCompanies, fetchCurrentCompany]);

  // 创建公司
  const handleCreateCompany = useCallback(async (values: Partial<Company>) => {
    try {
      await request<Company>('/api/company', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      
      message.success('公司创建成功！');
      setShowCreateModal(false);
      createForm.resetFields();
      fetchCompanies();
    } catch (e) {
      message.error(e instanceof Error ? e.message : String(e));
    }
  }, [request, createForm, fetchCompanies]);

  // 修改公司
  const handleEditCompany = useCallback(async (values: Partial<Company>) => {
    if (!editingCompany) return;
    
    try {
      await request<Company>('/api/company', {
        method: 'PUT',
        body: JSON.stringify({ id: editingCompany.id, ...values }),
      });
      
      message.success('公司修改成功！');
      setShowEditModal(false);
      setEditingCompany(null);
      editForm.resetFields();
      fetchCompanies();
    } catch (e) {
      message.error(e instanceof Error ? e.message : String(e));
    }
  }, [request, editingCompany, editForm, fetchCompanies]);

  // 删除公司
  const handleDeleteCompany = useCallback(async (companyId: number) => {
    try {
      await request(`/api/company?id=${companyId}`, {
        method: 'DELETE',
      });
      
      message.success('公司删除成功！');
      fetchCompanies();
      
      // 如果删除的是当前公司，清空当前公司
      if (currentCompany?.id === companyId) {
        setCurrentCompany(null);
      }
    } catch (e) {
      message.error(e instanceof Error ? e.message : String(e));
    }
  }, [request, currentCompany, fetchCompanies]);

  // 选择公司
  const handleSelectCompany = useCallback(async (companyId: number) => {
    try {
      const data = await request<{ currentCompany: Company }>('/api/company/current', {
        method: 'POST',
        body: JSON.stringify({ companyId }),
      });
      
      message.success('公司选择成功！');
      setCurrentCompany(data.currentCompany);
    } catch (e) {
      message.error(e instanceof Error ? e.message : String(e));
    }
  }, [request]);

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
    setError('');
  }, [editForm, setError]);

  const handleCreateModalCancel = useCallback(() => {
    setShowCreateModal(false);
    createForm.resetFields();
    setError('');
  }, [createForm, setError]);

  const handleEditModalCancel = useCallback(() => {
    setShowEditModal(false);
    setEditingCompany(null);
    editForm.resetFields();
    setError('');
  }, [editForm, setError]);

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

        {error && !showCreateModal && !showEditModal && (
          <Alert
            message="错误"
            description={error}
            type="error"
            showIcon
            style={COMPANY_PAGE_STYLES.errorAlert}
          />
        )}

        <Spin spinning={loading}>
          <CompanyList
            companies={companies}
            currentCompany={currentCompany}
            loading={loading}
            onSelectCompany={handleSelectCompany}
            onEditCompany={openEditModal}
            onDeleteCompany={handleDeleteCompany}
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
          onFinish={handleCreateCompany}
          loading={loading}
          error={error}
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
          onFinish={handleEditCompany}
          loading={loading}
          error={error}
          submitText="保存修改"
          cancelText="取消"
          onCancel={handleEditModalCancel}
        />
      </Modal>
    </div>
  );
};

export default CompaniesPage; 