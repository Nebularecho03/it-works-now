"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard,
  Brain,
  FileText,
  Trophy,
  Users,
  MessageSquare,
  TrendingUp,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Plus,
  ExternalLink,
  BarChart3,
  Calendar,
  Settings
} from "lucide-react";

interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  totalPublications: number;
  publishedPublications: number;
  totalAwards: number;
  totalUsers: number;
  totalMessages: number;
  recentActivity: Array<{
    id: string;
    action: string;
    entity: string;
    title: string;
    timestamp: string;
  }>;
  quickStats: Array<{
    label: string;
    value: number;
    change: number;
    changeType: 'increase' | 'decrease';
  }>;
}

// Mock data - will be replaced with API calls
const mockStats: DashboardStats = {
  totalProjects: 12,
  publishedProjects: 8,
  draftProjects: 4,
  totalPublications: 24,
  publishedPublications: 18,
  totalAwards: 8,
  totalUsers: 156,
  totalMessages: 47,
  recentActivity: [
    {
      id: '1',
      action: 'created',
      entity: 'project',
      title: 'Traditional Luhya Mourning Rituals',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      action: 'updated',
      entity: 'publication',
      title: 'Mental Health in African Contexts',
      timestamp: '2024-01-14T15:45:00Z'
    },
    {
      id: '3',
      action: 'published',
      entity: 'award',
      title: 'Excellence in Cultural Research',
      timestamp: '2024-01-13T09:20:00Z'
    },
    {
      id: '4',
      action: 'created',
      entity: 'user',
      title: 'New premium user registration',
      timestamp: '2024-01-12T14:15:00Z'
    }
  ],
  quickStats: [
    {
      label: 'Projects',
      value: 12,
      change: 2,
      changeType: 'increase'
    },
    {
      label: 'Publications',
      value: 24,
      change: 5,
      changeType: 'increase'
    },
    {
      label: 'Awards',
      value: 8,
      change: 0,
      changeType: 'increase'
    },
    {
      label: 'Users',
      value: 156,
      change: 12,
      changeType: 'increase'
    }
  ]
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication and load dashboard data
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/research-hub-v2/auth/me");
        if (!response.ok) {
          router.push("/research-hub-v2/auth/login");
          return;
        }
        
        const userData = await response.json();
        if (userData.user.role !== "ADMIN" && userData.user.role !== "ASSISTANT") {
          router.push("/research-hub-v2/user/dashboard");
          return;
        }

        // Load dashboard stats
        setStats(mockStats);
      } catch (error) {
        router.push("/research-hub-v2/auth/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getActionColor = (action: string) => {
    const colors = {
      created: 'bg-green-100 text-green-800 border-green-200',
      updated: 'bg-blue-100 text-blue-800 border-blue-200',
      published: 'bg-purple-100 text-purple-800 border-purple-200',
      deleted: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[action as keyof typeof colors] || colors.created;
  };

  const getEntityIcon = (entity: string) => {
    const icons = {
      project: Brain,
      publication: FileText,
      award: Trophy,
      user: Users,
      message: MessageSquare
    };
    return icons[entity as keyof typeof icons] || FileText;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/research-hub-v2/public" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🧠</span>
                </div>
                <span className="font-bold text-xl text-gray-900">Research Hub Admin</span>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/research-hub-v2/admin/dashboard" className="text-emerald-600 font-medium">
                  Dashboard
                </Link>
                <Link href="/research-hub-v2/admin/manage/projects" className="text-gray-600 hover:text-gray-900">
                  Projects
                </Link>
                <Link href="/research-hub-v2/admin/manage/publications" className="text-gray-600 hover:text-gray-900">
                  Publications
                </Link>
                <Link href="/research-hub-v2/admin/manage/users" className="text-gray-600 hover:text-gray-900">
                  Users
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/research-hub-v2/public" target="_blank">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Site
                </Link>
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
                <Link href="/research-hub-v2/admin/create/project">
                  <Plus className="w-4 h-4 mr-2" />
                  Quick Add
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your research hub with confidence</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/research-hub-v2/admin/settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 mb-1">Total Projects</p>
                <p className="text-2xl font-bold text-emerald-900">{stats?.totalProjects}</p>
                <p className="text-xs text-emerald-600 mt-1">
                  {stats?.publishedProjects} published • {stats?.draftProjects} drafts
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Publications</p>
                <p className="text-2xl font-bold text-blue-900">{stats?.totalPublications}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats?.publishedPublications} published
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Total Users</p>
                <p className="text-2xl font-bold text-purple-900">{stats?.totalUsers}</p>
                <p className="text-xs text-purple-600 mt-1">Active researchers</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Messages</p>
                <p className="text-2xl font-bold text-orange-900">{stats?.totalMessages}</p>
                <p className="text-xs text-orange-600 mt-1">User inquiries</p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2 hover:bg-emerald-50 hover:border-emerald-200"
              asChild
            >
              <Link href="/research-hub-v2/admin/create/project">
                <Brain className="w-6 h-6 text-emerald-600" />
                <span className="text-sm">New Project</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-200"
              asChild
            >
              <Link href="/research-hub-v2/admin/create/publication">
                <FileText className="w-6 h-6 text-blue-600" />
                <span className="text-sm">New Publication</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2 hover:bg-purple-50 hover:border-purple-200"
              asChild
            >
              <Link href="/research-hub-v2/admin/create/award">
                <Trophy className="w-6 h-6 text-purple-600" />
                <span className="text-sm">New Award</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2 hover:bg-orange-50 hover:border-orange-200"
              asChild
            >
              <Link href="/research-hub-v2/admin/manage/users">
                <Users className="w-6 h-6 text-orange-600" />
                <span className="text-sm">Manage Users</span>
              </Link>
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Recent Activity
              </h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {stats?.recentActivity.map((activity) => {
                const Icon = getEntityIcon(activity.entity);
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge className={getActionColor(activity.action)} variant="outline">
                          {activity.action}
                        </Badge>
                        <span>•</span>
                        <span>{getRelativeTime(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                Quick Stats
              </h2>
            </div>
            <div className="space-y-4">
              {stats?.quickStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{stat.label}</p>
                    <p className="text-xs text-gray-500">Last 30 days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    <div className={`flex items-center gap-1 text-xs ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.changeType === 'increase' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingUp className="w-3 h-3 rotate-180" />
                      )}
                      <span>{stat.change > 0 ? '+' : ''}{stat.change}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
