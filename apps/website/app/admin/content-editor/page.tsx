"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Edit3, 
  Save, 
  Eye, 
  Send, 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  Search,
  Plus,
  Trash2,
  Copy,
  BarChart3
} from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  type: 'page' | 'section' | 'article';
  status: 'draft' | 'published' | 'archived';
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  views?: number;
  category?: string;
  tags?: string[];
}

const mockContent: ContentItem[] = [
  {
    id: "1",
    title: "About Lab - Main Content",
    type: "page",
    status: "published",
    content: "# About the HDLK-L Lab\n\nThe Human Development, Indigenous Knowledge and Flourishing Lab is dedicated to...",
    author: "Dr. Stephen Asatsa",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    publishedAt: "2024-01-18",
    views: 1250,
    category: "Lab Information",
    tags: ["about", "lab", "research"]
  },
  {
    id: "2",
    title: "Research Methodology Section",
    type: "section",
    status: "draft",
    content: "## Our Research Approach\n\nWe employ a mixed-methods approach that combines...",
    author: "Dr. Jane Smith",
    createdAt: "2024-02-01",
    updatedAt: "2024-02-10",
    category: "Research Methods",
    tags: ["methodology", "research", "approach"]
  },
  {
    id: "3",
    title: "Community Engagement Guidelines",
    type: "article",
    status: "published",
    content: "# Community Engagement Guidelines\n\n## Introduction\n\nOur approach to community engagement is based on...",
    author: "Dr. Stephen Asatsa",
    createdAt: "2024-01-20",
    updatedAt: "2024-01-25",
    publishedAt: "2024-01-22",
    views: 450,
    category: "Community",
    tags: ["community", "engagement", "guidelines"]
  }
];

const statusColors: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800"
};

const typeColors: Record<string, string> = {
  page: "bg-blue-100 text-blue-800",
  section: "bg-purple-100 text-purple-800",
  article: "bg-emerald-100 text-emerald-800"
};

