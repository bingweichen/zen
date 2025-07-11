"use client";

import React from 'react';
import { Dropdown, Avatar, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, BuildOutlined, DownOutlined } from '@ant-design/icons';
import { signOut } from 'next-auth/react';
import { Session } from 'next-auth';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

const { Text } = Typography;

interface UserMenuProps {
  session: Session | null;
  router: AppRouterInstance;
}

const UserMenu: React.FC<UserMenuProps> = ({ session, router }) => {
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => router.push('/profile'),
    },
    {
      key: 'companies',
      icon: <BuildOutlined />,
      label: '公司管理',
      onClick: () => router.push('/companies'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      onClick: () => router.push('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        signOut({ callbackUrl: '/login' });
      },
    },
  ];

  return (
    <Dropdown
      menu={{ items: userMenuItems }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Space style={{ cursor: 'pointer' }}>
        <Avatar icon={<UserOutlined />} src={session?.user?.image} size="small" />
        <Text>{session?.user?.name || session?.user?.email}</Text>
        <DownOutlined style={{ fontSize: '12px' }} />
      </Space>
    </Dropdown>
  );
};

export default UserMenu; 