"use client";
import React, { useState } from "react";
import { Table, Button, Space, Tag, message, Modal, Input, Popconfirm } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRequest } from "ahooks";
import { fetchEmployees, inviteEmployee, removeEmployee} from "@/modules/employee";
import {type EmployeeWithUserAndRole} from "@/server/employee"

const EmployeesPage: React.FC = () => {
  const [data, setData] = useState<EmployeeWithUserAndRole[]>([]);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  // 获取员工列表
  const { loading, run: fetchEmployeesData } = useRequest(
    fetchEmployees,
    {
      onSuccess: (employees) => {
        setData(employees);
      },
      onError: (error) => {
        message.error(error.message || "获取员工失败");
      }
    }
  );

  // 邀请员工
  const { loading: inviteLoading, run: inviteEmployeeData } = useRequest(
    inviteEmployee,
    {
      manual: true,
      onSuccess: () => {
        message.success("邀请成功");
        setInviteModalVisible(false);
        setInviteEmail("");
        fetchEmployeesData();
      },
      onError: (error) => {
        message.error(error.message || "邀请失败");
      }
    }
  );

  // 移除员工
  const { loading: removeLoading, run: removeEmployeeData } = useRequest(
    removeEmployee,
    {
      manual: true,
      onSuccess: () => {
        message.success("移除成功");
        fetchEmployeesData();
      },
      onError: (error) => {
        message.error(error.message || "移除失败");
      }
    }
  );

  // 初始化数据
  React.useEffect(() => {
    fetchEmployeesData();
  }, []);

  const handleInvite = () => {
    if (!inviteEmail) {
      message.warning("请输入邮箱");
      return;
    }
    inviteEmployeeData(inviteEmail);
  };

  const handleRemoveClick = (user: EmployeeWithUserAndRole) => {
    removeEmployeeData(user.id);
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