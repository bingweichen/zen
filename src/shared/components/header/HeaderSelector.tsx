"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import HomeHeader from "./HomeHeader";

const HeaderSelector: React.FC = () => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  return isHomePage ? <HomeHeader /> : <Header />;
};

export default HeaderSelector; 