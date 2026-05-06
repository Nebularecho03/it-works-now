"use client";

import { useState, useEffect } from "react";
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
  Award,
  Trophy,
  Medal,
  Star,
  Crown,
  Gem,
  Info
} from "lucide-react";
import { api, ApiClient } from "@/components/api/client";

interface Award {
  id: string;
  title: string;
  year: number;
  description: string;
  organization: string;
  url: string;
  imageUrl: string;
  icon: string;
  color: string;
  displayOrder: number;
  published: boolean;
}

const iconOptions = ["Award", "Trophy", "Medal", "Star", "Crown", "Gem"];
const colorOptions = ["emerald", "blue", "green", "purple", "orange", "red", "pink", "cyan", "yellow"];

const iconMap: Record<string, any> = {
  Award,
  Trophy,
  Medal,
  Star,
  Crown,
  Gem
};

const getColorClasses = (color: string) => {
  const colors: Record<string, any> = {
    emerald: {
      bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
      border: "border-emerald-200/50",
      iconBg: "bg-emerald-500",
      iconColor: "text-emerald-600",
      text: "text-emerald-900",
      subtext: "text-emerald-700",
      hover: "hover:shadow-emerald-500/25"
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-emerald-50",
      border: "border-green-200/50",
      iconBg: "bg-green-500",
      iconColor: "text-green-600",
      text: "text-green-900",
      subtext: "text-green-700",
      hover: "hover:shadow-green-500/25"
    },
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
      border: "border-blue-200/50",
      iconBg: "bg-blue-500",
      iconColor: "text-blue-600",
      text: "text-blue-900",
      subtext: "text-blue-700",
      hover: "hover:shadow-blue-500/25"
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-pink-50",
      border: "border-purple-200/50",
      iconBg: "bg-purple-500",
      iconColor: "text-purple-600",
      text: "text-purple-900",
      subtext: "text-purple-700",
      hover: "hover:shadow-purple-500/25"
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 to-red-50",
      border: "border-orange-200/50",
      iconBg: "bg-orange-500",
      iconColor: "text-orange-600",
      text: "text-orange-900",
      subtext: "text-orange-700",
      hover: "hover:shadow-orange-500/25"
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-pink-50",
      border: "border-red-200/50",
      iconBg: "bg-red-500",
      iconColor: "text-red-600",
      text: "text-red-900",
      subtext: "text-red-700",
      hover: "hover:shadow-red-500/25"
    },
    pink: {
      bg: "bg-gradient-to-br from-pink-50 to-rose-50",
      border: "border-pink-200/50",
      iconBg: "bg-pink-500",
      iconColor: "text-pink-600",
      text: "text-pink-900",
      subtext: "text-pink-700",
      hover: "hover:shadow-pink-500/25"
    },
    cyan: {
      bg: "bg-gradient-to-br from-cyan-50 to-sky-50",
      border: "border-cyan-200/50",
      iconBg: "bg-cyan-500",
      iconColor: "text-cyan-600",
      text: "text-cyan-900",
      subtext: "text-cyan-700",
      hover: "hover:shadow-cyan-500/25"
    },
    yellow: {
      bg: "bg-gradient-to-br from-yellow-50 to-amber-50",
      border: "border-yellow-200/50",
      iconBg: "bg-yellow-500",
      iconColor: "text-yellow-600",
      text: "text-yellow-900",
      subtext: "text-yellow-700",
      hover: "hover:shadow-yellow-500/25"
    }
  };
  return colors[color] || colors.emerald;
};

