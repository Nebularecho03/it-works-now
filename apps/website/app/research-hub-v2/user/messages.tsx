"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  Search, 
  Filter,
  Reply,
  Star,
  Archive,
  Trash2,
  Plus,
  Clock,
  User,
  FileText,
  Brain,
  Award
} from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  subject: string;
  content: string;
  type: "RESEARCH_INQUIRY" | "COLLABORATION_REQUEST" | "GENERAL_MESSAGE" | "ADMIN_REPLY";
  researchId?: string;
  researchTitle?: string;
  read: boolean;
  createdAt: string;
}

// Mock data - will be replaced with API calls
const messages: Message[] = [
  {
    id: "1",
    senderId: "admin-1",
    senderName: "Dr. Stephen Asatsa",
    receiverId: "user-1",
    receiverName: "John Doe",
    subject: "Re: Inquiry about Traditional Luhya Mourning Rituals",
    content: "Thank you for your interest in our research on traditional Luhya mourning rituals. I'd be happy to discuss the methodology and findings in more detail. Would you be available for a video call next week?",
    type: "ADMIN_REPLY",
    researchId: "project-1",
    researchTitle: "Traditional Luhya Mourning Rituals",
    read: false,
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    senderId: "user-2",
    senderName: "Jane Smith",
    receiverId: "user-1",
    receiverName: "John Doe",
    subject: "Collaboration Opportunity",
    content: "I saw your saved research on indigenous knowledge systems and I'm working on a similar project. Would you be interested in collaborating on a publication?",
    type: "COLLABORATION_REQUEST",
    read: true,
    createdAt: "2024-01-14T15:45:00Z"
  },
  {
    id: "3",
    senderId: "user-1",
    senderName: "John Doe",
    receiverId: "admin-1",
    receiverName: "Dr. Stephen Asatsa",
    subject: "Question about Cultural Psychology Research",
    content: "I'm very interested in your work on cultural psychology. Could you provide more information about your research methodology?",
    type: "RESEARCH_INQUIRY",
    researchId: "project-2",
    researchTitle: "Mental Health in African Contexts",
    read: true,
    createdAt: "2024-01-13T09:20:00Z"
  }
];

const messageTypes = [
  { value: "All", label: "All Messages" },
  { value: "RESEARCH_INQUIRY", label: "Research Inquiries" },
  { value: "COLLABORATION_REQUEST", label: "Collaboration Requests" },
  { value: "ADMIN_REPLY", label: "Admin Replies" },
  { value: "GENERAL_MESSAGE", label: "General Messages" }
];

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient: "",
    subject: "",
    content: "",
    researchId: ""
  });
  const [loading, setLoading] = useState(false);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.senderName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === "All" || message.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleReply = async () => {
    if (!selectedMessage || !replyContent.trim()) return;
    
    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      console.log("Sending reply:", {
        receiverId: selectedMessage.senderId,
        subject: `Re: ${selectedMessage.subject}`,
        content: replyContent,
        type: "GENERAL_MESSAGE",
        researchId: selectedMessage.researchId
      });
      
      setReplyContent("");
      setSelectedMessage(null);
    } catch (error) {
      console.error("Failed to send reply:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.recipient || !newMessage.subject || !newMessage.content.trim()) return;
    
    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      console.log("Sending message:", newMessage);
      
      setNewMessage({
        recipient: "",
        subject: "",
        content: "",
        researchId: ""
      });
      setShowCompose(false);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      // Mock API call - replace with actual implementation
      console.log("Marking as read:", messageId);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      // Mock API call - replace with actual implementation
      console.log("Deleting message:", messageId);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "RESEARCH_INQUIRY":
        return <Brain className="w-4 h-4 text-blue-600" />;
      case "COLLABORATION_REQUEST":
        return <User className="w-4 h-4 text-purple-600" />;
      case "ADMIN_REPLY":
        return <Star className="w-4 h-4 text-yellow-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeObj = messageTypes.find(t => t.value === type);
    return typeObj?.label || type;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
              <div className="hidden md:flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9 w-64"
                  />
                </div>
                
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {messageTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <Button onClick={() => setShowCompose(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Compose
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <div className="space-y-2">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedMessage?.id === message.id
                        ? "border-emerald-500 bg-emerald-50"
                        : message.read
                        ? "border-gray-200 bg-white hover:bg-gray-50"
                        : "border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                    }`}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.read) {
                        markAsRead(message.id);
                      }
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {getMessageIcon(message.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {message.senderName}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {message.content}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {getTypeLabel(message.type)}
                          </Badge>
                          {!message.read && (
                            <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Message Content */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card className="p-6">
                {/* Message Header */}
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getMessageIcon(selectedMessage.type)}
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {selectedMessage.senderName}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {formatTime(selectedMessage.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Archive className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteMessage(selectedMessage.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedMessage.subject}
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {getTypeLabel(selectedMessage.type)}
                    </Badge>
                    {selectedMessage.researchTitle && (
                      <Badge variant="outline">
                        <FileText className="w-3 h-3 mr-1" />
                        {selectedMessage.researchTitle}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Message Body */}
                <div className="prose max-w-none mb-8">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedMessage.content}
                  </p>
                </div>

                {/* Reply Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Reply className="w-5 h-5 mr-2 text-emerald-600" />
                    Reply
                  </h3>
                  
                  <div className="space-y-4">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Type your reply..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleReply}
                        disabled={!replyContent.trim() || loading}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {loading ? "Sending..." : "Send Reply"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a message
                </h3>
                <p className="text-gray-600">
                  Choose a message from the list to view its content and reply.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Compose Message</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowCompose(false)}
                >
                  ×
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Recipient</label>
                  <Input
                    value={newMessage.recipient}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, recipient: e.target.value }))}
                    placeholder="Enter recipient name or email"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <Input
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter subject"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Related Research (Optional)</label>
                  <select
                    value={newMessage.researchId}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, researchId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select research project</option>
                    <option value="project-1">Traditional Luhya Mourning Rituals</option>
                    <option value="project-2">Mental Health in African Contexts</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    value={newMessage.content}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Type your message..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCompose(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.recipient || !newMessage.subject || !newMessage.content.trim() || loading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
