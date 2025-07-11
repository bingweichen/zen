"use client";
import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tag, message, Modal, Input, Popconfirm } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { EmployeeWithUserAndRole } from "@/modules/employee/types";

const EmployeesPage: React.FC = () => {
  const [data, setData] = useState<EmployeeWithUserAndRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  // data[0].username

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/company/employees");
      if (!res.ok) throw new Error("获取员工列表失败");
      const result = await res.json();
      result[0].user.username
      
      setData(result.data || []);
    } catch (e: any) {
      message.error(e.message || "获取员工失败");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      message.warning("请输入邮箱");
      return;
    }
    setInviteLoading(true);
    try {
      const res = await fetch("/api/company/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (!res.ok) throw new Error("邀请失败");
      message.success("邀请成功");
      setInviteModalVisible(false);
      setInviteEmail("");
      fetchEmployees();
    } catch (e: any) {
      message.error(e.message || "邀请失败");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveClick = async (user: EmployeeWithUserAndRole) => {
    setRemoveLoading(true);
    try {
      const res = await fetch(`/api/company/employees?employeeId=${user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("移除失败");
      message.success("移除成功");
      fetchEmployees();
    } catch (e: any) {
      message.error(e.message || "移除失败");
    } finally {
      setRemoveLoading(false);
    }
  };

  const columns: ColumnsType<EmployeeWithUserAndRole> = [
    {
      title: "姓名",
      dataIndex: ["user", "username"],
      key: "user.username",
    },
    {
      title: "邮箱",
      dataIndex: ["user", "email"],
      key: "email",
    },
    {
      title: "角色",
      dataIndex: ["role", "name"],
      key: "role",
    //   render: (role) => <Tag color="blue">{role}</Tag>,
    },
    
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link">修改角色</Button>
          <Popconfirm
            title={`确定要移除员工${record.user.username || ''}吗？`}
            onConfirm={() => handleRemoveClick(record)}
            okText="确认移除"
            cancelText="取消"
            okButtonProps={{ loading: removeLoading }}
          >
            <Button type="link" danger>移除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">员工管理</h2>
        <Button type="primary" onClick={() => setInviteModalVisible(true)}>邀请员工</Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        bordered
      />
      <Modal
        title="邀请员工"
        open={inviteModalVisible}
        onCancel={() => { setInviteModalVisible(false); setInviteEmail(""); }}
        onOk={handleInvite}
        confirmLoading={inviteLoading}
        okText="发送邀请"
        cancelText="取消"
      >
        <Input
          placeholder="请输入员工邮箱"
          value={inviteEmail}
          onChange={e => setInviteEmail(e.target.value)}
          onPressEnter={handleInvite}
        />
      </Modal>
    </div>
  );
};

export default EmployeesPage; 