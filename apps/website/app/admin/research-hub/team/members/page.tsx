"use client";

import { useState, useEffect } from "react";
import { ResearchHubLayout } from "@/components/admin/research-hub/layout/research-hub-layout";
import { DataTable } from "@/components/admin/research-hub/ui/data-table";
import { AddButton, RefreshButton } from "@/components/admin/research-hub/ui/action-buttons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Globe, 
  Building, 
  Mail, 
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/lib/admin/research-hub/types";
import { getStatusColor, formatDate, truncateText } from "@/lib/admin/research-hub/utils";

// Mock data - replace with actual API calls
const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    slug: "stephen-asatsa",
    title: "Dr. Stephen Asatsa",
        status: "published",
    featured: true,
    name: "Dr. Stephen Asatsa",
    role: "Senior Lecturer & Head of Psychology Department",
    institution: "Catholic University of Eastern Africa",
    country: "Kenya",
    bio: "Dr. Stephen Asatsa is a registered and licensed psychologist with expertise in cultural psychology, thanatology, and indigenous knowledge systems. He leads the HDLK-L research lab focusing on culturally grounded approaches to mental health.",
    expertise: ["Cultural Psychology", "Thanatology", "Indigenous Knowledge Systems", "Mental Health"],
    avatar: "/uploads/team/stephen-asatsa.jpg",
    links: {
      orcid: "https://orcid.org/0000-0002-1234-5678",
      googleScholar: "https://scholar.google.com/citations?user=example",
      researchGate: "https://www.researchgate.net/profile/Stephen-Asatsa",
      website: "https://www.cuea.edu",
      email: "s.asatsa@cuea.edu"
    },
    seo: {
      title: "Dr. Stephen Asatsa - HDLK-L Research Lab",
      description: "Senior Lecturer and Director of HDLK-L Research Lab specializing in cultural psychology and indigenous knowledge systems",
      keywords: ["Stephen Asatsa", "Cultural Psychology", "HDLK-L", "Indigenous Knowledge"]
    },
    createdAt: "2023-01-15T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    createdBy: "admin",
    updatedBy: "admin"
  },
  {
    id: "2",
    slug: "sheina-lew-levy",
    title: "Sheina Lew-Levy, PhD",
        status: "published",
    featured: true,
    name: "Sheina Lew-Levy",
    role: "Professor of Cultural Evolution",
    institution: "Durham University",
    country: "United Kingdom",
    bio: "Professor Lew-Levy is a leading researcher in cultural evolution and cognitive anthropology. Her work focuses on how cultural practices evolve and spread across populations.",
    expertise: ["Cultural Evolution", "Cognitive Anthropology", "Social Learning", "Cross-Cultural Research"],
    avatar: "/uploads/team/sheina-lew-levy.jpg",
    links: {
      website: "https://www.durham.ac.uk/staff/sheina-lew-levy/",
      orcid: "https://orcid.org/0000-0002-8765-4321",
      googleScholar: "https://scholar.google.com/citations?user=example2"
    },
    seo: {
      title: "Prof. Sheina Lew-Levy - Cultural Evolution Research",
      description: "Professor specializing in cultural evolution and cognitive anthropology at Durham University",
      keywords: ["Sheina Lew-Levy", "Cultural Evolution", "Cognitive Anthropology"]
    },
    createdAt: "2023-02-01T00:00:00Z",
    updatedAt: "2024-01-14T15:45:00Z",
    createdBy: "admin",
    updatedBy: "admin"
  },
  {
    id: "3",
    slug: "amber-thalmayer",
    title: "Prof. Amber Gayle Thalmayer",
    status: "published",
    featured: false,
    name: "Prof. Amber Gayle Thalmayer",
    role: "Professor of Psychology",
    institution: "University of Zurich",
    country: "Switzerland",
    bio: "Professor Thalmayer specializes in cross-cultural psychology and adolescent development. Her research examines how cultural contexts influence psychological development and wellbeing.",
    expertise: ["Cross-Cultural Psychology", "Adolescent Development", "Wellbeing", "Research Methodology"],
    avatar: "/uploads/team/amber-thalmayer.jpg",
    links: {
      website: "https://www.psychologie.uzh.ch/en/people/faculty/thalmayer.html",
      orcid: "https://orcid.org/0000-0002-3456-7890"
    },
    seo: {
      title: "Prof. Amber Thalmayer - Cross-Cultural Psychology",
      description: "Professor specializing in cross-cultural psychology and adolescent development at University of Zurich",
      keywords: ["Amber Thalmayer", "Cross-Cultural Psychology", "Adolescent Development"]
    },
    createdAt: "2023-03-01T00:00:00Z",
    updatedAt: "2024-01-13T09:20:00Z",
    createdBy: "admin",
    updatedBy: "admin"
  }
];

