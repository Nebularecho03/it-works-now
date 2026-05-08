"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  Upload,
  FileText,
  Calendar,
  Users,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Target
} from "lucide-react";
import Link from "next/link";

// Mock publication data
const mockPublications = [
  {
    id: "1",
    title: "Traditional Luhya Mourning Rituals: Cultural Insights and Therapeutic Implications",
    summary: "An ethnographic study of traditional mourning practices among the Luhya people of Kenya, exploring their psychological significance and therapeutic potential.",
    type: "Journal Article",
    year: "2024",
    journal: "African Psychology Review",
    authors: ["Dr. Stephen Asatsa", "Dr. Jane Smith", "Dr. Michael Johnson"],
    project: "Traditional Luhya Mourning Rituals",
    fileUrl: "/publications/mourning-rituals-2024.pdf",
    externalLink: "https://doi.org/10.1234/apr.2024.001",
    status: "published",
    category: "Cultural Psychology",
    abstract: "This study examines the traditional mourning rituals of the Luhya people, focusing on their psychological significance and potential therapeutic applications in modern mental health practice.",
    keywords: ["mourning rituals", "cultural psychology", "Luhya", "therapeutic implications"],
    citations: 12,
    downloads: 245,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20"
  },
  {
    id: "2",
    title: "Decolonizing Mental Health in African Contexts: A Comprehensive Review",
    summary: "A systematic review of culturally appropriate mental health interventions across African communities, highlighting the need for decolonized approaches.",
    type: "Review Article",
    year: "2023",
    journal: "International Journal of Mental Health",
    authors: ["Dr. Stephen Asatsa", "International Collaborators"],
    project: "Decolonizing Mental Health in African Contexts",
    fileUrl: "/publications/decolonizing-mental-health-2023.pdf",
    externalLink: "https://doi.org/10.1234/ijmh.2023.002",
    status: "published",
    category: "Mental Health",
    abstract: "This comprehensive review examines the current state of mental health interventions in African contexts and argues for the integration of indigenous knowledge systems.",
    keywords: ["decolonization", "mental health", "African contexts", "indigenous knowledge"],
    citations: 28,
    downloads: 567,
    createdAt: "2023-03-10",
    updatedAt: "2023-08-15"
  },
  {
    id: "3",
    title: "Community-Based Mental Health Interventions: A Participatory Approach",
    summary: "Development and testing of community-driven mental health programs in rural Kenyan communities using participatory action research methods.",
    type: "Conference Paper",
    year: "2024",
    journal: "African Mental Health Conference Proceedings",
    authors: ["Dr. Jane Smith", "Community Health Workers"],
    project: "Community-Based Mental Health Interventions",
    fileUrl: "/publications/community-interventions-2024.pdf",
    externalLink: null,
    status: "draft",
    category: "Community Health",
    abstract: "This paper presents a participatory approach to developing community-based mental health interventions, demonstrating the effectiveness of community involvement.",
    keywords: ["community health", "participatory research", "mental health interventions"],
    citations: 5,
    downloads: 89,
    createdAt: "2024-06-01",
    updatedAt: "2024-06-10"
  }
];

const statusColors: Record<string, string> = {
  published: "bg-green-100 text-green-800",
  draft: "bg-yellow-100 text-yellow-800",
  under_review: "bg-blue-100 text-blue-800",
  archived: "bg-gray-100 text-gray-800"
};

const typeColors: Record<string, string> = {
  "Journal Article": "bg-purple-100 text-purple-800",
  "Review Article": "bg-blue-100 text-blue-800",
  "Conference Paper": "bg-amber-100 text-amber-800",
  "Book Chapter": "bg-emerald-100 text-emerald-800",
  "Thesis": "bg-red-100 text-red-800"
};

