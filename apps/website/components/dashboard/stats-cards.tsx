"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FolderOpen, BookOpen, Users, TrendingUp } from "lucide-react";

interface StatCard {
  title: string;
  value: number;
  change?: number;
  icon: React.ElementType;
  color: string;
}

export function StatsCards() {
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: "Total Projects",
      value: 0,
      change: 0,
      icon: FolderOpen,
      color: "from-blue-500 to-cyan-600"
    },
    {
      title: "Publications",
      value: 0,
      change: 0,
      icon: BookOpen,
      color: "from-purple-500 to-violet-600"
    },
    {
      title: "Collaborators",
      value: 0,
      change: 0,
      icon: Users,
      color: "from-emerald-500 to-teal-600"
    },
    {
      title: "Impact Score",
      value: 0,
      change: 0,
      icon: TrendingUp,
      color: "from-amber-500 to-orange-600"
    }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projectsRes, publicationsRes, collaboratorsRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/publications"),
          fetch("/api/collaborators")
        ]);

        const [projectsData, publicationsData, collaboratorsData] = await Promise.all([
          projectsRes.json(),
          publicationsRes.json(),
          collaboratorsRes.json()
        ]);

        setStats([
          {
            title: "Total Projects",
            value: projectsData.pagination?.total || 0,
            change: 12,
            icon: FolderOpen,
            color: "from-blue-500 to-cyan-600"
          },
          {
            title: "Publications",
            value: publicationsData.pagination?.total || 0,
            change: 8,
            icon: BookOpen,
            color: "from-purple-500 to-violet-600"
          },
          {
            title: "Collaborators",
            value: collaboratorsData.collaborators?.length || 0,
            change: 5,
            icon: Users,
            color: "from-emerald-500 to-teal-600"
          },
          {
            title: "Impact Score",
            value: Math.floor(Math.random() * 20) + 80,
            change: 15,
            icon: TrendingUp,
            color: "from-amber-500 to-orange-600"
          }
        ]);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  {stat.change !== undefined && (
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        stat.change > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {stat.change > 0 ? "+" : ""}{stat.change}%
                      </span>
                      <span className="text-sm text-gray-500 ml-1">from last month</span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
          </Card>
        );
      })}
    </div>
  );
}
