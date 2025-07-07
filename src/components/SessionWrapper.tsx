"use client";
import { SessionProvider } from "next-auth/react";
import '@ant-design/v5-patch-for-react-19';

export default function SessionWrapper({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
} 