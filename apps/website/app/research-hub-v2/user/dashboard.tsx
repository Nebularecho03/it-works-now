"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  FileText, 
  Bookmark, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Star,
  Settings,
  Bell,
  Search,
  Filter,
  Plus,
  Eye,
  Download
} from "lucide-react";

// Mock data - will be replaced with API calls
const recentActivity = [
  {
    id: "1",
    type: "research_saved",
    title: "Traditional Luhya Mourning Rituals",
    timestamp: "2 hours ago",
    description: "You saved this research project"
  },
  {
    id: "2", 
    type: "message_received",
    title: "New message from Dr. Stephen Asatsa",
    timestamp: "1 day ago",
    description: "Regarding your research inquiry"
  },
  {
    id: "3",
    type: "publication_available",
    title: "Cultural Psychology Review - New Issue",
    timestamp: "3 days ago",
    description: "New publication in your subscribed category"
  }
];

const savedResearch = [
  {
    id: "1",
    title: "Traditional Luhya Mourning Rituals",
    category: "Cultural Psychology",
    summary: "Exploring indigenous knowledge systems in cultural psychology",
    savedAt: "2024-01-15",
    type: "project"
  },
  {
    id: "2",
    title: "Mental Health in African Contexts",
    category: "Clinical Psychology", 
    summary: "Decolonizing mental health practices through community-based approaches",
    savedAt: "2024-01-12",
    type: "publication"
  }
];

const stats = [
  { label: "Saved Research", value: "12", icon: Bookmark, color: "text-emerald-600" },
  { label: "Messages", value: "5", icon: MessageSquare, color: "text-blue-600" },
  { label: "Subscriptions", value: "3", icon: Star, color: "text-purple-600" },
  { label: "Downloads", value: "8", icon: Download, color: "text-orange-600" }
];

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication and load user data
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/research-hub-v2/auth/login");
          return;
        }
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        router.push("/research-hub-v2/auth/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your research workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/research-hub-v2/public" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🧠</span>
                </div>
                <span className="font-bold text-xl text-gray-900">Research Hub</span>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/research-hub-v2/user/dashboard" className="text-emerald-600 font-medium">
                  Dashboard
                </Link>
                <Link href="/research-hub-v2/research" className="text-gray-600 hover:text-gray-900">
                  Research
                </Link>
                <Link href="/research-hub-v2/user/saved" className="text-gray-600 hover:text-gray-900">
                  Saved
                </Link>
                <Link href="/research-hub-v2/user/messages" className="text-gray-600 hover:text-gray-900">
                  Messages
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 font-semibold text-sm">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || "Researcher"}!
          </h1>
          <p className="text-gray-600">
            Your personalized research workspace. Explore, save, and collaborate on cutting-edge research.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      {activity.type === "research_saved" && <Bookmark className="w-5 h-5 text-emerald-600" />}
                      {activity.type === "message_received" && <MessageSquare className="w-5 h-5 text-blue-600" />}
                      {activity.type === "publication_available" && <FileText className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{activity.title}</h3>
                      <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Saved Research */}
            <Card className="p-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Saved Research</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/research-hub-v2/user/saved">
                    View All
                  </Link>
                </Button>
              </div>
              
              <div className="space-y-4">
                {savedResearch.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      {item.type === "project" ? <Brain className="w-5 h-5 text-emerald-600" /> : <FileText className="w-5 h-5 text-emerald-600" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">{item.category}</Badge>
                        <span className="text-xs text-gray-500">Saved {item.savedAt}</span>
                      </div>
                      <p className="text-sm text-gray-600">{item.summary}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button className="w-full justify-start" asChild>
                  <Link href="/research-hub-v2/research">
                    <Search className="w-4 h-4 mr-2" />
                    Browse Research
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/research-hub-v2/user/saved">
                    <Bookmark className="w-4 h-4 mr-2" />
                    View Saved Items
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/research-hub-v2/user/messages">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Messages
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/research-hub-v2/user/subscriptions">
                    <Star className="w-4 h-4 mr-2" />
                    Manage Subscriptions
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Subscription Status */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription</h2>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Premium Plan</h3>
                <p className="text-sm text-gray-600 mb-4">Full access to all research</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/research-hub-v2/user/subscriptions">
                    Manage Plan
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
