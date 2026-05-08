"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload,
  Download,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Eye,
  Trash2,
  Edit3,
  FileImage,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Share2,
  Copy,
  MoreVertical,
  File,
  Video,
  FileText,
  Folder,
  Tag,
  BarChart3,
  RefreshCw,
  FolderOpen,
  X
} from "lucide-react";

interface MediaItem {
  id: string;
  filename: string;
  type: 'image' | 'video' | 'document';
  size: number;
  uploadedAt: string;
  url: string;
  thumbnail?: string;
  tags?: string[];
}

export default function MediaManagementPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Mock data - in real implementation, this would come from database
  useEffect(() => {
    const mockMedia: MediaItem[] = [
      {
        id: '1',
        filename: 'hero-banner.jpg',
        type: 'image',
        size: 245760,
        uploadedAt: '2024-01-15T10:00:00Z',
        url: '/images/hero-banner.jpg',
        thumbnail: '/images/hero-banner-thumb.jpg',
        tags: ['hero', 'banner', 'psychology']
      },
      {
        id: '2',
        filename: 'dr-asatsa-profile.jpg',
        type: 'image',
        size: 156320,
        uploadedAt: '2024-01-14T15:30:00Z',
        url: '/images/dr-asatsa-profile.jpg',
        thumbnail: '/images/dr-asatsa-profile-thumb.jpg',
        tags: ['profile', 'professional', 'psychology']
      },
      {
        id: '3',
        filename: 'therapy-session-intro.mp4',
        type: 'video',
        size: 5242880,
        uploadedAt: '2024-01-13T09:15:00Z',
        url: '/videos/therapy-session-intro.mp4',
        tags: ['therapy', 'session', 'introduction']
      },
      {
        id: '4',
        filename: 'clinical-psychology-guide.pdf',
        type: 'document',
        size: 1048576,
        uploadedAt: '2024-01-12T14:20:00Z',
        url: '/documents/clinical-psychology-guide.pdf',
        tags: ['clinical', 'psychology', 'guide']
      }
    ];
    
    setMedia(mockMedia);
    setLoading(false);
  }, []);

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || item.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this media file?')) {
      setMedia(prev => prev.filter(item => item.id !== id));
      setSelectedItems(prev => prev.filter(item => item !== id));
    }
  };

  const handlePreview = (item: MediaItem) => {
    setSelectedMedia(item);
    setShowPreview(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      image: FileImage,
      video: Video,
      document: File
    };
    return icons[type as keyof typeof icons] || File;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      image: 'bg-blue-100 text-blue-800',
      video: 'bg-green-100 text-green-800',
      document: 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Media Library</h1>
          <p className="text-slate-600">Manage images, videos, and documents for your website</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload Media
        </Button>
      </div>

      {/* Filters and Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search media files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
            <span className="text-sm text-slate-600">
              {selectedItems.length} items selected
            </span>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download Selected
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 hover:text-red-700"
              onClick={() => {
                if (confirm(`Delete ${selectedItems.length} selected items?`)) {
                  setMedia(prev => prev.filter(item => !selectedItems.includes(item.id)));
                  setSelectedItems([]);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        )}
      </Card>

      {/* Media Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
        {filteredMedia.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-slate-100 relative">
              {item.type === 'image' ? (
                <img 
                  src={item.thumbnail || item.url} 
                  alt={item.filename}
                  className="w-full h-full object-cover"
                />
              ) : item.type === 'video' ? (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                  <Video className="w-12 h-12 text-slate-400" />
                </div>
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                  <FileText className="w-12 h-12 text-slate-400" />
                </div>
              )}
              
              {/* Selection checkbox */}
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleSelect(item.id)}
                  className="rounded border-slate-300 bg-white"
                />
              </div>
              
              {/* Type indicator */}
              <div className="absolute top-2 right-2">
                <Badge className={getTypeColor(item.type)} variant="secondary">
                  {item.type}
                </Badge>
              </div>
            </div>

            {/* Media Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-slate-900 truncate">{item.filename}</h4>
                  <div className="text-xs text-slate-500">
                    {new Date(item.uploadedAt).toLocaleDateString()} • {formatFileSize(item.size)}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => handlePreview(item)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredMedia.length === 0 && (
        <Card className="p-12 text-center">
          <FolderOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No media found</h3>
          <p className="text-slate-600">
            {searchTerm ? 'No media files match your search criteria.' : 'No media files have been uploaded yet.'}
          </p>
        </Card>
      )}

      {/* Preview Modal */}
      {showPreview && selectedMedia && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-slate-900">Media Preview</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="max-h-[calc(90vh-8rem)] overflow-y-auto p-4">
              {selectedMedia.type === 'image' ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.filename}
                  className="w-full h-auto object-contain"
                />
              ) : selectedMedia.type === 'video' ? (
                <video
                  src={selectedMedia.url}
                  className="w-full h-auto object-contain"
                  controls
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <FileText className="w-12 h-12 text-slate-400" />
                  <div className="text-center text-sm text-slate-600 mt-2">
                    <div>{selectedMedia.filename}</div>
                    <div>{formatFileSize(selectedMedia.size)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
