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
  Calendar,
  Users,
  Target,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

// Mock project data
const mockProjects = [
  {
    id: "1",
    title: "Traditional Luhya Mourning Rituals",
    description: "Exploring indigenous knowledge systems in cultural psychology through traditional mourning practices.",
    methodology: "Mixed-methods approach combining ethnographic studies, participant observation, and quantitative analysis",
    funding: "National Research Fund",
    team: ["Dr. Stephen Asatsa", "Dr. Jane Smith", "Research Assistant Team"],
    timeline: "Jan 2024 - Dec 2024",
    status: "active",
    category: "Cultural Psychology",
    images: ["project1-image1.jpg", "project1-image2.jpg"],
    media: ["project1-report.pdf", "project1-presentation.pptx"],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20"
  },
  {
    id: "2",
    title: "Decolonizing Mental Health in African Contexts",
    description: "A comprehensive review of culturally appropriate mental health interventions across African communities.",
    methodology: "Systematic literature review and community-based participatory research",
    funding: "African Union Research Grant",
    team: ["Dr. Stephen Asatsa", "International Collaborators"],
    timeline: "Mar 2023 - Aug 2024",
    status: "completed",
    category: "Mental Health",
    images: ["project2-image1.jpg"],
    media: ["project2-report.pdf"],
    createdAt: "2023-03-10",
    updatedAt: "2024-08-15"
  },
  {
    id: "3",
    title: "Community-Based Mental Health Interventions",
    description: "Developing and testing community-driven mental health programs in rural Kenyan communities.",
    methodology: "Community-based participatory research with pre-post intervention design",
    funding: "Private Foundation Grant",
    team: ["Dr. Jane Smith", "Community Health Workers"],
    timeline: "Jun 2024 - May 2025",
    status: "ongoing",
    category: "Community Health",
    images: ["project3-image1.jpg", "project3-image2.jpg", "project3-image3.jpg"],
    media: ["project3-protocol.pdf"],
    createdAt: "2024-06-01",
    updatedAt: "2024-06-10"
  }
];

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  ongoing: "bg-yellow-100 text-yellow-800",
  planned: "bg-gray-100 text-gray-800"
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState(mockProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<typeof mockProjects[0] | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    methodology: "",
    funding: "",
    team: "",
    timeline: "",
    status: "planned",
    category: ""
  });

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateProject = () => {
    const newProject = {
      id: Date.now().toString(),
      ...formData,
      team: formData.team.split(",").map(member => member.trim()),
      images: [],
      media: [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setProjects([...projects, newProject]);
    setShowCreateForm(false);
    setFormData({
      title: "",
      description: "",
      methodology: "",
      funding: "",
      team: "",
      timeline: "",
      status: "planned",
      category: ""
    });
  };

  const handleEditProject = (project: typeof mockProjects[0]) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      methodology: project.methodology,
      funding: project.funding,
      team: project.team.join(", "),
      timeline: project.timeline,
      status: project.status,
      category: project.category
    });
  };

  const handleUpdateProject = () => {
    if (!editingProject) return;
    setProjects(projects.map(p => 
      p.id === editingProject.id 
        ? { ...p, ...formData, team: formData.team.split(",").map(member => member.trim()), updatedAt: new Date().toISOString().split('T')[0] }
        : p
    ));
    setEditingProject(null);
    setFormData({
      title: "",
      description: "",
      methodology: "",
      funding: "",
      team: "",
      timeline: "",
      status: "planned",
      category: ""
    });
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const ProjectForm = ({ isEditing = false }) => (
    <Card className="p-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">
          {isEditing ? "Edit Project" : "Create New Project"}
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter project title"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category *</label>
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

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the project objectives and scope"
              rows={3}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Methodology *</label>
            <Textarea
              value={formData.methodology}
              onChange={(e) => setFormData({...formData, methodology: e.target.value})}
              placeholder="Describe the research methodology and approach"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Funding Source</label>
            <Input
              value={formData.funding}
              onChange={(e) => setFormData({...formData, funding: e.target.value})}
              placeholder="e.g., National Research Fund"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Timeline</label>
            <Input
              value={formData.timeline}
              onChange={(e) => setFormData({...formData, timeline: e.target.value})}
              placeholder="e.g., Jan 2024 - Dec 2024"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Team Members</label>
            <Input
              value={formData.team}
              onChange={(e) => setFormData({...formData, team: e.target.value})}
              placeholder="Enter team members separated by commas"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={isEditing ? handleUpdateProject : handleCreateProject}>
            {isEditing ? "Update Project" : "Create Project"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowCreateForm(false);
              setEditingProject(null);
              setFormData({
                title: "",
                description: "",
                methodology: "",
                funding: "",
                team: "",
                timeline: "",
                status: "planned",
                category: ""
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
          <h1 className="text-3xl font-bold">Project Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage research projects</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </section>

      {/* Create/Edit Form */}
      {(showCreateForm || editingProject) && (
        <ProjectForm isEditing={!!editingProject} />
      )}

      {/* Filters */}
      <section className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {/* Projects List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Projects ({filteredProjects.length})</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Get started by creating your first project"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Project
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Target className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{project.title}</h3>
                          <Badge className={statusColors[project.status]}>
                            {project.status}
                          </Badge>
                          <Badge variant="outline">{project.category}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{project.description}</p>
                        
                        <div className="grid gap-4 md:grid-cols-2 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">Team:</span>
                              <span>{project.team.join(", ")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">Timeline:</span>
                              <span>{project.timeline}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">Funding:</span>
                              <span>{project.funding}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">Updated:</span>
                              <span>{project.updatedAt}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">Methodology</h4>
                        <p className="text-sm text-muted-foreground">{project.methodology}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Upload className="w-4 h-4" />
                          <span>{project.images.length} images</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          <span>{project.media.length} files</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditProject(project)}>
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteProject(project.id)}>
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
