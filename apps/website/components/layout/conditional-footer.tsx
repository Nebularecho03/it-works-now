"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./site-footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on admin pages and research-hub
  if (pathname === "/admin-signup" || pathname.startsWith("/admin") || pathname.startsWith("/research-hub")) {
    return null;
  }
  
  return <SiteFooter />;
}
