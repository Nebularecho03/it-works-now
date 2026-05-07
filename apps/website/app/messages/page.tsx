"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Send,
  Inbox,
  Trash2,
  Archive,
  Search,
  Filter,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Reply,
  Eye,
  EyeOff,
  Star,
  Plus,
  RefreshCw
} from "lucide-react";
import { api } from "@/components/api/client";

interface Message {
  id: number;
  from: string;
  from_email: string;
  to: string;
  to_email: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'inquiry' | 'consultation' | 'research' | 'general';
  created_at: string;
  updated_at: string;
  read_at?: string;
  replied_at?: string;
  is_from_admin: boolean;
}

interface MessageStats {
  total: number;
  new: number;
  read: number;
  replied: number;
  archived: number;
  sent: number;
}

export default function UserMessagesPage() {
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) {
      router.push('/signin?callbackUrl=/messages');
      return;
    }
    try {
      const parsed = JSON.parse(userSession);
      const sessionAge = Date.now() - parsed.timestamp;
      if (sessionAge > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('userSession');
        localStorage.removeItem('authToken');
        router.push('/signin?callbackUrl=/messages');
        return;
      }
    } catch {
      localStorage.removeItem('userSession');
      localStorage.removeItem('authToken');
      router.push('/signin?callbackUrl=/messages');
        return;
    }
  }, [router]);

  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("inbox");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    subject: "",
    message: "",
    category: "general"
  });
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadUser();
    loadMessages();
    loadStats();
  }, [currentPage, statusFilter, priorityFilter, categoryFilter, searchTerm]);

  const loadUser = async () => {
    try {
      const userSession = localStorage.getItem('userSession');
      if (userSession) {
        const parsed = JSON.parse(userSession);
        setUser(parsed);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const loadMessages = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        status: statusFilter === 'inbox' ? 'new,read' : statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
        ...(searchTerm && { search: searchTerm })
      });

      const response = await api.get(`/api/user/messages?${params}`);
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
      const response = await api.get("/api/user/messages/stats");
      if (!response.ok) return;
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeData.message.trim()) return;

    setSendingMessage(true);
    try {
      const response = await api.post("/api/user/messages/send", {
        subject: composeData.subject.trim(),
        message: composeData.message.trim(),
        category: composeData.category
      });

      if (response.ok) {
        setComposeData({ subject: "", message: "", category: "general" });
        setShowCompose(false);
        loadMessages();
        loadStats();
      } else {
        const data = await response.json();
        alert(data.detail || "Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
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
      await api.put(`/api/user/messages/${messageId}`, { status: 'read' });
      loadMessages();
      loadStats();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleArchive = async (messageId: number) => {
    try {
      await api.put(`/api/user/messages/${messageId}`, { status: 'archived' });
      loadMessages();
      loadStats();
    } catch (error) {
      console.error("Failed to archive:", error);
    }
  };

  const handleDelete = async (messageIds: number[]) => {
    if (!confirm(`Are you sure you want to delete ${messageIds.length} message(s)?`)) return;
    
    try {
      await fetch('/api/user/messages', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
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
          <p className="text-slate-600">Communicate with administrators and track your conversations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowCompose(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Compose
          </Button>
          <Button variant="outline" onClick={() => { loadMessages(); loadStats(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
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
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Sent Messages</p>
                <p className="text-2xl font-bold text-purple-900">{stats.sent}</p>
              </div>
              <Send className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-orange-900">{stats.total}</p>
              </div>
              <Inbox className="w-8 h-8 text-orange-500" />
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
              <option value="inbox">Inbox</option>
              <option value="sent">Sent</option>
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
              <option value="inquiry">General Inquiry</option>
              <option value="consultation">Consultation</option>
              <option value="research">Research</option>
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
              <input
                type="checkbox"
                checked={selectedMessages.length === messages.length && messages.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMessages(messages.map(msg => msg.id));
                  } else {
                    setSelectedMessages([]);
                  }
                }}
                className="rounded"
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
                {searchTerm || statusFilter !== "inbox" || priorityFilter !== "all" || categoryFilter !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "Your inbox is empty. Compose a new message to get started!"}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  message.status === 'new' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'
                } ${selectedMessage?.id === message.id ? 'ring-2 ring-blue-500' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedMessages.includes(message.id)}
                  onChange={(e) => handleSelectMessage(message.id, e.target.checked)}
                  className="mt-1"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {message.is_from_admin ? 'Admin' : message.from}
                          </h3>
                          <Badge className={getPriorityColor(message.priority)} variant="outline">
                            {message.priority}
                          </Badge>
                          <Badge className={getStatusColor(message.status)} variant="outline">
                            {message.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 truncate">
                          {message.is_from_admin ? message.from_email : message.to_email}
                        </p>
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
                          onClick={() => setSelectedMessage(message)}
                          className="h-8 w-8 p-0"
                        >
                          <Reply className="w-4 h-4" />
                        </Button>
                      )}
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
            ))
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

      {/* Compose Message Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Compose Message</h2>
              <Button variant="outline" onClick={() => setShowCompose(false)}>
                ×
              </Button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                <Input
                  value={composeData.subject}
                  onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                  placeholder="Enter message subject"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={composeData.category}
                  onChange={(e) => setComposeData({...composeData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General Inquiry</option>
                  <option value="consultation">Consultation Request</option>
                  <option value="research">Research Collaboration</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <Textarea
                  value={composeData.message}
                  onChange={(e) => setComposeData({...composeData, message: e.target.value})}
                  placeholder="Type your message here..."
                  rows={6}
                  className="w-full"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={sendingMessage || !composeData.message.trim()}
                  className="flex-1"
                >
                  {sendingMessage ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCompose(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <p className="font-semibold">
                    {selectedMessage.is_from_admin ? 'Administrator' : selectedMessage.from}
                  </p>
                  <p className="text-sm text-slate-600">
                    {selectedMessage.is_from_admin ? selectedMessage.from_email : selectedMessage.to_email}
                  </p>
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
                {selectedMessage.read_at && <p>Read: {formatDate(selectedMessage.read_at)}</p>}
                {selectedMessage.replied_at && <p>Replied: {formatDate(selectedMessage.replied_at)}</p>}
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
