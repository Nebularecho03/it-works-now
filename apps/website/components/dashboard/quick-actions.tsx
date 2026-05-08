"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  FileText, 
  Users, 
  Calendar,
  BarChart3,
  Settings
} from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  const actions = [
    {
      title: "New Publication",
      description: "Add a new research paper",
      icon: FileText,
      href: "/dashboard/publications/new",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Add Collaborator", 
      description: "Invite a new research partner",
      icon: Users,
      href: "/dashboard/collaborators/new",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Schedule Event",
      description: "Create a new event or meeting",
      icon: Calendar,
      href: "/dashboard/events/new", 
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "View Analytics",
      description: "Check research impact metrics",
      icon: BarChart3,
      href: "/dashboard/analytics",
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "Site Settings",
      description: "Manage website configuration",
      icon: Settings,
      href: "/dashboard/settings",
      color: "bg-gray-500 hover:bg-gray-600"
    }
  ];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      
      <div className="space-y-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start h-auto p-3 hover:bg-gray-50"
              asChild
            >
              <Link href={action.href} className="flex items-center gap-3">
                <div className={`p-2 rounded-lg text-white ${action.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{action.title}</div>
                  <div className="text-sm text-gray-500">{action.description}</div>
                </div>
              </Link>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
