"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionProvider } from "next-auth/react";
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
  LogOut,
  Sparkles,
  GraduationCap,
  BookOpen,
  Award,
  Heart,
  Mail,
  MessageSquare
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
            {/* Personalized Dashboard Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-1">Dr. Stephen Asatsa</h1>
                    <p className="text-blue-100 text-sm">Professional Admin Dashboard</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span className="text-xs text-blue-100">Psychology • Research • Academic Excellence</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                    <Globe className="w-4 h-4 mr-2" />
                    View Site
                  </Button>
                  <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Quick Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="group p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-600 mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Publications
                    </p>
                    <p className="text-2xl font-bold text-blue-900">{stats?.totalContent}</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +12% this month
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center ml-3 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                </div>
              </Card>

              <Card className="group p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-600 mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Clients
                    </p>
                    <p className="text-2xl font-bold text-emerald-900">{stats?.totalMedia}</p>
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      Active sessions
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center ml-3 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
              </Card>

              <Card className="group p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-600 mb-1 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      Research
                    </p>
                    <p className="text-2xl font-bold text-purple-900">{stats?.publishedPages}</p>
                    <p className="text-xs text-purple-600 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {stats?.draftPages} ongoing
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center ml-3 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                </div>
              </Card>

              <Card className="group p-4 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-600 mb-1 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Impact
                    </p>
                    <p className="text-2xl font-bold text-amber-900">{stats?.totalViews ? (stats.totalViews / 1000).toFixed(1) + 'k' : '0k'}</p>
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {stats?.activeUsers} engaged
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center ml-3 group-hover:scale-110 transition-transform">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-500" />
                Quick Actions
                <span className="text-xs text-slate-500 font-normal">Manage your professional content</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <Button 
                  onClick={() => setActiveSection('projects')}
                  size="sm"
                  className="h-12 p-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2"
                >
                  <Brain className="w-5 h-5" />
                  <span className="text-xs">Research</span>
                </Button>
                <Button 
                  onClick={() => setActiveSection('tasks')}
                  size="sm"
                  className="h-12 p-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2"
                >
                  <Target className="w-5 h-5" />
                  <span className="text-xs">Tasks</span>
                </Button>
                <Button 
                  onClick={() => setActiveSection('homepage')}
                  size="sm"
                  className="h-12 p-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  <span className="text-xs">Homepage</span>
                </Button>
                <Button 
                  onClick={() => setActiveSection('content')}
                  size="sm"
                  className="h-12 p-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-md hover:shadow-slate-500/25 transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-xs">Content</span>
                </Button>
                <Button 
                  onClick={() => setActiveSection('media')}
                  size="sm"
                  className="h-12 p-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-md hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2"
                >
                  <Images className="w-5 h-5" />
                  <span className="text-xs">Media</span>
                </Button>
                <Button 
                  onClick={() => setActiveSection('email-settings')}
                  size="sm"
                  className="h-12 p-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2"
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-xs">Email</span>
                </Button>
              </div>
            </div>

            {/* Enhanced Recent Content */}
            <Card className="p-5 bg-gradient-to-br from-white to-slate-50 border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Recent Activity
                  <span className="text-xs text-slate-500 font-normal">Latest updates to your professional content</span>
                </h2>
                <Button variant="outline" size="sm" onClick={() => setActiveSection('content')} className="hover:bg-blue-50 hover:border-blue-300">
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {recentContent.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Badge className={`${getTypeColor(item.type)} px-3 py-1 rounded-full text-xs font-medium`} variant="outline">
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-700 transition-colors">{item.title}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {item.views?.toLocaleString()} views
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(item.status)} px-2 py-1 rounded-full text-xs font-medium`} variant="outline">
                        {item.status === 'published' ? '✓ Published' : '○ Draft'}
                      </Badge>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
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
      
      case 'messages':
        return (
          <div className="space-y-6">
            <div className="text-center p-12">
              <Mail className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Messages</h2>
              <p className="text-slate-600 mb-6">Manage contact form submissions and communications</p>
              <Button onClick={() => window.location.href = '/admin/messages'}>
                Open Messages
              </Button>
            </div>
          </div>
        );
      
      case 'email-settings':
        return (
          <div className="space-y-6">
            <div className="text-center p-12">
              <Settings className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Settings</h2>
              <p className="text-slate-600 mb-6">Configure email providers and server settings</p>
              <Button onClick={() => window.location.href = '/admin/email-settings'}>
                Open Email Settings
              </Button>
            </div>
          </div>
        );
      
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
