"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Brain,
  Microscope,
  FileText,
  ListChecks,
  Trophy,
  Mic2,
  Lightbulb,
  TrendingUp,
  Users,
  BookOpen,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  {
    title: "Overview",
    href: "/research-hub",
    icon: LayoutDashboard,
    description: "Dashboard and summary"
  },
  {
    title: "About",
    href: "/research-hub/about",
    icon: Brain,
    description: "Lab identity and philosophy"
  },
  {
    title: "Projects",
    href: "/research-hub/projects",
    icon: Microscope,
    description: "Active and completed research"
  },
  {
    title: "Publications",
    href: "/research-hub/activities",
    icon: FileText,
    description: "Papers and publications"
  },
  {
    title: "Tasks",
    href: "/research-hub/tasks",
    icon: ListChecks,
    description: "Research milestones"
  },
  {
    title: "Awards",
    href: "/research-hub/awards",
    icon: Trophy,
    description: "Recognition and grants"
  },
  {
    title: "Invited Talks",
    href: "/research-hub/activities",
    icon: Mic2,
    description: "Speaking engagements"
  },
  {
    title: "Research Interests",
    href: "/research-hub/about",
    icon: Lightbulb,
    description: "Areas of expertise"
  },
  {
    title: "Ongoing",
    href: "/research-hub/projects",
    icon: TrendingUp,
    description: "Current initiatives"
  },
  {
    title: "Collaborations",
    href: "/research-hub/team",
    icon: Users,
    description: "Partnerships and network"
  },
  {
    title: "Resources",
    href: "/research-hub/community",
    icon: BookOpen,
    description: "Tools and documentation"
  }
];

interface ResearchHubSidebarProps {
  className?: string;
  onClose?: () => void;
}

export function ResearchHubSidebar({ className, onClose }: ResearchHubSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/research-hub") {
      return pathname === "/research-hub" || pathname === "/research-hub/";
    }
    return pathname.startsWith(href);
  };

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
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {sidebarItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.title}
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
          );
        })}
      </nav>

      {/* Footer stats */}
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
