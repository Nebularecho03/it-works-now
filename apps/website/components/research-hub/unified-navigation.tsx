"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search,
  Brain,
  Microscope,
  FileText,
  Trophy,
  Users,
  Calendar,
  Settings,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Public",
    href: "/research-hub",
    icon: Brain,
    description: "Lab overview & identity",
    subItems: [
      { title: "Home", href: "/research-hub" },
      { title: "About Lab", href: "/research-hub/about" },
      { title: "Contact", href: "/research-hub/contact" }
    ]
  },
  {
    title: "Research",
    href: "/research-hub/projects",
    icon: Microscope,
    description: "Research outputs & activities",
    subItems: [
      { title: "Projects", href: "/research-hub/projects" },
      { title: "Publications", href: "/research-hub/publications" },
      { title: "Collaborations", href: "/research-hub/team" },
      { title: "Awards & Grants", href: "/research-hub/awards" },
      { title: "Events & Talks", href: "/research-hub/events" }
    ]
  },
  {
    title: "Intelligence",
    href: "/research-hub/insights",
    icon: Search,
    description: "Research insights & discovery",
    subItems: [
      { title: "Research Insights", href: "/research-hub/insights" },
      { title: "Cross-Project Links", href: "/research-hub/insights/links" },
      { title: "Thematic Groups", href: "/research-hub/insights/themes" },
      { title: "Findings Dashboard", href: "/research-hub/insights/findings" },
      { title: "Search", href: "/research-hub/search" }
    ]
  },
  {
    title: "Admin",
    href: "/admin",
    icon: Settings,
    description: "Content management system",
    subItems: [
      { title: "Dashboard", href: "/admin" },
      { title: "Projects", href: "/admin/projects" },
      { title: "Publications", href: "/admin/publications" },
      { title: "Team", href: "/admin/team" },
      { title: "Media", href: "/admin/media" }
    ],
    requiresAuth: true,
    requiresAdmin: true
  }
];

interface UnifiedNavigationProps {
  className?: string;
  onClose?: () => void;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
}

export function UnifiedNavigation({ 
  className, 
  onClose, 
  isAuthenticated = false,
  isAdmin = false 
}: UnifiedNavigationProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/research-hub") {
      return pathname === "/research-hub" || pathname === "/research-hub/";
    }
    return pathname.startsWith(href);
  };

  const filteredItems = navigationItems.filter(item => {
    if (item.requiresAuth && !isAuthenticated) return false;
    if (item.requiresAdmin && !isAdmin) return false;
    return true;
  });

  return (
    <div className={cn("flex flex-col h-full bg-card border-r", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">RH</span>
          </div>
          <div>
            <h1 className="text-sm font-bold">Research Hub</h1>
            <p className="text-xs text-muted-foreground">HDLK-L</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
            <span className="sr-only">Close navigation</span>
            ×
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredItems.map((item) => {
          const active = isActive(item.href);
          return (
            <div key={item.title}>
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                </div>
              </Link>
              
              {/* Sub-items */}
              {active && item.subItems && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.title}
                      href={subItem.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all duration-200",
                        pathname === subItem.href
                          ? "bg-primary/5 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      )}
                    >
                      <div className="w-1 h-1 rounded-full bg-current opacity-60" />
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Stats */}
      <div className="p-3 border-t">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/50 p-2 rounded-md text-center">
            <div className="text-sm font-bold text-primary">12</div>
            <div className="text-xs text-muted-foreground">Projects</div>
          </div>
          <div className="bg-muted/50 p-2 rounded-md text-center">
            <div className="text-sm font-bold text-primary">28</div>
            <div className="text-xs text-muted-foreground">Publications</div>
          </div>
        </div>
      </div>
    </div>
  );
}
