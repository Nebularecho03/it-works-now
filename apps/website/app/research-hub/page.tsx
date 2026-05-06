"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { siteContent } from "@/lib/content/site-content";
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
  ArrowRight,
  Target,
  Award,
  Globe,
  Heart
} from "lucide-react";

const quickAccessCards = [
  {
    title: "About",
    description: "Lab identity and research philosophy",
    icon: Brain,
    href: "/research-hub/about",
    count: null
  },
  {
    title: "Projects",
    description: "Active and completed research",
    icon: Microscope,
    href: "/research-hub/projects",
    count: siteContent.researchProjects.length
  },
  {
    title: "Publications",
    description: "Papers and publications",
    icon: FileText,
    href: "/research-hub/activities",
    count: siteContent.publications.length
  },
  {
    title: "Tasks",
    description: "Research milestones",
    icon: ListChecks,
    href: "/research-hub/tasks",
    count: null
  },
  {
    title: "Awards",
    description: "Recognition and grants",
    icon: Trophy,
    href: "/research-hub/awards",
    count: siteContent.awards.length
  },
  {
    title: "Team",
    description: "Collaborators and network",
    icon: Users,
    href: "/research-hub/team",
    count: siteContent.collaborators.length
  }
];

const statsData = [
  { label: "Projects", value: siteContent.researchProjects.length, icon: Target, color: "text-emerald-600" },
  { label: "Publications", value: siteContent.publications.length, icon: FileText, color: "text-blue-600" },
  { label: "Awards", value: siteContent.awards.length, icon: Award, color: "text-amber-600" },
  { label: "Collaborators", value: siteContent.collaborators.length, icon: Users, color: "text-purple-600" }
];

const recentActivity = [
  { title: "New project submitted", detail: "Traditional Luhya Mourning Rituals", time: "2 days ago", type: "project" },
  { title: "Publication updated", detail: "Cultural Psychology Review", time: "1 week ago", type: "publication" },
  { title: "Team member added", detail: "Dr. Jane Doe, Research Fellow", time: "2 weeks ago", type: "team" },
  { title: "Grant approved", detail: "Templeton Foundation - $150,000", time: "1 month ago", type: "award" }
];

export default function ResearchHubDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Research Hub</h1>
        <p className="text-muted-foreground mt-1">
          Human Development, Indigenous Knowledge and Flourishing Lab
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color} opacity-80`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Access Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickAccessCards.map((card) => (
            <Link key={card.title} href={card.href}>
              <Card className="p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer h-full">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <card.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{card.title}</h3>
                      <p className="text-sm text-muted-foreground">{card.description}</p>
                    </div>
                  </div>
                  {card.count !== null && (
                    <Badge variant="secondary">{card.count}</Badge>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{activity.detail}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Research Focus Areas */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Research Focus</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Globe className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Cultural Psychology</p>
                <p className="text-xs text-muted-foreground">Indigenous knowledge systems</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Heart className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Clinical Psychology</p>
                <p className="text-xs text-muted-foreground">Evidence-based interventions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Community Mental Health</p>
                <p className="text-xs text-muted-foreground">Prevention and intervention</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium">Decolonization</p>
                <p className="text-xs text-muted-foreground">Transforming psychological practice</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Projects Preview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Active Projects</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/research-hub/projects">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {siteContent.researchProjects.slice(0, 3).map((project, index) => (
            <Card key={index} className="p-4 border-l-4 border-l-primary">
              <div className="flex items-start justify-between mb-2">
                <Badge variant={project.status === "Active" ? "default" : "secondary"}>
                  {project.status}
                </Badge>
                {project.funding && (
                  <span className="text-xs text-muted-foreground">{project.funding}</span>
                )}
              </div>
              <h3 className="font-semibold text-sm mb-1">{project.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">{project.summary}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{project.category}</span>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
