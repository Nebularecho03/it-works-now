"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

const Tabs = React.forwardRef<TabsProps>(({ className, children }, ref) => {
  return (
    <div ref={ref} className={cn("w-full", className)}>
      {children}
    </div>
  );
});

Tabs.displayName = "Tabs";

export default Tabs;
