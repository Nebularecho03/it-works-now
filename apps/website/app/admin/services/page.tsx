"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Brain,
  Users,
  BookOpen,
  GraduationCap,
  Building,
  Calendar,
  Info
} from "lucide-react";
import { api, ApiClient } from "@/components/api/client";

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  bullets: string;
  link?: string;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const iconOptions = ["Brain", "Users", "BookOpen", "GraduationCap", "Building", "Calendar"];

const iconMap: Record<string, any> = {
  Brain,
  Users,
  BookOpen,
  GraduationCap,
  Building,
  Calendar
};

const IconComponent = ({ iconName, className }: { iconName: string; className?: string }) => {
  const Icon = iconMap[iconName] || Brain;
  return <Icon className={className || "h-6 w-6"} />;
};

const colorOptions = ["emerald", "blue", "purple", "orange", "red", "pink"];

const getColorClasses = (color: string) => {
  const colors: Record<string, string> = {
    emerald: "text-emerald-600 bg-emerald-50",
    blue: "text-blue-600 bg-blue-50",
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50",
    red: "text-red-600 bg-red-50",
    pink: "text-pink-600 bg-pink-50"
  };
  return colors[color] || colors.emerald;
};

export default function ServicesAdminPage() {
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

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<Service | null>(null);
  const [previewData, setPreviewData] = useState<Service | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await api.get("/api/admin/services");
      if (!response.ok) {
        console.error(`Failed to load services: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error("Response body:", text);
        return;
      }
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error("Failed to load services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    try {
      if (selectedItem.id === 0) {
        await api.post("/api/admin/services", selectedItem);
      } else {
        await api.put("/api/admin/services", selectedItem);
      }
      setSelectedItem(null);
      setPreviewData(null);
      loadServices();
    } catch (error) {
      console.error("Failed to save service:", error);
    }
  };

  const handleCreateNew = () => {
    const newService = {
      id: 0,
      title: "",
      description: "",
      icon: "Brain",
      bullets: JSON.stringify(["Feature 1", "Feature 2", "Feature 3"]),
      link: "/services",
      display_order: services.length,
      published: true,
      created_at: "",
      updated_at: ""
    };
    setSelectedItem(newService);
    setPreviewData(newService);
  };

  const deleteService = async (id: number) => {
    try {
      await ApiClient.fetch("/api/admin/services", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      loadServices();
    } catch (error) {
      console.error("Failed to delete service:", error);
    }
  };

  const togglePublished = async (item: Service) => {
    try {
      await api.put("/api/admin/services", { ...item, published: !item.published });
      loadServices();
    } catch (error) {
      console.error("Failed to toggle published:", error);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newServices = [...services];
    [newServices[index - 1], newServices[index]] = [newServices[index], newServices[index - 1]];
    newServices.forEach((item, i) => item.display_order = i);
    setServices(newServices);
    newServices.forEach(item => api.put("/api/admin/services", item));
  };

  const moveDown = (index: number) => {
    if (index === services.length - 1) return;
    const newServices = [...services];
    [newServices[index], newServices[index + 1]] = [newServices[index + 1], newServices[index]];
    newServices.forEach((item, i) => item.display_order = i);
    setServices(newServices);
    newServices.forEach(item => api.put("/api/admin/services", item));
  };

  const filteredServices = services.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Services</h1>
          <p className="text-slate-600">Manage service offerings and descriptions</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Where this appears</h3>
            <p className="text-sm text-blue-700 mt-1">
              Services appear in the "Our Services" section on the homepage, displaying service cards with icons, descriptions, and bullet points for each offering.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="space-y-4">
        {filteredServices.map((item, index) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <IconComponent iconName={item.icon} className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                    <Badge variant={item.published ? "default" : "secondary"}>
                      {item.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  {item.description && <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => moveUp(index)} disabled={index === 0}>
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => moveDown(index)} disabled={index === filteredServices.length - 1}>
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => togglePublished(item)}>
                  {item.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setSelectedItem(item); setPreviewData(item); }}>
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { if (confirm('Are you sure?')) deleteService(item.id); }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedItem.id === 0 ? 'Add Service' : 'Edit Service'}
              </h2>
              <Button variant="outline" onClick={() => { setSelectedItem(null); setPreviewData(null); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                  <Input
                    value={selectedItem.title}
                    onChange={(e) => { setSelectedItem(prev => prev ? {...prev, title: e.target.value} : null); setPreviewData(prev => prev ? {...prev, title: e.target.value} : null); }}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <Textarea
                    value={selectedItem.description}
                    onChange={(e) => { setSelectedItem(prev => prev ? {...prev, description: e.target.value} : null); setPreviewData(prev => prev ? {...prev, description: e.target.value} : null); }}
                    rows={4}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
                  <select
                    value={selectedItem.icon}
                    onChange={(e) => { setSelectedItem(prev => prev ? {...prev, icon: e.target.value} : null); setPreviewData(prev => prev ? {...prev, icon: e.target.value} : null); }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {iconOptions.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Service Link (Optional)</label>
                  <Input
                    value={selectedItem.link || ''}
                    onChange={(e) => { setSelectedItem(prev => prev ? {...prev, link: e.target.value} : null); setPreviewData(prev => prev ? {...prev, link: e.target.value} : null); }}
                    className="w-full"
                    placeholder="/services or https://example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bullet Points (JSON array)</label>
                  <Textarea
                    value={selectedItem.bullets}
                    onChange={(e) => { setSelectedItem(prev => prev ? {...prev, bullets: e.target.value} : null); setPreviewData(prev => prev ? {...prev, bullets: e.target.value} : null); }}
                    rows={3}
                    className="w-full"
                    placeholder='["Feature 1", "Feature 2", "Feature 3"]'
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={selectedItem.published}
                    onChange={(e) => { setSelectedItem(prev => prev ? {...prev, published: e.target.checked} : null); setPreviewData(prev => prev ? {...prev, published: e.target.checked} : null); }}
                    className="rounded"
                  />
                  <label htmlFor="published" className="text-sm font-medium text-slate-700">
                    Published (visible on website)
                  </label>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    {selectedItem.id === 0 ? 'Create' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => { setSelectedItem(null); setPreviewData(null); }}>
                    Cancel
                  </Button>
                </div>
              </div>
              
              {previewData && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Live Preview</h3>
                  <Card className="relative h-full border border-slate-200 p-6 transition-all duration-300 hover:border-blue-300 hover:shadow-lg bg-gradient-to-br from-slate-50 to-white">
                    <div className="mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 transition-colors">
                        <IconComponent iconName={previewData.icon} className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900">
                      {previewData.title || "Service Title"}
                    </h3>

                    <p className="text-slate-600 mb-4 leading-relaxed">
                      {previewData.description || "Service description will appear here..."}
                    </p>

                    {previewData.bullets && (() => {
                      try {
                        const bullets = JSON.parse(previewData.bullets);
                        return (
                          <ul className="space-y-2">
                            {bullets.map((bullet: string, i: number) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        );
                      } catch {
                        return null;
                      }
                    })()}
                    
                    {/* Show link in preview */}
                    {previewData.link && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-sm font-medium text-blue-700">Link: </span>
                        <a href={previewData.link} target="_blank" className="text-sm text-blue-600 hover:underline ml-2">
                          {previewData.link}
                        </a>
                      </div>
                    )}
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