export default function ContentEditorPage() {
  const [content, setContent] = useState(mockContent);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "page" as const,
    content: "",
    category: "",
    tags: "",
    status: "draft" as const
  });

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateContent = () => {
    const newItem: ContentItem = {
      id: Date.now().toString(),
      ...formData,
      author: "Current User",
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setContent([...content, newItem]);
    setFormData({
      title: "",
      type: "page",
      content: "",
      category: "",
      tags: "",
      status: "draft"
    });
    setEditingItem(null);
  };

  const handleEditContent = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      type: item.type,
      content: item.content,
      category: item.category || "",
      tags: item.tags?.join(", ") || "",
      status: item.status
    });
  };

  const handleUpdateContent = () => {
    if (!editingItem) return;
    setContent(content.map(item => 
      item.id === editingItem.id 
        ? { 
            ...item, 
            ...formData, 
            tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
            updatedAt: new Date().toISOString().split('T')[0],
            publishedAt: formData.status === 'published' && item.status !== 'published' 
              ? new Date().toISOString().split('T')[0] 
              : item.publishedAt
          }
        : item
    ));
    setEditingItem(null);
    setFormData({
      title: "",
      type: "page",
      content: "",
      category: "",
      tags: "",
      status: "draft"
    });
  };

  const handlePublishContent = (itemId: string) => {
    setContent(content.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            status: 'published' as const,
            publishedAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
          }
        : item
    ));
  };

  const handleArchiveContent = (itemId: string) => {
    setContent(content.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            status: 'archived' as const,
            updatedAt: new Date().toISOString().split('T')[0]
          }
        : item
    ));
  };

  const handleDeleteContent = (itemId: string) => {
    setContent(content.filter(item => item.id !== itemId));
  };

  const renderPreview = (content: string) => {
    // Simple markdown-like rendering for preview
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
        } else if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-bold mt-3 mb-2">{line.slice(3)}</h2>;
        } else if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-semibold mt-2 mb-1">{line.slice(4)}</h3>;
        } else if (line.trim() === '') {
          return <br key={index} />;
        } else {
          return <p key={index} className="mb-2">{line}</p>;
        }
      });
  };

  const ContentEditor = () => (
    <Card className="p-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">
          {editingItem ? "Edit Content" : "Create New Content"}
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter content title"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Type *</label>
            <Select value={formData.type} onValueChange={(value: 'page' | 'section' | 'article') => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="page">Page</SelectItem>
                <SelectItem value="section">Section</SelectItem>
                <SelectItem value="article">Article</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              placeholder="Content category"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Content *</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Write your content here (supports basic markdown: # for headers, ## for subheaders, etc.)"
              rows={12}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Tags</label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="Enter tags separated by commas"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={formData.status} onValueChange={(value: 'draft' | 'published' | 'archived') => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button onClick={editingItem ? handleUpdateContent : handleCreateContent}>
              <Save className="w-4 h-4 mr-2" />
              {editingItem ? "Update" : "Create"}
            </Button>
            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? "Edit" : "Preview"}
            </Button>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              setEditingItem(null);
              setFormData({
                title: "",
                type: "page",
                content: "",
                category: "",
                tags: "",
                status: "draft"
              });
            }}
          >
            Cancel
          </Button>
        </div>

        {previewMode && (
          <div className="border rounded-lg p-6 bg-muted/30">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="prose max-w-none">
              {renderPreview(formData.content)}
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Editor</h1>
          <p className="text-muted-foreground">Create and manage website content with draft/publish workflow</p>
        </div>
        <Button onClick={() => setEditingItem(null)}>
          <Plus className="w-4 h-4 mr-2" />
          New Content
        </Button>
      </section>

      {/* Editor */}
      {editingItem !== null && <ContentEditor />}

      {/* Filters */}
      <section className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
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
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="page">Pages</SelectItem>
            <SelectItem value="section">Sections</SelectItem>
            <SelectItem value="article">Articles</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {/* Content List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Content ({filteredContent.length})</h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>{content.filter(c => c.status === 'published').length} published</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span>{content.filter(c => c.status === 'draft').length} drafts</span>
            </div>
          </div>
        </div>

        {filteredContent.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No content found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Get started by creating your first content"}
            </p>
            {!searchTerm && statusFilter === "all" && typeFilter === "all" && (
              <Button onClick={() => setEditingItem(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Content
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredContent.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <Badge className={statusColors[item.status]}>
                        {item.status}
                      </Badge>
                      <Badge className={typeColors[item.type]}>
                        {item.type}
                      </Badge>
                      {item.views && (
                        <Badge variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          {item.views}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground line-clamp-2">
                      {item.content.length > 150 
                        ? item.content.substring(0, 150) + "..." 
                        : item.content}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{item.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {item.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Updated: {item.updatedAt}</span>
                      </div>
                      {item.publishedAt && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Published: {item.publishedAt}</span>
                        </div>
                      )}
                    </div>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline" onClick={() => handleEditContent(item)}>
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    {item.status === 'draft' && (
                      <Button size="sm" variant="outline" onClick={() => handlePublishContent(item.id)}>
                        <Send className="w-4 h-4" />
                      </Button>
                    )}
                    {item.status === 'published' && (
                      <Button size="sm" variant="outline" onClick={() => handleArchiveContent(item.id)}>
                        <Clock className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleDeleteContent(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Stats Overview */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white">
        <div className="text-center space-y-6">
          <BarChart3 className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold">Content Overview</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">{content.length}</div>
              <div className="text-white/80">Total Content</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{content.filter(c => c.status === 'published').length}</div>
              <div className="text-white/80">Published</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{content.filter(c => c.status === 'draft').length}</div>
              <div className="text-white/80">Drafts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{content.reduce((sum, c) => sum + (c.views || 0), 0)}</div>
              <div className="text-white/80">Total Views</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
