"use client";

import React from 'react';
import { 
  Layout, 
  Button, 
  Typography
} from 'antd';
import { 
  DashboardOutlined
} from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UserMenu from './UserMenu';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const HomeHeader: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

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
        <div>
          <Button type="link" onClick={() => router.push('/login')}>
            登录
          </Button>
          <Button type="primary" onClick={() => router.push('/register')}>
            注册
          </Button>
        </div>
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
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Text strong style={{ fontSize: '18px' }}>
          Zen 进销存系统
        </Text>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button 
          type="primary" 
          size="large"
          icon={<DashboardOutlined />}
          onClick={() => router.push('/company')}
        >
          前往工作台
        </Button>
        <UserMenu session={session} router={router} />
      </div>
    </AntHeader>
  );
};

export default HomeHeader; 