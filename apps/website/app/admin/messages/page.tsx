"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail,
  Search,
  Filter,
  Reply,
  Archive,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  RefreshCw,
  Download,
  ChevronDown
} from "lucide-react";
import { api, ApiClient } from "@/components/api/client";

interface Message {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  phone?: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'contact' | 'consultation' | 'research' | 'general';
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  read_at?: string;
  replied_at?: string;
  replied_by?: string;
}

interface MessageStats {
  total: number;
  new: number;
  read: number;
  replied: number;
  archived: number;
  urgent: number;
  high: number;
  contact: number;
  consultation: number;
  research: number;
}

export default function MessagesPage() {
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (!session) {
      router.push('/admin-signup');
      return;
    }
    try {
      const parsed = JSON.parse(session);
      const sessionAge = Date.now() - parsed.timestamp;
      if (sessionAge > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('userSession');
        localStorage.removeItem('authToken');
        router.push('/admin-signup');
        return;
      }
    } catch {
      localStorage.removeItem('userSession');
      localStorage.removeItem('authToken');
      router.push('/admin-signup');
      return;
    }
  }, [router]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    loadMessages();
    loadStats();
  }, [currentPage, statusFilter, priorityFilter, categoryFilter, searchTerm]);

  const loadMessages = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
        ...(searchTerm && { search: searchTerm })
      });

      const response = await api.get(`/api/admin/messages?${params}`);
      if (!response.ok) {
        console.error(`Failed to load messages: ${response.status} ${response.statusText}`);
        return;
      }
      const data = await response.json();
      setMessages(data.messages || []);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get("/api/admin/messages/stats");
      if (!response.ok) return;
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleSelectMessage = (messageId: number, checked: boolean | string) => {
    const isChecked = typeof checked === 'boolean' ? checked : checked === 'true';
    setSelectedMessages(prev => 
      isChecked 
        ? [...prev, messageId]
        : prev.filter(id => id !== messageId)
    );
  };

  const handleSelectAll = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map(msg => msg.id));
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      await api.put(`/api/admin/messages/${messageId}`, { status: 'read' });
      loadMessages();
      loadStats();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAsUnread = async (messageId: number) => {
    try {
      await api.put(`/api/admin/messages/${messageId}`, { status: 'new' });
      loadMessages();
      loadStats();
    } catch (error) {
      console.error("Failed to mark as unread:", error);
    }
  };

  const handleArchive = async (messageId: number) => {
    try {
      await api.put(`/api/admin/messages/${messageId}`, { status: 'archived' });
      loadMessages();
      loadStats();
    } catch (error) {
      console.error("Failed to archive:", error);
    }
  };

  const handleDelete = async (messageIds: number[]) => {
    if (!confirm(`Are you sure you want to delete ${messageIds.length} message(s)?`)) return;
    
    try {
      await ApiClient.fetch("/api/admin/messages", {
        method: 'DELETE',
        body: JSON.stringify({ message_ids: messageIds })
      });
      setSelectedMessages([]);
      loadMessages();
      loadStats();
    } catch (error) {
      console.error("Failed to delete messages:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      read: 'bg-gray-100 text-gray-800 border-gray-200',
      replied: 'bg-green-100 text-green-800 border-green-200',
      archived: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[status as keyof typeof colors] || colors.new;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      normal: 'bg-gray-100 text-gray-800 border-gray-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      contact: Mail,
      consultation: User,
      research: MessageSquare,
      general: AlertCircle
    };
    return icons[category as keyof typeof icons] || Mail;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
          <p className="text-slate-600">Manage contact form submissions and communications</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => { loadMessages(); loadStats(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">New Messages</p>
                <p className="text-2xl font-bold text-blue-900">{stats.new}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Replied</p>
                <p className="text-2xl font-bold text-green-900">{stats.replied}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">Urgent</p>
                <p className="text-2xl font-bold text-red-900">{stats.urgent}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </Card>
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-purple-900">{stats.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="contact">Contact</option>
              <option value="consultation">Consultation</option>
              <option value="research">Research</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedMessages.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              {selectedMessages.length} message{selectedMessages.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => handleArchive(selectedMessages[0])}>
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDelete(selectedMessages)} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Messages List */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedMessages.length === messages.length && messages.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedMessages(messages.map(msg => msg.id));
                  } else {
                    setSelectedMessages([]);
                  }
                }}
              />
              <span className="text-sm font-medium text-slate-700">
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Message Items */}
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No messages found</h3>
              <p className="text-slate-600">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "New messages will appear here when visitors contact you"}
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const CategoryIcon = getCategoryIcon(message.category);
              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    message.status === 'new' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'
                  } ${selectedMessage?.id === message.id ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <Checkbox
                    checked={selectedMessages.includes(message.id)}
                    onCheckedChange={(checked) => handleSelectMessage(message.id, checked)}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <CategoryIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 truncate">
                              {message.name}
                            </h3>
                            <Badge className={getPriorityColor(message.priority)} variant="outline">
                              {message.priority}
                            </Badge>
                            <Badge className={getStatusColor(message.status)} variant="outline">
                              {message.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 truncate">{message.email}</p>
                          {message.subject && (
                            <p className="text-sm font-medium text-slate-700 truncate mt-1">
                              {message.subject}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {formatDate(message.created_at)}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                      {message.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Badge variant="outline" className="text-xs">
                          {message.category}
                        </Badge>
                        {message.phone && <span>• {message.phone}</span>}
                      </div>

                      <div className="flex items-center gap-1">
                        {message.status === 'new' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(message.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsUnread(message.id)}
                            className="h-8 w-8 p-0"
                          >
                            <EyeOff className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedMessage(message)}
                          className="h-8 w-8 p-0"
                        >
                          <Reply className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleArchive(message.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete([message.id])}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Message Details</h2>
              <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                ×
              </Button>
            </div>

            <div className="space-y-6">
              {/* Message Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">From</label>
                  <p className="font-semibold">{selectedMessage.name}</p>
                  <p className="text-sm text-slate-600">{selectedMessage.email}</p>
                  {selectedMessage.phone && (
                    <p className="text-sm text-slate-600">{selectedMessage.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Details</label>
                  <div className="space-y-1">
                    <Badge className={getPriorityColor(selectedMessage.priority)} variant="outline">
                      {selectedMessage.priority} priority
                    </Badge>
                    <Badge className={getStatusColor(selectedMessage.status)} variant="outline">
                      {selectedMessage.status}
                    </Badge>
                    <Badge variant="outline">
                      {selectedMessage.category}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Subject */}
              {selectedMessage.subject && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <p className="font-semibold text-slate-900">{selectedMessage.subject}</p>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="whitespace-pre-wrap text-slate-800">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Metadata */}
              <div className="text-sm text-slate-500 border-t border-slate-200 pt-4">
                <p>Received: {formatDate(selectedMessage.created_at)}</p>
                {selectedMessage.ip_address && <p>IP: {selectedMessage.ip_address}</p>}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                {selectedMessage.status === 'new' && (
                  <Button onClick={() => handleMarkAsRead(selectedMessage.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
                <Button variant="outline" onClick={() => handleArchive(selectedMessage.id)}>
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </Button>
                <Button variant="outline" onClick={() => handleDelete([selectedMessage.id])} className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
