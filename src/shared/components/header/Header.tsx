"use client";

import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Menu, 
  Button, 
  Dropdown, 
  // Avatar, 
  Space, 
  Typography,
  Divider
} from 'antd';
import { 
  HomeOutlined,
  TeamOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  DownOutlined,
  BuildOutlined
} from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useRequest } from 'ahooks';
import { fetchCurrentCompany } from '@/modules/company/service';
import { CompanyType } from '@/server/company';
import UserMenu from './UserMenu';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  showNavigation?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showNavigation = true }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [currentCompany, setCurrentCompany] = useState<CompanyType | null>(null);

  // 获取当前公司信息
  const { run: fetchCurrentCompanyData } = useRequest(
    fetchCurrentCompany,
    {
      manual: true,
      onSuccess: (data) => {
        setCurrentCompany(data.currentCompany);
      },
      onError: (error) => {
        console.error('获取当前公司失败:', error);
      }
    }
  );

  useEffect(() => {
    if (session?.user) {
      fetchCurrentCompanyData();
    }
  }, [session, fetchCurrentCompanyData]);

  // 导航菜单项
  const navigationItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/company/employees',
      icon: <TeamOutlined />,
      label: '员工管理',
    },
    {
      key: '/products',
      icon: <ShopOutlined />,
      label: '商品管理',
    },
    {
      key: '/purchase',
      icon: <ShoppingCartOutlined />,
      label: '采购管理',
    },
    {
      key: '/sales',
      icon: <ShoppingCartOutlined />,
      label: '销售管理',
    },
    {
      key: '/inventory',
      icon: <BarChartOutlined />,
      label: '库存查询',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: '报表统计',
    },
  ];

  // 用户菜单项
  // const userMenuItems = [
  //   {
  //     key: 'profile',
  //     icon: <UserOutlined />,
  //     label: '个人资料',
  //     onClick: () => router.push('/profile'),
  //   },
  //   {
  //     key: 'companies',
  //     icon: <BuildOutlined />,
  //     label: '公司管理',
  //     onClick: () => router.push('/companies'),
  //   },
  //   {
  //     key: 'settings',
  //     icon: <SettingOutlined />,
  //     label: '系统设置',
  //     onClick: () => router.push('/settings'),
  //   },
  //   {
  //     type: 'divider' as const,
  //   },
  //   {
  //     key: 'logout',
  //     icon: <LogoutOutlined />,
  //     label: '退出登录',
  //     onClick: () => {
  //       signOut({ callbackUrl: '/login' });
  //       message.success('已退出登录');
  //     },
  //   },
  // ];

  // 公司选择菜单项
  const companyMenuItems = [
    {
      key: 'select',
      icon: <BuildOutlined />,
      label: '选择公司',
      onClick: () => router.push('/companies'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'current',
      label: currentCompany?.name || '未选择公司',
      disabled: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  // 如果未登录，显示登录按钮
  if (status === 'unauthenticated') {
    return (
      <AntHeader style={{ 
        background: '#fff', 
        borderBottom: '1px solid #f0f0f0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Text strong style={{ fontSize: '18px', marginRight: '24px' }}>
            Zen 进销存系统
          </Text>
        </div>
        <Space>
          <Button type="link" onClick={() => router.push('/login')}>
            登录
          </Button>
          <Button type="primary" onClick={() => router.push('/register')}>
            注册
          </Button>
        </Space>
      </AntHeader>
    );
  }

  // 如果正在加载，显示加载状态
  if (status === 'loading') {
    return (
      <AntHeader style={{ 
        background: '#fff', 
        borderBottom: '1px solid #f0f0f0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Text strong style={{ fontSize: '18px' }}>
          Zen 进销存系统
        </Text>
      </AntHeader>
    );
  }

  return (
    <AntHeader style={{ 
      background: '#fff', 
      borderBottom: '1px solid #f0f0f0',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <Text strong style={{ fontSize: '18px', marginRight: '24px' }}>
          Zen 进销存系统
        </Text>
        
        {showNavigation && (
          <Menu
            mode="horizontal"
            selectedKeys={[pathname]}
            items={navigationItems}
            onClick={handleMenuClick}
            style={{ 
              border: 'none', 
              background: 'transparent',
              flex: 1
            }}
          />
        )}
      </div>

      <Space size="middle">
        {/* 公司选择 */}
        <Dropdown
          menu={{ items: companyMenuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button 
            type="text" 
            icon={<BuildOutlined />}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            {currentCompany?.name || '选择公司'}
            <DownOutlined style={{ marginLeft: 4 }} />
          </Button>
        </Dropdown>

        <Divider type="vertical" />

        {/* 用户菜单 */}
        <UserMenu session={session} router={router} />
      </Space>
    </AntHeader>
  );
};

export default Header; 