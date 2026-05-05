"use client"

import React from "react"

interface TabsProps {
  className?: string;
  children?: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ className, children }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default Tabs;
