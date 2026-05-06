"use client";

import { useState, useEffect } from "react";
import { ResearchHubLayout } from "@/components/admin/research-hub/layout/research-hub-layout";
import { DataTable } from "@/components/admin/research-hub/ui/data-table";
import { AddButton, RefreshButton } from "@/components/admin/research-hub/ui/action-buttons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Award as AwardIcon, 
  Calendar, 
  Building, 
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  Copy,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Award } from "@/lib/admin/research-hub/types";
import { getStatusColor, formatDate, truncateText, getAwardSignificanceColor } from "@/lib/admin/research-hub/utils";

// Mock data - replace with actual API calls
const mockAwards: Award[] = [
  {
    id: "1",
    slug: "durham-university-award-2024",
    title: "Durham University International Research Collaboration Award",
    status: "published",
    featured: true,
    issuingBody: "Durham University",
    year: "2024",
    description: "Award for exceptional international research collaboration in cultural psychology, recognizing contributions to cross-cultural understanding and academic excellence.",
    significance: "high",
    url: "https://www.durham.ac.uk",
    category: "Research Collaboration",
    seo: {
      title: "Durham University Research Award 2024",
      description: "International Research Collaboration Award from Durham University",
      keywords: ["Durham University", "Research Award", "Cultural Psychology"]
    },
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    createdBy: "admin",
    updatedBy: "admin"
  },
  {
    id: "2",
    slug: "hraf-global-scholar-2023",
    title: "Human Relations Area Files Global Scholar",
    status: "published",
    featured: true,
    issuingBody: "Human Relations Area Files",
    year: "2023",
    description: "Global Scholar recognition for outstanding contributions to cross-cultural research and the documentation of indigenous knowledge systems.",
    significance: "high",
    url: "https://hraf.yale.edu/hraf-global-scholar-stephen-asatsa/",
    category: "Academic Recognition",
    seo: {
      title: "HRAF Global Scholar 2023",
      description: "Human Relations Area Files Global Scholar recognition",
      keywords: ["HRAF", "Global Scholar", "Cross-cultural Research"]
    },
    createdAt: "2023-06-01T00:00:00Z",
    updatedAt: "2024-01-14T15:45:00Z",
    createdBy: "admin",
    updatedBy: "admin"
  },
  {
    id: "3",
    slug: "icdss-covid-scholar-2022",
    title: "ICDSS Covid Global Scholar",
    status: "published",
    featured: false,
    issuingBody: "International Consortium of Developmental Science Societies",
    year: "2022",
    description: "Global Scholar recognition for research examining the impact of COVID-19 on adolescent emotional regulation across different cultural contexts.",
    significance: "high",
    url: "http://www.fjcolab.org/srascholars-directory",
    category: "COVID-19 Research",
    seo: {
      title: "ICDSS COVID Global Scholar 2022",
      description: "International recognition for COVID-19 adolescent development research",
      keywords: ["ICDSS", "COVID-19", "Adolescent Development"]
    },
    createdAt: "2022-03-15T00:00:00Z",
    updatedAt: "2024-01-13T09:20:00Z",
    createdBy: "admin",
    updatedBy: "admin"
  },
  {
    id: "4",
    slug: "issbd-fellowship-2016",
    title: "International Society for the Study of Behavioral Development Developing Country Fellowship",
    status: "published",
    featured: false,
    issuingBody: "International Society for the Study of Behavioral Development",
    year: "2016-2018",
    description: "Three-year fellowship supporting research on behavioral development in developing countries, with focus on cultural contexts and adolescent wellbeing.",
    significance: "medium",
    category: "Fellowship",
    seo: {
      title: "ISSBD Developing Country Fellowship 2016",
      description: "Three-year fellowship for behavioral development research",
      keywords: ["ISSBD", "Fellowship", "Behavioral Development"]
    },
    createdAt: "2016-01-01T00:00:00Z",
    updatedAt: "2024-01-12T14:15:00Z",
    createdBy: "admin",
    updatedBy: "admin"
  }
];

