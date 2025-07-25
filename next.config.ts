import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // 在构建时忽略类型错误
    ignoreBuildErrors: true,
  },
  eslint: {
    // 在构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
