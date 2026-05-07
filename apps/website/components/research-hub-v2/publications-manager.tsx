"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Download,
  Edit,
  Trash2,
  Calendar,
  ExternalLink,
  Upload,
  Grid,
  List,
  BarChart3
} from "lucide-react";

interface Publication {
  id: string;
  title: string;
  authors: string;
  year: number;
  abstract: string;
  content: string;
  fileUrl: string;
  coverImage: string;
  category: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  doi: string;
  journal: string;
  citations: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

interface PublicationsManagerProps {
  userRole: "ADMIN" | "RESEARCHER" | "USER";
  className?: string;
}

export default function PublicationsManager({ userRole, className = "" }: PublicationsManagerProps) {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPublications, setSelectedPublications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const categories = [
    "All Categories",
    "Cultural Psychology",
    "Clinical Psychology",
    "Educational Psychology",
    "Developmental Psychology"
  ];

  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "PUBLISHED", label: "Published" },
    { value: "DRAFT", label: "Draft" },
    { value: "ARCHIVED", label: "Archived" }
  ];

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      const response = await fetch('/api/research-hub-v2/publications');
      if (response.ok) {
        const data = await response.json();
        setPublications(data.publications);
      }
    } catch (error) {
      console.error('Failed to fetch publications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = publications;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(pub => 
        pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pub.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pub.abstract.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(pub => pub.category === selectedCategory);
    }

    // Filter by status
    if (selectedStatus !== "All") {
      filtered = filtered.filter(pub => pub.status === selectedStatus);
    }

    setFilteredPublications(filtered);
  }, [publications, searchQuery, selectedCategory, selectedStatus]);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/research-hub-v2/publications/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        await fetchPublications();
        setShowUpload(false);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleBulkAction = async (action: 'publish' | 'archive' | 'delete') => {
    if (selectedPublications.length === 0) return;
    
    try {
      const response = await fetch('/api/research-hub-v2/publications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          publicationIds: selectedPublications
        })
      });
      
      if (response.ok) {
        await fetchPublications();
        setSelectedPublications([]);
      }
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
    }
  };

  const toggleSelection = (publicationId: string) => {
    setSelectedPublications(prev => 
      prev.includes(publicationId) 
        ? prev.filter(id => id !== publicationId)
        : [...prev, publicationId]
    );
  };

  const selectAll = () => {
    setSelectedPublications(filteredPublications.map(pub => pub.id));
  };

  const clearSelection = () => {
    setSelectedPublications([]);
  };

  const canEdit = () => {
    return userRole === "ADMIN" || userRole === "RESEARCHER";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800 border-green-200";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search publications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {canEdit() && (
                <Button onClick={() => setShowUpload(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Publication
                </Button>
              )}
              
              <div className="hidden lg:flex items-center space-x-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-r-none ${viewMode === "grid" ? "bg-gray-100" : ""}`}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`rounded-l-none ${viewMode === "list" ? "bg-gray-100" : ""}`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

      {/* Bulk Actions */}
      {selectedPublications.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-blue-800">
                {selectedPublications.length} publication{selectedPublications.length === 1 ? "" : "s"} selected
              </span>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Clear Selection
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('publish')}
                disabled={!canEdit()}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Publish Selected
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('archive')}
                disabled={!canEdit()}
              >
                Archive Selected
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleBulkAction('delete')}
                disabled={!canEdit()}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Publications ({filteredPublications.length})
            </h1>
            <p className="text-gray-600">
              {filteredPublications.length} {filteredPublications.length === 1 ? "publication" : "publications"} found
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedPublications.length !== filteredPublications.length && (
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
            )}
            <Badge variant="outline">
              {selectedCategory}
            </Badge>
            <Badge variant="outline">
              {selectedStatus}
            </Badge>
          </div>
        </div>

        {/* Publications Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPublications.map((publication) => (
              <Card key={publication.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 relative">
                  {publication.coverImage ? (
                    <img 
                      src={publication.coverImage} 
                      alt={publication.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-16 h-16 text-blue-400" />
                    </div>
                  )}
                  
                  <div className="absolute top-3 left-3">
                    <input
                      type="checkbox"
                      checked={selectedPublications.includes(publication.id)}
                      onChange={() => toggleSelection(publication.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className={getStatusColor(publication.status)}>
                      {publication.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{publication.category}</Badge>
                    <span className="text-xs text-gray-500">{publication.year}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {publication.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Authors:</strong> {publication.authors}
                  </p>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {publication.abstract}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span>Citations: {publication.citations}</span>
                      <span>Downloads: {publication.downloads}</span>
                    </div>
                    <span>Updated {new Date(publication.updatedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      {publication.fileUrl && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {canEdit() && (
                      <Button size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPublications.map((publication) => (
              <Card key={publication.id} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedPublications.includes(publication.id)}
                      onChange={() => toggleSelection(publication.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <Badge className={getStatusColor(publication.status)}>
                      {publication.status}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {publication.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{publication.category}</Badge>
                        <span className="text-xs text-gray-500">{publication.year}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Authors:</strong> {publication.authors}
                    </p>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {publication.abstract}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <span>Citations: {publication.citations}</span>
                        <span>Downloads: {publication.downloads}</span>
                        {publication.doi && <span>DOI: {publication.doi}</span>}
                      </div>
                      <span>Updated {new Date(publication.updatedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        {publication.fileUrl && (
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {canEdit() && (
                        <Button size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredPublications.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No publications found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All Categories");
              setSelectedStatus("All");
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Upload Publication</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowUpload(false)}
                >
                  ×
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Publication File</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="text-sm text-gray-600">
                  Accepted formats: PDF, DOC, DOCX • Max size: 10MB
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
