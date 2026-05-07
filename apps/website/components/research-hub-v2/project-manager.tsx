"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Users,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Search,
  Filter,
  Grid,
  List
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  dueDate: string;
  completedDate?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "ON_HOLD";
  startDate: string;
  endDate?: string;
  progress: number;
  milestones: Milestone[];
  teamMembers: Array<{
    name: string;
    role: string;
    avatar: string;
  }>;
  budget?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectManagerProps {
  userRole: "ADMIN" | "RESEARCHER" | "USER";
  className?: string;
}

export default function ProjectManager({ userRole, className = "" }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = [
    "All Categories",
    "Cultural Psychology",
    "Clinical Psychology",
    "Educational Psychology",
    "Developmental Psychology"
  ];

  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "DRAFT", label: "Draft" },
    { value: "ACTIVE", label: "Active" },
    { value: "COMPLETED", label: "Completed" },
    { value: "ON_HOLD", label: "On Hold" }
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/research-hub-v2/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = projects;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    // Filter by status
    if (selectedStatus !== "All") {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }

    setFilteredProjects(filtered);
  }, [projects, searchQuery, selectedCategory, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "ACTIVE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "ON_HOLD":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 60) return "text-blue-600";
    if (progress >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const canEdit = () => {
    return userRole === "ADMIN" || userRole === "RESEARCHER";
  };

  const handleCreateProject = async (projectData: Partial<Project>) => {
    try {
      const response = await fetch('/api/research-hub-v2/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        await fetchProjects();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleUpdateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const response = await fetch(`/api/research-hub-v2/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        await fetchProjects();
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`/api/research-hub-v2/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchProjects();
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

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
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {canEdit() && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Projects ({filteredProjects.length})
            </h1>
            <p className="text-gray-600">
              {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"} found
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {selectedCategory}
            </Badge>
            <Badge variant="outline">
              {selectedStatus}
            </Badge>
          </div>
        </div>

        {/* Projects Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="w-16 h-16 text-blue-400" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">{project.category}</Badge>
                        <span className="text-xs text-gray-500">Created {new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {canEdit() && (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  
                  {/* Progress and Milestones */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className={`text-sm font-semibold ${getProgressColor(project.progress)}`}>
                        {project.progress}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Milestones</h4>
                      <div className="space-y-2">
                        {project.milestones.slice(0, 3).map((milestone, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              milestone.status === "COMPLETED" ? "bg-green-500" :
                              milestone.status === "IN_PROGRESS" ? "bg-blue-500" :
                              "bg-gray-400"
                            }`}>
                              {milestone.status === "COMPLETED" && <CheckCircle className="w-2 h-2 text-white" />}
                              {milestone.status === "IN_PROGRESS" && <Clock className="w-2 h-2 text-white" />}
                              {milestone.status === "PENDING" && <Target className="w-2 h-2 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{milestone.title}</p>
                              <p className="text-xs text-gray-500">
                                Due: {new Date(milestone.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Team</h4>
                      <div className="flex -space-x-2">
                        {project.teamMembers.slice(0, 4).map((member, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="text-xs">
                              <p className="font-medium text-gray-900">{member.name}</p>
                              <p className="text-gray-500">{member.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {project.startDate && <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>}
                      {project.endDate && <span>• End: {new Date(project.endDate).toLocaleDateString()}</span>}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4" />
                      </Button>
                      {canEdit() && (
                        <Button size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Project
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="w-8 h-8 text-blue-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">{project.category}</Badge>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                      {canEdit() && (
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                    
                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className={`text-sm font-semibold ${getProgressColor(project.progress)}`}>
                          {project.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    </div>
                    
                    {/* Milestones and Team */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Milestones</h4>
                        <div className="space-y-2">
                          {project.milestones.map((milestone, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                milestone.status === "COMPLETED" ? "bg-green-500" :
                                milestone.status === "IN_PROGRESS" ? "bg-blue-500" :
                                "bg-gray-400"
                              }`}>
                                {milestone.status === "COMPLETED" && <CheckCircle className="w-2 h-2 text-white" />}
                                {milestone.status === "IN_PROGRESS" && <Clock className="w-2 h-2 text-white" />}
                                {milestone.status === "PENDING" && <Target className="w-2 h-2 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{milestone.title}</p>
                                <p className="text-xs text-gray-500">
                                  Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Team</h4>
                        <div className="space-y-2">
                          {project.teamMembers.map((member, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="w-4 h-4 text-gray-600" />
                              </div>
                              <div className="text-xs">
                                <p className="font-medium text-gray-900">{member.name}</p>
                                <p className="text-gray-500">{member.role}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {project.startDate && <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>}
                        {project.endDate && <span>• End: {new Date(project.endDate).toLocaleDateString()}</span>}
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4" />
                        </Button>
                        {canEdit() && (
                          <Button size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Project
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
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
    </div>
  );
}
