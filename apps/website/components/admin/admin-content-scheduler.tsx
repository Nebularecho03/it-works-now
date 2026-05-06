"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Save,
  Upload,
  Eye,
  EyeOff,
  Edit3,
  Plus,
  X,
  Trash2,
  RefreshCw,
  Play,
  Pause,
  BarChart3,
  Bell,
  Check,
  AlertCircle,
  Info,
  Zap,
  Target,
  TrendingUp,
  Users,
  FileText,
  Download,
  Settings
} from "lucide-react";

interface ScheduledContent {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'scheduled' | 'published';
  publishDate?: Date;
  expireDate?: Date;
  category?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
}

interface ContentSchedulerProps {
  scheduledContent?: ScheduledContent[];
  onSave?: (content: ScheduledContent[]) => void;
}

export function AdminContentScheduler({ scheduledContent = [], onSave }: ContentSchedulerProps) {
  const [content, setContent] = useState<ScheduledContent[]>(scheduledContent);
  const [activeTab, setActiveTab] = useState<'calendar' | 'queue' | 'settings'>('calendar');
  const [selectedContent, setSelectedContent] = useState<ScheduledContent | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const addNewContent = () => {
    const newContent: ScheduledContent = {
      id: Date.now().toString(),
      title: 'New Content',
      content: '',
      status: 'draft',
      category: 'content',
      priority: 'medium',
      tags: []
    };
    setContent(prev => [...prev, newContent]);
  };

  const updateContent = (id: string, updates: Partial<ScheduledContent>) => {
    setContent(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteContent = (id: string) => {
    setContent(prev => prev.filter(item => item.id !== id));
    setSelectedContent(null);
  };

  const scheduleContent = (id: string, date: Date) => {
    setContent(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'scheduled', publishDate: date } : item
    ));
  };

  const publishContent = (id: string) => {
    setContent(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'published' } : item
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600';
      case 'scheduled': return 'text-blue-600';
      case 'published': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h2 className="font-display text-2xl font-bold text-slate-900">Content Scheduler</h2>
        
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('calendar')}
          >
            <Calendar className="w-4 h-3 mr-1" />
            Calendar
          </Button>
          
          <Button
            variant={activeTab === 'queue' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('queue')}
          >
            <BarChart3 className="w-4 h-3 mr-1" />
            Publish Queue
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={addNewContent}
          >
            <Plus className="w-4 h-3 mr-1" />
            Add Content
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="flex-1 p-4">
            <Card className="mb-4">
              <h3 className="font-semibold text-slate-900 mb-3">Content Calendar</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {content.map(item => (
                  <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 mb-2">{item.title}</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs ml-2">
                            {item.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-600">
                          {item.publishDate ? `Scheduled: ${item.publishDate.toLocaleDateString()}` : 'No publish date'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedContent(item)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPreview(!showPreview)}
                        >
                          {showPreview ? <EyeOff className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </div>
                      
                      {item.expireDate && (
                        <div className="text-xs text-red-600">
                          Expires: {item.expireDate.toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => scheduleContent(item.id, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))}
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        Schedule
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => publishContent(item.id)}
                        disabled={item.status !== 'draft'}
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Publish Now
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteContent(item.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Publishing Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Scheduled:</span>
                    <span className="font-medium">{content.filter(item => item.status === 'scheduled').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Draft:</span>
                    <span className="font-medium">{content.filter(item => item.status === 'draft').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Published:</span>
                    <span className="font-medium">{content.filter(item => item.status === 'published').length}</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addNewContent}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Create New Content
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Bulk schedule */}}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Bulk Schedule
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <div className="flex-1 p-4">
            <Card className="mb-4">
              <h3 className="font-semibold text-slate-900 mb-3">Publish Queue</h3>
              
              <div className="space-y-2">
                {content
                  .filter(item => item.status === 'scheduled')
                  .sort((a, b) => new Date(a.publishDate || 0).getTime() - new Date(b.publishDate || 0).getTime())
                  .map(item => (
                    <div key={item.id} className="border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(item.priority || 'medium')}`} />
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900">{item.title}</h4>
                              <p className="text-sm text-slate-600">
                                {item.publishDate ? `Publishing on ${item.publishDate.toLocaleDateString()}` : 'No date set'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {item.status}
                          </Badge>
                          <span className={`text-xs ${getPriorityColor(item.priority || 'medium')}`}>
                            {item.priority}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedContent(item)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* Edit content */}}
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* Remove from queue */}}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            {/* Queue Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Queue Actions</h4>
                <div className="space-y-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {/* Publish all scheduled */}}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Publish All Scheduled
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Pause publishing */}}
                  >
                    <Pause className="w-3 h-3 mr-1" />
                    Pause Publishing
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Clear queue */}}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear Queue
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="flex-1 p-4">
            <Card className="mb-4">
              <h3 className="font-semibold text-slate-900 mb-3">Scheduler Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Default Publish Time</label>
                  <input
                    type="time"
                    defaultValue="09:00"
                    className="w-full p-2 border border-slate-200 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Auto-Publish Interval</label>
                  <select className="w-full p-2 border border-slate-200 rounded">
                    <option value="immediately">Immediately</option>
                    <option value="1hour">1 Hour</option>
                    <option value="6hours">6 Hours</option>
                    <option value="12hours">12 Hours</option>
                    <option value="24hours">24 Hours</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="mr-2"
                    />
                    Enable notifications
                  </label>
                  <p className="text-xs text-slate-500">Get notified when content is published</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
