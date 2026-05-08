"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  Plus,
  Edit3,
  Brain,
  Upload,
  Clock,
  CheckCircle,
  Trophy
} from "lucide-react";

interface AdminStats {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  totalPublications: number;
  totalTeamMembers: number;
  totalAwards: number;
  totalEvents: number;
  totalMedia: number;
}

export default function AdminPage() {
  const [stats] = useState<AdminStats>({
    totalProjects: 12,
    publishedProjects: 8,
    draftProjects: 4,
    totalPublications: 28,
    totalTeamMembers: 6,
    totalAwards: 15,
    totalEvents: 8,
    totalMedia: 156
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <LayoutDashboard className="w-8 h-8 text-[#0F766E]" />
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Unified content management for the Research Hub
        </p>
      </section>

      {/* Stats Overview */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{stats.totalProjects}</h3>
              <p className="text-muted-foreground">Total Projects</p>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.publishedProjects} published • {stats.draftProjects} drafts
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{stats.totalPublications}</h3>
              <p className="text-muted-foreground">Publications</p>
            </div>
            <div className="text-sm text-muted-foreground">
              Papers, articles, and research outputs
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{stats.totalTeamMembers}</h3>
              <p className="text-muted-foreground">Team Members</p>
            </div>
            <div className="text-sm text-muted-foreground">
              Researchers and collaborators
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{stats.totalAwards}</h3>
              <p className="text-muted-foreground">Awards & Events</p>
            </div>
            <div className="text-sm text-muted-foreground">
              Recognition and activities
            </div>
          </div>
        </Card>
      </section>

      {/* Quick Actions */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Content Management</h2>
          <p className="text-muted-foreground">Manage all aspects of your Research Hub</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold">Projects</h3>
              <p className="text-muted-foreground">Create, edit, and manage research projects</p>
              <Button className="w-full" asChild>
                <Link href="/admin/projects">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Manage Projects
                </Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">Publications</h3>
              <p className="text-muted-foreground">Manage papers, articles, and research outputs</p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/admin/publications">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Manage Publications
                </Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold">Team</h3>
              <p className="text-muted-foreground">Manage team members and collaborators</p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/admin/team">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Manage Team
                </Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold">Awards & Events</h3>
              <p className="text-muted-foreground">Manage awards, recognition, and events</p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/admin/awards">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Manage Awards
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Media Management */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Media & Files</h2>
          <p className="text-muted-foreground">Manage images, documents, and other media</p>
        </div>

        <Card className="p-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center">
                <Upload className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold">Media Library</h3>
              <p className="text-muted-foreground">
                Upload, organize, and manage all media files for your research hub
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>{stats.totalMedia} files uploaded</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Image optimization enabled</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Automatic backup system</span>
                </div>
              </div>
              <Button className="w-full" asChild>
                <Link href="/admin/media">
                  <Upload className="w-4 h-4 mr-2" />
                  Manage Media
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                <Settings className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold">System Settings</h3>
              <p className="text-muted-foreground">
                Configure system-wide settings and preferences
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Site configuration</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>User permissions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Backup settings</span>
                </div>
              </div>
              <Button className="w-full" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Recent Activity */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Recent Activity</h2>
          <p className="text-muted-foreground">Latest updates and changes</p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            {[
              {
                action: "Project Updated",
                title: "Traditional Luhya Mourning Rituals",
                time: "2 hours ago",
                icon: Brain,
                color: "text-emerald-600 bg-emerald-50"
              },
              {
                action: "Publication Added",
                title: "Decolonizing Mental Health in African Contexts",
                time: "1 day ago",
                icon: FileText,
                color: "text-blue-600 bg-blue-50"
              },
              {
                action: "Team Member Added",
                title: "Dr. Jane Smith - Research Collaborator",
                time: "3 days ago",
                icon: Users,
                color: "text-purple-600 bg-purple-50"
              },
              {
                action: "Award Received",
                title: "Excellence in Cultural Psychology Research",
                time: "1 week ago",
                icon: Trophy,
                color: "text-amber-600 bg-amber-50"
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.color}`}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{activity.action}</div>
                  <div className="text-sm text-muted-foreground">{activity.title}</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Quick Stats */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white">
        <div className="text-center space-y-6">
          <BarChart3 className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold">System Overview</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">{stats.totalProjects}</div>
              <div className="text-white/80">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{stats.totalPublications}</div>
              <div className="text-white/80">Publications</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{stats.totalTeamMembers}</div>
              <div className="text-white/80">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">{stats.totalMedia}</div>
              <div className="text-white/80">Media Files</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
