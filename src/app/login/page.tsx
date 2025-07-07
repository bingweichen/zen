"use client";
import { signIn } from "next-auth/react";
import { Card, Typography, Button } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
      callbackUrl: "/home",
    });
    setLoading(false);
    if (res?.error) {
      setError("用户名或密码错误");
    } else if (res?.ok) {
      window.location.href = "/home";
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 350, textAlign: 'center', boxShadow: '0 2px 8px #f0f1f2' }}>
        <Typography.Title level={2} style={{ marginBottom: 32 }}>登录到 Zen</Typography.Title>
        <div style={{ marginBottom: 24 }}>
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 4, border: '1px solid #d9d9d9' }}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 4, border: '1px solid #d9d9d9' }}
            disabled={loading}
          />
          <Button
            type="primary"
            size="large"
            style={{ width: '100%', marginBottom: 8 }}
            loading={loading}
            onClick={handleLogin}
            disabled={!username || !password}
          >
            用户名密码登录
          </Button>
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        </div>
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