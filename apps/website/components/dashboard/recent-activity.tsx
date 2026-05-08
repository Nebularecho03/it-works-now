"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Users, 
  MessageSquare,
  Calendar,
  TrendingUp
} from "lucide-react";

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: React.ElementType;
  color: string;
}

export function RecentActivity() {
  const activities: Activity[] = [
    {
      id: "1",
      type: "publication",
      title: "New paper published",
      description: "Cultural Evolution in Hunter-Gatherer Societies",
      timestamp: "2 hours ago",
      icon: FileText,
      color: "text-blue-600 bg-blue-100"
    },
    {
      id: "2",
      type: "collaboration",
      title: "New collaborator joined",
      description: "Dr. Sarah Mitchell from Durham University",
      timestamp: "5 hours ago",
      icon: Users,
      color: "text-green-600 bg-green-100"
    },
    {
      id: "3",
      type: "comment",
      title: "New research discussion",
      description: "Indigenous knowledge systems methodology",
      timestamp: "1 day ago",
      icon: MessageSquare,
      color: "text-purple-600 bg-purple-100"
    },
    {
      id: "4",
      type: "event",
      title: "Conference presentation",
      description: "EAPP Annual Meeting 2024",
      timestamp: "2 days ago",
      icon: Calendar,
      color: "text-orange-600 bg-orange-100"
    },
    {
      id: "5",
      type: "milestone",
      title: "Research milestone achieved",
      description: "1000 participants in Africa Long Life Study",
      timestamp: "3 days ago",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-100"
    }
  ];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
      
      <div className="space-y-3">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-lg ${activity.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 text-sm">{activity.title}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
