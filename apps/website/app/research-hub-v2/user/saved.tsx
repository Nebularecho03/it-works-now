"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Bookmark, 
  Download, 
  Eye, 
  Search, 
  Filter,
  Grid,
  List,
  Calendar,
  Tag,
  FileText,
  Brain,
  X
} from "lucide-react";

interface SavedItem {
  id: string;
  type: "project" | "publication" | "award";
  title: string;
  description: string;
  category: string;
  savedAt: string;
  href: string;
  image?: string;
  tags?: string[];
  author?: string;
}

// Mock data - will be replaced with API calls
const savedItems: SavedItem[] = [
  {
    id: "1",
    type: "project",
    title: "Traditional Luhya Mourning Rituals",
    description: "Exploring indigenous knowledge systems in cultural psychology through the lens of traditional mourning practices among Luhya people.",
    category: "Cultural Psychology",
    savedAt: "2024-01-15",
    href: "/research-hub-v2/research/traditional-luhya-mourning-rituals",
    tags: ["indigenous knowledge", "cultural psychology", "mourning rituals"],
    author: "Dr. Stephen Asatsa"
  },
  {
    id: "2",
    type: "publication",
    title: "Mental Health in African Contexts",
    description: "Decolonizing mental health practices through community-based approaches and indigenous healing methods.",
    category: "Clinical Psychology",
    savedAt: "2024-01-12",
    href: "/research-hub-v2/research/mental-health-african-contexts",
    tags: ["mental health", "decolonization", "community-based"],
    author: "Dr. Stephen Asatsa"
  },
  {
    id: "3",
    type: "award",
    title: "Excellence in Cultural Research Award",
    description: "Recognition for outstanding contributions to cultural psychology research.",
    category: "Research Recognition",
    savedAt: "2024-01-10",
    href: "/research-hub-v2/research/excellence-cultural-research-award",
    author: "International Psychology Association"
  }
];

const categories = [
  "All Categories",
  "Cultural Psychology",
  "Clinical Psychology",
  "Educational Psychology",
  "Research Recognition"
];

const sortOptions = [
  "Recently Saved",
  "Alphabetical",
  "Category",
  "Type"
];

export default function SavedPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("Recently Saved");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredItems = savedItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleRemoveItem = async (itemId: string) => {
    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      console.log("Removing saved item:", itemId);
      // await fetch(`/api/research-hub-v2/user/saved/${itemId}`, {
      //   method: "DELETE"
      // });
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkRemove = async () => {
    if (selectedItems.length === 0) return;
    
    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      console.log("Removing items:", selectedItems);
      // await Promise.all(
      //   selectedItems.map(id => 
      //     fetch(`/api/research-hub-v2/user/saved/${id}`, {
      //       method: "DELETE"
      //     })
      //   )
      // );
      setSelectedItems([]);
    } catch (error) {
      console.error("Failed to remove items:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAll = () => {
    setSelectedItems(filteredItems.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "project":
        return <Brain className="w-5 h-5 text-emerald-600" />;
      case "publication":
        return <FileText className="w-5 h-5 text-blue-600" />;
      case "award":
        return <div className="w-5 h-5 bg-yellow-100 rounded flex items-center justify-center">
          <span className="text-yellow-600 text-xs">🏆</span>
        </div>;
      default:
        return <Bookmark className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search saved research..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {selectedItems.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedItems.length} selected
                  </span>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Clear
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleBulkRemove}>
                    Remove Selected
                  </Button>
                </div>
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
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {sortOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Saved Research
            </h1>
            <p className="text-gray-600">
              {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} saved
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedItems.length !== filteredItems.length && (
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
            )}
            <Badge variant="outline">
              {selectedCategory}
            </Badge>
            <Badge variant="outline">
              {sortBy}
            </Badge>
          </div>
        </div>

        {/* Saved Items */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-video bg-gradient-to-br from-emerald-100 to-teal-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {getItemIcon(item.type)}
                  </div>
                  <div className="absolute top-3 left-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline">{item.type}</Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{item.category}</Badge>
                    <span className="text-xs text-gray-500">{item.savedAt}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {item.description}
                  </p>
                  
                  {item.author && (
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <span>By {item.author}</span>
                    </div>
                  )}
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getItemIcon(item.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <Badge variant="outline">{item.type}</Badge>
                        <Badge variant="secondary">{item.category}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{item.savedAt}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3">
                      {item.description}
                    </p>
                    
                    {item.author && (
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <span>By {item.author}</span>
                      </div>
                    )}
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved items found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All Categories");
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
