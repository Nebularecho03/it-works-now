"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionProvider } from "@/components/admin/session-provider";
import { SessionGuard } from "@/components/admin/session-guard";
import { AdminLayout } from "@/components/admin/admin-layout";
import { ContentManagementSection } from "@/components/admin/content-management-section";
import { MediaLibrarySection } from "@/components/admin/media-library-section";
import { AnalyticsSection } from "@/components/admin/analytics-section";
import { ResearchProjectsSection } from "@/components/admin/research-projects-section";
import { ResearchTasksSection } from "@/components/admin/research-tasks-section";
import { HomepageContentSection } from "@/components/admin/homepage-content-section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FileText,
  Images,
  Users,
  BarChart3,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Search,
  Home,
  Trophy,
  Brain,
  Target,
  ExternalLink,
  Menu,
  X,
  TrendingUp,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Zap,
  ShieldCheck,
  Globe,
  Star,
  FolderOpen,
  Upload,
  Download,
  RefreshCw,
  Bell,
  User,
  LogOut
} from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  type: 'page' | 'research' | 'testimonial' | 'service';
  status: 'published' | 'draft';
  updatedAt: string;
  views?: number;
}

interface SystemStats {
  totalContent: number;
  totalMedia: number;
  publishedPages: number;
  draftPages: number;
  totalViews: number;
  lastUpdate: string;
  activeUsers: number;
  bounceRate: number;
  avgSessionDuration: string;
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [recentContent, setRecentContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data for now - replace with actual API calls
      const mockStats: SystemStats = {
        totalContent: 24,
        totalMedia: 156,
        publishedPages: 18,
        draftPages: 6,
        totalViews: 15420,
        lastUpdate: new Date().toISOString(),
        activeUsers: 127,
        bounceRate: 32.5,
        avgSessionDuration: "4:32"
      };

      const mockRecentContent: ContentItem[] = [
        {
          id: '1',
          title: 'Home Page Hero Section',
          type: 'page',
          status: 'published',
          updatedAt: '2024-01-15T10:30:00Z',
          views: 8920
        },
        {
          id: '2',
          title: 'Research on Afrocentric Psychology',
          type: 'research',
          status: 'published',
          updatedAt: '2024-01-14T15:45:00Z',
          views: 3420
        },
        {
          id: '3',
          title: 'Professional Services Overview',
          type: 'service',
          status: 'draft',
          updatedAt: '2024-01-13T09:20:00Z',
          views: 2100
        },
        {
          id: '4',
          title: 'Client Testimonial - John Doe',
          type: 'testimonial',
          status: 'published',
          updatedAt: '2024-01-12T14:15:00Z',
          views: 1560
        }
      ];

      setStats(mockStats);
      setRecentContent(mockRecentContent);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      page: 'bg-blue-100 text-blue-800',
      research: 'bg-purple-100 text-purple-800',
      testimonial: 'bg-yellow-100 text-yellow-800',
      service: 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-4">
            {/* Compact Dashboard Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
                  <p className="text-blue-100 text-sm">Manage your website with confidence</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Site
                  </Button>
                  <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50">
                    <Plus className="w-4 h-4 mr-1" />
                    Quick Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Optimized Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-600 mb-1">Total Content</p>
                    <p className="text-xl font-bold text-blue-900">{stats?.totalContent}</p>
                    <p className="text-xs text-blue-600">+12% ↑</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center ml-2">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                </div>
              </Card>

              <Card className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-emerald-600 mb-1">Media Files</p>
                    <p className="text-xl font-bold text-emerald-900">{stats?.totalMedia}</p>
                    <p className="text-xs text-emerald-600">156 files</p>
                  </div>
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center ml-2">
                    <Images className="w-4 h-4 text-white" />
                  </div>
                </div>
              </Card>

              <Card className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-purple-600 mb-1">Published</p>
                    <p className="text-xl font-bold text-purple-900">{stats?.publishedPages}</p>
                    <p className="text-xs text-purple-600">{stats?.draftPages} drafts</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center ml-2">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              </Card>

              <Card className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-orange-600 mb-1">Total Views</p>
                    <p className="text-xl font-bold text-orange-900">{stats?.totalViews ? (stats.totalViews / 1000).toFixed(1) + 'k' : '0k'}</p>
                    <p className="text-xs text-orange-600">{stats?.activeUsers} active</p>
                  </div>
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center ml-2">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Compact Quick Actions */}
            <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Quick Actions
              </h2>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setActiveSection('projects')}
                  size="sm"
                  className="h-8 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                >
                  <Brain className="w-3 h-3 mr-1" />
                  Projects
                </Button>
                <Button 
                  onClick={() => setActiveSection('tasks')}
                  size="sm"
                  className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                >
                  <Target className="w-3 h-3 mr-1" />
                  Tasks
                </Button>
                <Button 
                  onClick={() => setActiveSection('homepage')}
                  size="sm"
                  className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                >
                  <Home className="w-3 h-3 mr-1" />
                  Homepage
                </Button>
                <Button 
                  onClick={() => setActiveSection('content')}
                  size="sm"
                  className="h-8 px-3 bg-slate-600 hover:bg-slate-700 text-white text-xs"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Content
                </Button>
                <Button 
                  onClick={() => setActiveSection('media')}
                  size="sm"
                  className="h-8 px-3 bg-orange-600 hover:bg-orange-700 text-white text-xs"
                >
                  <Images className="w-3 h-3 mr-1" />
                  Media
                </Button>
                <Button 
                  onClick={() => setActiveSection('analytics')}
                  size="sm"
                  className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                >
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Analytics
                </Button>
                <Button 
                  onClick={() => setActiveSection('settings')}
                  size="sm"
                  className="h-8 px-3 bg-slate-600 hover:bg-slate-700 text-white text-xs"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Settings
                </Button>
              </div>
            </div>

            {/* Compact Recent Content */}
            <Card className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Recent Content
                </h2>
                <Button variant="outline" size="sm" onClick={() => setActiveSection('content')}>
                  View All
                </Button>
              </div>
              <div className="space-y-2">
                {recentContent.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Badge className={getTypeColor(item.type)} variant="outline">
                        {item.type.charAt(0).toUpperCase()}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-600">
                          <span>{item.views?.toLocaleString()} views</span>
                          <span>•</span>
                          <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(item.status)} variant="outline">
                        {item.status === 'published' ? '✓' : '○'}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );
      
      case 'projects':
        return <ResearchProjectsSection onNavigate={setActiveSection} />;
      
      case 'tasks':
        return <ResearchTasksSection onNavigate={setActiveSection} />;
      
      case 'homepage':
        return <HomepageContentSection onNavigate={setActiveSection} />;
      
      case 'content':
        return <ContentManagementSection onNavigate={setActiveSection} />;
      
      case 'media':
        return <MediaLibrarySection onNavigate={setActiveSection} />;
      
      case 'analytics':
        return <AnalyticsSection onNavigate={setActiveSection} />;
      
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="text-center p-12">
              <Settings className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Settings</h2>
              <p className="text-slate-600 mb-6">Configuration and settings management coming soon</p>
              <Button onClick={() => setActiveSection('dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-6">
            <div className="text-center p-12">
              <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Section Not Found</h2>
              <p className="text-slate-600 mb-6">The requested section is not available</p>
              <Button onClick={() => setActiveSection('dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <AdminLayout>
      {renderSection()}
    </AdminLayout>
  );
}

export default function AdminPage() {
  return (
    <SessionProvider>
      <SessionGuard>
        <AdminDashboardContent />
      </SessionGuard>
    </SessionProvider>
  );
}
