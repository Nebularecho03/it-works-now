"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  Eye, 
  Upload, 
  X, 
  Plus,
  Brain,
  Calendar,
  Users,
  DollarSign,
  Tag,
  FileText,
  ArrowLeft
} from "lucide-react";

interface ProjectFormData {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  image: string | null;
  tags: string[];
  funding: string;
  teamMembers: TeamMember[];
}

interface TeamMember {
  name: string;
  role: string;
  affiliation: string;
  image?: string;
}

const categories = [
  "Cultural Psychology",
  "Clinical Psychology",
  "Educational Psychology",
  "Developmental Psychology",
  "Social Psychology"
];

export default function CreateProjectPage() {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    slug: "",
    summary: "",
    content: "",
    category: "",
    status: "DRAFT",
    image: null,
    tags: [],
    funding: "",
    teamMembers: []
  });
  
  const [newTag, setNewTag] = useState("");
  const [newTeamMember, setNewTeamMember] = useState<TeamMember>({
    name: "",
    role: "",
    affiliation: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Generate slug from title
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Mock upload - replace with actual upload logic
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addTeamMember = () => {
    if (newTeamMember.name && newTeamMember.role && newTeamMember.affiliation) {
      setFormData(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, newTeamMember]
      }));
      setNewTeamMember({ name: "", role: "", affiliation: "" });
      setShowTeamForm(false);
    }
  };

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (saveAsDraft: boolean = true) => {
    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        status: saveAsDraft ? "DRAFT" : "PUBLISHED"
      };

      // Mock API call - replace with actual implementation
      const response = await fetch("/api/admin/research/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave)
      });

      if (response.ok) {
        router.push("/research-hub-v2/admin/manage/projects");
      }
    } catch (error) {
      console.error("Failed to save project:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Preview Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge className="bg-orange-100 text-orange-800">Preview Mode</Badge>
              <h1 className="text-xl font-semibold">Project Preview</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handlePreview}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Editor
              </Button>
              <Button onClick={() => handleSave(false)}>
                <Save className="w-4 h-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="overflow-hidden">
            {formData.image && (
              <div className="aspect-video bg-gradient-to-br from-emerald-100 to-teal-100">
                <img 
                  src={formData.image} 
                  alt={formData.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <Badge variant="outline">{formData.category}</Badge>
                <Badge className={formData.status === "PUBLISHED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                  {formData.status}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{formData.title}</h1>
              <p className="text-lg text-gray-600 mb-6">{formData.summary}</p>
              
              {formData.funding && (
                <div className="flex items-center space-x-2 mb-6">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">Funding:</span>
                  <span className="text-emerald-600">{formData.funding}</span>
                </div>
              )}
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}
              
              {formData.content && (
                <div className="prose max-w-none mb-8">
                  <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                </div>
              )}
              
              {formData.teamMembers.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Research Team</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {formData.teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{member.name}</h4>
                          <p className="text-sm text-emerald-600">{member.role}</p>
                          <p className="text-sm text-gray-600">{member.affiliation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/research-hub-v2/admin/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Link>
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Create Research Project</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" onClick={() => handleSave(true)} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={() => handleSave(false)} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-emerald-600" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Project Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter project title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="project-url-slug"
                  readOnly
                />
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <label className="text-sm font-medium text-gray-700">Summary *</label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Brief summary of the research project"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED" }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Project Image */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Project Image</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {formData.image ? (
                <div className="space-y-4">
                  <img 
                    src={formData.image} 
                    alt="Project preview"
                    className="mx-auto max-h-64 rounded-lg"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">Upload project image</p>
                    <p className="text-sm text-gray-600">PNG, JPG up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button asChild>
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Tags */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Tag className="w-5 h-5 mr-2 text-emerald-600" />
              Tags
            </h2>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                />
                <Button onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Funding */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-emerald-600" />
              Funding Information
            </h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Funding Source</label>
              <Input
                value={formData.funding}
                onChange={(e) => setFormData(prev => ({ ...prev, funding: e.target.value }))}
                placeholder="e.g., Templeton Foundation - $150,000"
              />
            </div>
          </Card>

          {/* Team Members */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2 text-emerald-600" />
              Research Team
            </h2>
            
            <div className="space-y-4">
              {formData.teamMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    <p className="text-sm text-emerald-600">{member.role}</p>
                    <p className="text-sm text-gray-600">{member.affiliation}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeTeamMember(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              {showTeamForm ? (
                <div className="p-4 border border-gray-200 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      value={newTeamMember.name}
                      onChange={(e) => setNewTeamMember(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Name"
                    />
                    <Input
                      value={newTeamMember.role}
                      onChange={(e) => setNewTeamMember(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="Role"
                    />
                    <Input
                      value={newTeamMember.affiliation}
                      onChange={(e) => setNewTeamMember(prev => ({ ...prev, affiliation: e.target.value }))}
                      placeholder="Affiliation"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={addTeamMember}>Add Member</Button>
                    <Button variant="outline" onClick={() => setShowTeamForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setShowTeamForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Team Member
                </Button>
              )}
            </div>
          </Card>

          {/* Content */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-emerald-600" />
              Project Content
            </h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Detailed Description</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter detailed project description..."
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
