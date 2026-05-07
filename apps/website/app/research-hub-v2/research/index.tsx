"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Bookmark, 
  Eye, 
  Download,
  Calendar,
  User,
  Tag,
  Grid,
  List,
  SlidersHorizontal
} from "lucide-react";

// Mock data - will be replaced with API calls
const researchItems = [
  {
    id: "1",
    title: "Traditional Luhya Mourning Rituals",
    summary: "Exploring indigenous knowledge systems in cultural psychology through the lens of traditional mourning practices among the Luhya people of Kenya.",
    category: "Cultural Psychology",
    type: "project",
    author: "Dr. Stephen Asatsa",
    publishedAt: "2024-01-15",
    image: "/images/research/project1.jpg",
    tags: ["indigenous knowledge", "cultural psychology", "mourning rituals"],
    status: "published",
    featured: true
  },
  {
    id: "2",
    title: "Mental Health in African Contexts",
    summary: "Decolonizing mental health practices through community-based approaches and indigenous healing methods.",
    category: "Clinical Psychology",
    type: "publication",
    author: "Dr. Stephen Asatsa",
    publishedAt: "2024-01-10",
    image: "/images/research/project2.jpg",
    tags: ["mental health", "decolonization", "community-based"],
    status: "published",
    featured: false
  },
  {
    id: "3",
    title: "Indigenous Knowledge Systems in Education",
    summary: "Integrating traditional knowledge systems into modern educational frameworks for culturally responsive learning.",
    category: "Educational Psychology",
    type: "project",
    author: "Dr. Jane Doe",
    publishedAt: "2024-01-08",
    image: "/images/research/project3.jpg",
    tags: ["education", "indigenous knowledge", "cultural responsiveness"],
    status: "published",
    featured: false
  }
];

const categories = [
  "All Categories",
  "Cultural Psychology",
  "Clinical Psychology", 
  "Educational Psychology",
  "Developmental Psychology",
  "Social Psychology"
];

const sortOptions = [
  "Most Recent",
  "Most Relevant",
  "Most Cited",
  "Alphabetical"
];

export default function ResearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("Most Recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [researchData, setResearchData] = useState(researchItems);
  const [loading, setLoading] = useState(false);

  const filteredResearch = researchData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSave = async (itemId: string) => {
    // Mock save functionality - replace with actual API call
    console.log("Saving item:", itemId);
  };

  const handleDownload = async (itemId: string) => {
    // Mock download functionality - replace with actual API call
    console.log("Downloading item:", itemId);
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
                  placeholder="Search research projects, publications, authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
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
          
          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden py-4 border-t border-gray-200">
              <div className="space-y-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {sortOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Research Library
            </h1>
            <p className="text-gray-600">
              {filteredResearch.length} {filteredResearch.length === 1 ? "result" : "results"} found
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="hidden sm:inline-flex">
              {selectedCategory}
            </Badge>
            <Badge variant="outline" className="hidden sm:inline-flex">
              {sortBy}
            </Badge>
          </div>
        </div>

        {/* Research Items */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResearch.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-video bg-gradient-to-br from-emerald-100 to-teal-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">{item.type === "project" ? "🧪" : "📄"}</span>
                    </div>
                  </div>
                  {item.featured && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-emerald-600 text-white">Featured</Badge>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <span className="text-xs text-gray-500">{item.publishedAt}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {item.summary}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <User className="w-3 h-3 mr-1" />
                    {item.author}
                  </div>
                  
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
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleSave(item.id)}>
                        <Bookmark className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(item.id)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResearch.map((item) => (
              <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{item.type === "project" ? "🧪" : "📄"}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{item.category}</Badge>
                        {item.featured && (
                          <Badge className="bg-emerald-600 text-white">Featured</Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{item.publishedAt}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3">
                      {item.summary}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <User className="w-3 h-3 mr-1" />
                      {item.author}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleSave(item.id)}>
                          <Bookmark className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(item.id)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredResearch.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No research found</h3>
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
