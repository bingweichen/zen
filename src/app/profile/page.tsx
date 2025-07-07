"use client";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>加载中...</div>;
  if (!session) return <div>未登录，请先登录。</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 100 }}>
      <h2>个人信息</h2>
      <img src={session.user?.image ?? ''} alt="头像" style={{ width: 80, borderRadius: '50%' }} />
      <p>姓名：{session.user?.name}</p>
      <p>邮箱：{session.user?.email}</p>
    </div>
  );
} 