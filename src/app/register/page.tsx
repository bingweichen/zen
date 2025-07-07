"use client";
import React, { useState } from "react";
import { Form, Input, Button, message, Space } from "antd";

export default function RegisterPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 发送验证码
  const sendCode = async () => {
    try {
      const email = form.getFieldValue("email");
      if (!email) {
        message.warning("请先输入邮箱");
        return;
      }
      setCodeLoading(true);
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        message.success("验证码已发送，请查收邮箱");
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        message.error(data.error || "发送失败");
      }
    } catch (e) {
      message.error("发送失败");
    } finally {
      setCodeLoading(false);
    }
  };

  // 注册
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const data = await res.json();
      if (res.ok) {
        message.success("注册成功，请登录");
        // 可自动跳转到登录页
        window.location.href = "/login";
      } else {
        message.error(data.error || "注册失败");
      }
    } catch (e) {
      message.error("注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-[350px] bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-center text-2xl font-semibold mb-6">注册账号</h2>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}> 
            <Input placeholder="请输入邮箱" className="h-10" />
          </Form.Item>
          <Form.Item label="验证码" required>
            <Space.Compact className="w-full">
              <Form.Item name="code" noStyle rules={[{ required: true, message: '请输入验证码' }]}> 
                <Input className="h-10 w-[60%]" placeholder="请输入验证码" />
              </Form.Item>
              <Button 
                className="w-[38%] ml-2 h-10"
                onClick={sendCode} 
                loading={codeLoading} 
                disabled={countdown > 0}
              >
                {countdown > 0 ? `${countdown}s后重试` : '获取验证码'}
              </Button>
            </Space.Compact>
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}> 
            <Input.Password placeholder="请输入密码" className="h-10" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} className="h-10">注册</Button>
          </Form.Item>
        </Form>
        <div className="text-right">
          已有账号？<a href="/login" className="text-blue-600 hover:underline">去登录</a>
        </div>
      </div>
    </div>
  );
} 