export default function TeamMembersPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTeamMembers(mockTeamMembers);
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadTeamMembers();
  };

  const handleViewMember = (member: TeamMember) => {
    window.open(`/research-hub/team/${member.slug}`, '_blank');
  };

  const handleEditMember = (member: TeamMember) => {
    window.location.href = `/admin/research-hub/team/members/${member.id}/edit`;
  };

  const handleDeleteMember = async (member: TeamMember) => {
    if (confirm(`Are you sure you want to delete "${member.name}"?`)) {
      try {
        // TODO: Implement delete API call
        setTeamMembers(prev => prev.filter(m => m.id !== member.id));
        console.log('Team member deleted:', member.id);
      } catch (error) {
        console.error('Failed to delete team member:', error);
      }
    }
  };

  const handleDuplicateMember = async (member: TeamMember) => {
    try {
      // TODO: Implement duplicate API call
      const duplicatedMember = {
        ...member,
        id: Date.now().toString(),
        name: `${member.name} (Copy)`,
        slug: `${member.slug}-copy`,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setTeamMembers(prev => [duplicatedMember, ...prev]);
      console.log('Team member duplicated:', member.id);
    } catch (error) {
      console.error('Failed to duplicate team member:', error);
    }
  };

  const columns = [
    {
      key: "name",
      title: "Team Member",
      sortable: true,
      render: (value: string, row: TeamMember) => (
        <div className="flex items-center gap-3">
          {row.avatar ? (
            <img
              src={row.avatar}
              alt={row.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-[#0F766E] to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {row.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="space-y-1">
            <div className="font-medium text-gray-900">{row.name}</div>
            <div className="text-sm text-gray-500">{row.role}</div>
            <div className="flex items-center gap-2">
              <StatusBadge status={row.status} />
              {row.featured && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                  Featured
                </Badge>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: "institution",
      title: "Institution",
      render: (value: string, row: TeamMember) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">{value}</div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Globe className="w-3 h-3" />
            <span>{row.country}</span>
          </div>
        </div>
      )
    },
    {
      key: "expertise",
      title: "Expertise",
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((exp, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {exp}
            </Badge>
          ))}
          {value.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{value.length - 2} more
            </Badge>
          )}
        </div>
      )
    },
    {
      key: "links",
      title: "Contact",
      render: (value: TeamMember["links"], row: TeamMember) => (
        <div className="flex items-center gap-2">
          {value.email && (
            <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
              <Mail className="w-3 h-3" />
            </Button>
          )}
          {value.website && (
            <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
              <ExternalLink className="w-3 h-3" />
            </Button>
          )}
          {(value.orcid || value.googleScholar || value.researchGate) && (
            <span className="text-xs text-gray-500">
              {Object.keys(value).filter(key => value[key as keyof typeof value]).length} profiles
            </span>
          )}
        </div>
      )
    },
    {
      key: "updatedAt",
      title: "Last Updated",
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">{formatDate(value)}</span>
      )
    }
  ];

  return (
    <ResearchHubLayout title="Team Members">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
            <p className="text-gray-600">Manage research team members and their profiles</p>
          </div>
          <div className="flex items-center gap-3">
            <RefreshButton onClick={handleRefresh} loading={loading} />
            <AddButton onClick={() => window.location.href = '/admin/research-hub/team/members/new'}>
              New Team Member
            </AddButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {teamMembers.filter(m => m.status === 'published').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✓</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {teamMembers.filter(m => m.status === 'draft').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm">○</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Featured</p>
                <p className="text-2xl font-bold text-purple-600">
                  {teamMembers.filter(m => m.featured).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm">★</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Team Members Table */}
        <Card className="p-6">
          <DataTable
            data={teamMembers}
            columns={columns}
            loading={loading}
            searchable={false}
            pagination={{
              page: 1,
              limit: 20,
              total: teamMembers.length,
              onPageChange: () => {},
              onLimitChange: () => {}
            }}
            sorting={{
              sortBy: "updatedAt" as keyof TeamMember,
              sortOrder: "desc",
              onSort: () => {}
            }}
            actions={{
              view: handleViewMember,
              edit: handleEditMember,
              delete: handleDeleteMember,
              duplicate: handleDuplicateMember
            }}
          />
        </Card>
      </div>
    </ResearchHubLayout>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={cn(getStatusColor(status))}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