export default function AwardsPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAwards();
  }, []);

  const loadAwards = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAwards(mockAwards);
    } catch (error) {
      console.error('Failed to load awards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAwards();
  };

  const handleViewAward = (award: Award) => {
    if (award.url) {
      window.open(award.url, '_blank');
    } else {
      window.open(`/research-hub/awards/${award.slug}`, '_blank');
    }
  };

  const handleEditAward = (award: Award) => {
    window.location.href = `/admin/research-hub/awards/awards/${award.id}/edit`;
  };

  const handleDeleteAward = async (award: Award) => {
    if (confirm(`Are you sure you want to delete "${award.title}"?`)) {
      try {
        // TODO: Implement delete API call
        setAwards(prev => prev.filter(a => a.id !== award.id));
        console.log('Award deleted:', award.id);
      } catch (error) {
        console.error('Failed to delete award:', error);
      }
    }
  };

  const handleDuplicateAward = async (award: Award) => {
    try {
      // TODO: Implement duplicate API call
      const duplicatedAward = {
        ...award,
        id: Date.now().toString(),
        title: `${award.title} (Copy)`,
        slug: `${award.slug}-copy`,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setAwards(prev => [duplicatedAward, ...prev]);
      console.log('Award duplicated:', award.id);
    } catch (error) {
      console.error('Failed to duplicate award:', error);
    }
  };

  const columns = [
    {
      key: "title",
      title: "Award",
      sortable: true,
      render: (value: string, row: Award) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{truncateText(row.description, 80)}</div>
          <div className="flex items-center gap-2">
            <StatusBadge status={row.status} />
            {row.featured && (
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                Featured
              </Badge>
            )}
            <Badge className={cn(getAwardSignificanceColor(row.significance))}>
              {row.significance}
            </Badge>
          </div>
        </div>
      )
    },
    {
      key: "issuingBody",
      title: "Issuing Body",
      render: (value: string, row: Award) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">{value}</div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Building className="w-3 h-3" />
            <span>{row.category}</span>
          </div>
        </div>
      )
    },
    {
      key: "year",
      title: "Year",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium">{value}</span>
        </div>
      )
    },
    {
      key: "significance",
      title: "Significance",
      render: (value: string) => (
        <Badge className={cn(getAwardSignificanceColor(value))}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    {
      key: "url",
      title: "External Link",
      render: (value: string, row: Award) => (
        <div className="flex items-center gap-2">
          {value ? (
            <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
              <ExternalLink className="w-3 h-3" />
            </Button>
          ) : (
            <span className="text-xs text-gray-400">No link</span>
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
    <ResearchHubLayout title="Awards Management">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Awards</h1>
            <p className="text-gray-600">Manage awards and recognitions received by the research team</p>
          </div>
          <div className="flex items-center gap-3">
            <RefreshButton onClick={handleRefresh} loading={loading} />
            <AddButton onClick={() => window.location.href = '/admin/research-hub/awards/awards/new'}>
              New Award
            </AddButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Awards</p>
                <p className="text-2xl font-bold text-gray-900">{awards.length}</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {awards.filter(a => a.status === 'published').length}
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
                <p className="text-sm font-medium text-gray-600">High Significance</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {awards.filter(a => a.significance === 'high').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Featured</p>
                <p className="text-2xl font-bold text-purple-600">
                  {awards.filter(a => a.featured).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm">★</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Awards Table */}
        <Card className="p-6">
          <DataTable
            data={awards}
            columns={columns}
            loading={loading}
            searchable={false}
            pagination={{
              page: 1,
              limit: 20,
              total: awards.length,
              onPageChange: () => {},
              onLimitChange: () => {}
            }}
            sorting={{
              sortBy: "updatedAt" as keyof Award,
              sortOrder: "desc",
              onSort: () => {}
            }}
            actions={{
              view: handleViewAward,
              edit: handleEditAward,
              delete: handleDeleteAward,
              duplicate: handleDuplicateAward
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