export default function AwardsAdminPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<Award | null>(null);

  useEffect(() => {
    loadAwards();
  }, []);

  const loadAwards = async () => {
    try {
      const response = await api.get("/api/admin/awards");
      const data = await response.json();
      setAwards(data.awards || []);
    } catch (error) {
      console.error("Failed to load awards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    try {
      if (selectedItem.id === 'new') {
        await api.post("/api/admin/awards", selectedItem);
      } else {
        await api.put("/api/admin/awards", selectedItem);
      }
      setSelectedItem(null);
      loadAwards();
    } catch (error) {
      console.error("Failed to save award:", error);
    }
  };

  const handleCreateNew = () => {
    setSelectedItem({
      id: 'new',
      title: '',
      year: new Date().getFullYear(),
      description: '',
      organization: '',
      url: '',
      imageUrl: '',
      icon: 'Award',
      color: 'emerald',
      displayOrder: awards.length,
      published: true
    });
  };

  const deleteAward = async (id: string) => {
    try {
      await ApiClient.fetch("/api/admin/awards", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      loadAwards();
    } catch (error) {
      console.error("Failed to delete award:", error);
    }
  };

  const togglePublished = async (item: Award) => {
    try {
      await api.put("/api/admin/awards", { ...item, published: !item.published });
      loadAwards();
    } catch (error) {
      console.error("Failed to toggle published:", error);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newAwards = [...awards];
    [newAwards[index - 1], newAwards[index]] = [newAwards[index], newAwards[index - 1]];
    newAwards.forEach((item, i) => item.displayOrder = i);
    setAwards(newAwards);
    newAwards.forEach(item => api.put("/api/admin/awards", item));
  };

  const moveDown = (index: number) => {
    if (index === awards.length - 1) return;
    const newAwards = [...awards];
    [newAwards[index], newAwards[index + 1]] = [newAwards[index + 1], newAwards[index]];
    newAwards.forEach((item, i) => item.displayOrder = i);
    setAwards(newAwards);
    newAwards.forEach(item => api.put("/api/admin/awards", item));
  };

  const filteredAwards = awards.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Awards & Honors</h1>
          <p className="text-slate-600">Manage awards, honors, and recognition</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Award
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Where this appears</h3>
            <p className="text-sm text-blue-700 mt-1">
              Awards appear on the about page, displaying honors and recognition with year, organization, and descriptions.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search awards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="space-y-4">
        {filteredAwards.map((item, index) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <Badge variant={item.published ? "default" : "secondary"}>
                    {item.published ? "Published" : "Draft"}
                  </Badge>
                  <Badge variant="outline">{item.year}</Badge>
                </div>
                {item.organization && <p className="text-sm text-slate-600 mb-1">{item.organization}</p>}
                {item.description && <p className="text-sm text-slate-500">{item.description}</p>}
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => moveUp(index)} disabled={index === 0}>
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => moveDown(index)} disabled={index === filteredAwards.length - 1}>
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => togglePublished(item)}>
                  {item.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { if (confirm('Are you sure?')) deleteAward(item.id); }}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedItem.id === 'new' ? 'Add Award' : 'Edit Award'}
              </h2>
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Award Title</label>
                  <Input
                    value={selectedItem.title}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, title: e.target.value} : null)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
                  <Input
                    type="number"
                    value={selectedItem.year}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, year: parseInt(e.target.value)} : null)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Organization</label>
                  <Input
                    value={selectedItem.organization}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, organization: e.target.value} : null)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <Textarea
                    value={selectedItem.description}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, description: e.target.value} : null)}
                    rows={3}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">URL (optional)</label>
                  <Input
                    value={selectedItem.url}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, url: e.target.value} : null)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Image URL (optional)</label>
                  <Input
                    value={selectedItem.imageUrl}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, imageUrl: e.target.value} : null)}
                    className="w-full"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
                    <select
                      value={selectedItem.icon}
                      onChange={(e) => setSelectedItem(prev => prev ? {...prev, icon: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {iconOptions.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Color Theme</label>
                    <select
                      value={selectedItem.color}
                      onChange={(e) => setSelectedItem(prev => prev ? {...prev, color: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {colorOptions.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={selectedItem.published}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, published: e.target.checked} : null)}
                    className="rounded"
                  />
                  <label htmlFor="published" className="text-sm font-medium text-slate-700">
                    Published (visible on website)
                  </label>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    {selectedItem.id === 'new' ? 'Create' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedItem(null)}>
                    Cancel
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Live Preview</h3>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  {(() => {
                    const colors = getColorClasses(selectedItem.color);
                    const Icon = iconMap[selectedItem.icon] || Award;
                    return (
                      <Card className={`border ${colors.border} ${colors.bg} p-6 transition-all duration-300`}>
                        <div className="flex items-start gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.iconBg} text-white shadow-lg`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-bold text-lg ${colors.text}`}>
                                {selectedItem.title || 'Award Title'}
                              </h3>
                              <Badge variant="outline" className="text-xs">{selectedItem.year}</Badge>
                            </div>
                            {selectedItem.organization && (
                              <p className={`text-sm ${colors.subtext} mt-1`}>{selectedItem.organization}</p>
                            )}
                            {selectedItem.description && (
                              <p className={`text-sm ${colors.subtext} mt-2`}>{selectedItem.description}</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })()}
                </div>
                <p className="text-xs text-slate-500">
                  This is how the award will appear on the about page.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
