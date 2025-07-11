"use client";

import React from 'react';
import Header from './Header';

interface HeaderWrapperProps {
  showNavigation?: boolean;
  children: React.ReactNode;
}

const HeaderWrapper: React.FC<HeaderWrapperProps> = ({ 
  showNavigation = true, 
  children 
}) => {
  return (
    <>
      <Header showNavigation={showNavigation} />
      <div style={{ padding: '24px' }}>
        {children}
      </div>
    </>
  );
};

export default HeaderWrapper; 