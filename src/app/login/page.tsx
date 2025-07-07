"use client";
import { signIn } from "next-auth/react";
import { Card, Typography, Button } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";

export default function LoginPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 350, textAlign: 'center', boxShadow: '0 2px 8px #f0f1f2' }}>
        <Typography.Title level={2} style={{ marginBottom: 32 }}>登录到 Zen</Typography.Title>
        <Button
          type="primary"
          icon={<GoogleOutlined />}
          size="large"
          style={{ width: '100%' }}
          onClick={() => signIn('google', { callbackUrl: '/home' })}
        >
          使用 Google 登录
        </Button>
      </Card>
    </div>
  );
} 