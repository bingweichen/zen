'use client'
import React, { useState } from "react";
import { CompanyInfo } from "@/modules/company/components/CompanyInfo";
import { useRequest } from "ahooks";
import { fetchCurrentCompany, fetchCompanies } from "@/modules/company/service";
import { fetchEmployees } from "@/modules/employee/service";
import Link from "next/link";

const Dashboard = () => {
  // 获取当前公司
  const { data: currentCompanyData, loading: currentCompanyLoading } = useRequest(fetchCurrentCompany);
  const company = currentCompanyData?.currentCompany || null;

  // 获取公司列表
  const { data: companies = [], loading: companiesLoading } = useRequest(fetchCompanies);

  // 获取员工列表
  const { data: employees = [], loading: employeesLoading } = useRequest(fetchEmployees, {
    ready: !!company,
  });

  // 统计数据
  const employeeCount = employees.length;
  const companyCount = companies.length;
  // 待办事项可根据实际业务调整，这里暂用0
  const todoCount = 0;

  // CompanyList 相关操作（可根据实际业务实现）
  const handleSelectCompany = () => {};
  const handleEditCompany = () => {};
  const handleDeleteCompany = () => {};

  return (
    
      <main className="max-w-5xl mx-auto mt-8 px-4">
        <h1 className="text-2xl font-bold mb-4">工作台</h1>
        <section className="mb-6">
          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">
                {company ? `当前公司：${company.name}` : "未选择公司"}
              </div>
              <div className="text-gray-500">
                欢迎回来，祝你工作愉快！
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/company/employees">
                <button className="btn btn-primary">员工管理</button>
              </Link>
              <Link href="/companies">
                <button className="btn btn-outline">公司列表</button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">员工总数</div>
            <div className="text-2xl font-bold">{employeesLoading ? '--' : employeeCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">公司总数</div>
            <div className="text-2xl font-bold">{companiesLoading ? '--' : companyCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">待办事项</div>
            <div className="text-2xl font-bold">{todoCount}</div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">公司信息</h2>
          {company && <CompanyInfo company={company} />}
        </section>

        
      </main>
  );
};

export default Dashboard;