export default function AdminPublicationsPage() {
  const [publications, setPublications] = useState(mockPublications);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPublication, setEditingPublication] = useState<typeof mockPublications[0] | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    type: "Journal Article",
    year: new Date().getFullYear().toString(),
    journal: "",
    authors: "",
    project: "",
    fileUrl: "",
    externalLink: "",
    status: "draft",
    category: "",
    abstract: "",
    keywords: ""
  });

  const filteredPublications = publications.filter(pub => {
    const matchesSearch = pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pub.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pub.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || pub.status === statusFilter;
    const matchesType = typeFilter === "all" || pub.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreatePublication = () => {
    const newPublication = {
      id: Date.now().toString(),
      ...formData,
      authors: formData.authors.split(",").map(author => author.trim()),
      keywords: formData.keywords.split(",").map(keyword => keyword.trim()),
      citations: 0,
      downloads: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setPublications([...publications, newPublication]);
    setShowCreateForm(false);
    setFormData({
      title: "",
      summary: "",
      type: "Journal Article",
      year: new Date().getFullYear().toString(),
      journal: "",
      authors: "",
      project: "",
      fileUrl: "",
      externalLink: "",
      status: "draft",
      category: "",
      abstract: "",
      keywords: ""
    });
  };

  const handleEditPublication = (publication: typeof mockPublications[0]) => {
    setEditingPublication(publication);
    setFormData({
      title: publication.title,
      summary: publication.summary,
      type: publication.type,
      year: publication.year,
      journal: publication.journal,
      authors: publication.authors.join(", "),
      project: publication.project,
      fileUrl: publication.fileUrl,
      externalLink: publication.externalLink || "",
      status: publication.status,
      category: publication.category,
      abstract: publication.abstract,
      keywords: publication.keywords.join(", ")
    });
  };

  const handleUpdatePublication = () => {
    if (!editingPublication) return;
    setPublications(publications.map(p => 
      p.id === editingPublication.id 
        ? { ...p, ...formData, authors: formData.authors.split(",").map(author => author.trim()), keywords: formData.keywords.split(",").map(keyword => keyword.trim()), updatedAt: new Date().toISOString().split('T')[0] }
        : p
    ));
    setEditingPublication(null);
    setFormData({
      title: "",
      summary: "",
      type: "Journal Article",
      year: new Date().getFullYear().toString(),
      journal: "",
      authors: "",
      project: "",
      fileUrl: "",
      externalLink: "",
      status: "draft",
      category: "",
      abstract: "",
      keywords: ""
    });
  };

  const handleDeletePublication = (publicationId: string) => {
    setPublications(publications.filter(p => p.id !== publicationId));
  };

  const PublicationForm = ({ isEditing = false }) => (
    <Card className="p-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">
          {isEditing ? "Edit Publication" : "Add New Publication"}
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter publication title"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Type *</label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Journal Article">Journal Article</SelectItem>
                <SelectItem value="Review Article">Review Article</SelectItem>
                <SelectItem value="Conference Paper">Conference Paper</SelectItem>
                <SelectItem value="Book Chapter">Book Chapter</SelectItem>
                <SelectItem value="Thesis">Thesis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Year *</label>
            <Input
              value={formData.year}
              onChange={(e) => setFormData({...formData, year: e.target.value})}
              placeholder="Publication year"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Journal/Source</label>
            <Input
              value={formData.journal}
              onChange={(e) => setFormData({...formData, journal: e.target.value})}
              placeholder="Journal name or conference"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Project</label>
            <Select value={formData.project} onValueChange={(value) => setFormData({...formData, project: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Link to project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Traditional Luhya Mourning Rituals">Traditional Luhya Mourning Rituals</SelectItem>
                <SelectItem value="Decolonizing Mental Health in African Contexts">Decolonizing Mental Health</SelectItem>
                <SelectItem value="Community-Based Mental Health Interventions">Community Interventions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Authors *</label>
            <Input
              value={formData.authors}
              onChange={(e) => setFormData({...formData, authors: e.target.value})}
              placeholder="Enter authors separated by commas"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Summary *</label>
            <Textarea
              value={formData.summary}
              onChange={(e) => setFormData({...formData, summary: e.target.value})}
              placeholder="Brief summary of the publication"
              rows={3}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Abstract</label>
            <Textarea
              value={formData.abstract}
              onChange={(e) => setFormData({...formData, abstract: e.target.value})}
              placeholder="Full abstract"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Keywords</label>
            <Input
              value={formData.keywords}
              onChange={(e) => setFormData({...formData, keywords: e.target.value})}
              placeholder="Enter keywords separated by commas"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cultural Psychology">Cultural Psychology</SelectItem>
                <SelectItem value="Mental Health">Mental Health</SelectItem>
                <SelectItem value="Community Health">Community Health</SelectItem>
                <SelectItem value="Indigenous Knowledge">Indigenous Knowledge</SelectItem>
                <SelectItem value="Thanatology">Thanatology</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">PDF File URL</label>
            <Input
              value={formData.fileUrl}
              onChange={(e) => setFormData({...formData, fileUrl: e.target.value})}
              placeholder="Path to PDF file"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">External Link (DOI)</label>
            <Input
              value={formData.externalLink}
              onChange={(e) => setFormData({...formData, externalLink: e.target.value})}
              placeholder="https://doi.org/..."
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={isEditing ? handleUpdatePublication : handleCreatePublication}>
            {isEditing ? "Update Publication" : "Add Publication"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowCreateForm(false);
              setEditingPublication(null);
              setFormData({
                title: "",
                summary: "",
                type: "Journal Article",
                year: new Date().getFullYear().toString(),
                journal: "",
                authors: "",
                project: "",
                fileUrl: "",
                externalLink: "",
                status: "draft",
                category: "",
                abstract: "",
                keywords: ""
              });
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Publications Management</h1>
          <p className="text-muted-foreground">Add, edit, and manage research publications</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Publication
        </Button>
      </section>

      {/* Create/Edit Form */}
      {(showCreateForm || editingPublication) && (
        <PublicationForm isEditing={!!editingPublication} />
      )}

      {/* Filters */}
      <section className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search publications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Journal Article">Journal Article</SelectItem>
            <SelectItem value="Review Article">Review Article</SelectItem>
            <SelectItem value="Conference Paper">Conference Paper</SelectItem>
            <SelectItem value="Book Chapter">Book Chapter</SelectItem>
            <SelectItem value="Thesis">Thesis</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {/* Publications List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Publications ({filteredPublications.length})</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {filteredPublications.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No publications found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Get started by adding your first publication"}
            </p>
            {!searchTerm && statusFilter === "all" && typeFilter === "all" && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Publication
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPublications.map((publication) => (
              <Card key={publication.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{publication.title}</h3>
                          <Badge className={statusColors[publication.status]}>
                            {publication.status}
                          </Badge>
                          <Badge className={typeColors[publication.type]}>
                            {publication.type}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{publication.summary}</p>
                        
                        <div className="grid gap-4 md:grid-cols-2 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">Authors:</span>
                              <span>{publication.authors.join(", ")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">Journal:</span>
                              <span>{publication.journal}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">Project:</span>
                              <span>{publication.project}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">Year:</span>
                              <span>{publication.year}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">Updated:</span>
                              <span>{publication.updatedAt}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Download className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">Downloads:</span>
                              <span>{publication.downloads}</span>
                            </div>
                          </div>
                        </div>

                        {publication.keywords && publication.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {publication.keywords.map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{publication.fileUrl ? "PDF available" : "No PDF"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ExternalLink className="w-4 h-4" />
                        <span>{publication.externalLink ? "External link" : "No external link"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>{publication.citations} citations</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditPublication(publication)}>
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeletePublication(publication.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
