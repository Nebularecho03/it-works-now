"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  FileText, 
  Users, 
  Calendar,
  Microscope,
  Trophy,
  X,
  ChevronDown
} from "lucide-react";
import Link from "next/link";


// Mock search results - would be replaced with actual API calls
const mockResults = [
  {
    id: "1",
    type: "project",
    title: "Traditional Luhya Mourning Rituals",
    summary: "Exploring indigenous knowledge systems in cultural psychology through traditional mourning practices.",
    category: "Cultural Psychology",
    year: "2024",
    author: "Dr. Stephen Asatsa",
    href: "/research-hub/projects"
  },
  {
    id: "2", 
    type: "publication",
    title: "Decolonizing Mental Health in African Contexts",
    summary: "A comprehensive review of culturally appropriate mental health interventions across African communities.",
    category: "Clinical Psychology",
    year: "2023",
    journal: "African Psychology Review",
    href: "/research-hub/publications"
  },
  {
    id: "3",
    type: "team",
    title: "Dr. Stephen Asatsa",
    summary: "Senior Lecturer & Head of Psychology Department, specializing in indigenous psychology and cultural evolution.",
    role: "Principal Investigator",
    institution: "Catholic University of Eastern Africa",
    href: "/research-hub/team"
  },
  {
    id: "4",
    type: "award",
    title: "Excellence in Cultural Psychology Research",
    summary: "Recognition for outstanding contributions to indigenous knowledge systems research.",
    organization: "African Psychological Association",
    year: "2024",
    href: "/research-hub/awards"
  },
  {
    id: "5",
    type: "event",
    title: "Colloquium on African Psychology",
    summary: "Upcoming presentation on traditional healing practices and therapeutic implications.",
    date: "October 3, 2025",
    location: "Online",
    href: "/research-hub/events"
  }
];

const searchFilters = {
  type: ["All", "Projects", "Publications", "Team", "Awards", "Events"],
  category: ["All", "Cultural Psychology", "Clinical Psychology", "Thanatology", "Cross-Cultural"],
  year: ["All", "2024", "2023", "2022", "2021"]
};

const typeIcons = {
  project: Microscope,
  publication: FileText,
  team: Users,
  award: Trophy,
  event: Calendar
};

const typeColors = {
  project: "text-emerald-600 bg-emerald-50 border-emerald-200",
  publication: "text-blue-600 bg-blue-50 border-blue-200", 
  team: "text-purple-600 bg-purple-50 border-purple-200",
  award: "text-amber-600 bg-amber-50 border-amber-200",
  event: "text-teal-600 bg-teal-50 border-teal-200"
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(mockResults);
  const [filters, setFilters] = useState({
    type: "All",
    category: "All", 
    year: "All"
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    // In real implementation, this would call the search API
    const filtered = mockResults.filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setResults(filtered);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    // In real implementation, this would apply filters to search results
  };

  const clearFilters = () => {
    setFilters({ type: "All", category: "All", year: "All" });
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== "All").length;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Search className="w-8 h-8 text-[#0F766E]" />
          <h1 className="text-4xl font-bold">Research Search</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Search across projects, publications, team members, and research activities
        </p>
      </section>

      {/* Search Interface */}
      <section className="max-w-4xl mx-auto space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search research content..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-12 pr-4 py-3 text-lg border-2 focus:border-[#0F766E]"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Type Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Content Type</label>
                <div className="space-y-2">
                  {searchFilters.type.map((type) => (
                    <label key={type} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={filters.type === type}
                        onChange={() => handleFilterChange("type", type)}
                        className="text-[#0F766E]"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Research Category</label>
                <div className="space-y-2">
                  {searchFilters.category.map((category) => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === category}
                        onChange={() => handleFilterChange("category", category)}
                        className="text-[#0F766E]"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Year Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Year</label>
                <div className="space-y-2">
                  {searchFilters.year.map((year) => (
                    <label key={year} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="year"
                        checked={filters.year === year}
                        onChange={() => handleFilterChange("year", year)}
                        className="text-[#0F766E]"
                      />
                      <span className="text-sm">{year}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </section>

      {/* Search Results */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Search Results
            {query && (
              <span className="text-lg font-normal text-muted-foreground ml-2">
                for "{query}"
              </span>
            )}
          </h2>
          <Badge variant="secondary">{results.length} results</Badge>
        </div>

        {results.length === 0 ? (
          <Card className="p-12 text-center">
            <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Try searching for:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["indigenous psychology", "mental health", "cultural evolution", "mourning rituals"].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearch(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {results.map((result) => {
              const Icon = typeIcons[result.type as keyof typeof typeIcons];
              const colorClass = typeColors[result.type as keyof typeof typeColors];
              
              return (
                <Card key={result.id} className="p-6 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg border flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{result.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                            <Badge variant="outline" className="capitalize">
                              {result.type}
                            </Badge>
                            {result.category && <span>{result.category}</span>}
                            {result.year && <span>{result.year}</span>}
                            {result.journal && <span>{result.journal}</span>}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={result.href}>
                            View
                          </Link>
                        </Button>
                      </div>
                      <p className="text-muted-foreground">{result.summary}</p>
                      
                      {/* Additional metadata based on type */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {result.author && (
                          <span>Author: {result.author}</span>
                        )}
                        {result.role && (
                          <span>Role: {result.role}</span>
                        )}
                        {result.institution && (
                          <span>Institution: {result.institution}</span>
                        )}
                        {result.organization && (
                          <span>Organization: {result.organization}</span>
                        )}
                        {result.date && (
                          <span>Date: {result.date}</span>
                        )}
                        {result.location && (
                          <span>Location: {result.location}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Search Tips */}
      <section className="bg-muted/50 rounded-2xl p-8">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold">Search Tips</h3>
          <div className="grid gap-4 md:grid-cols-2 text-left max-w-3xl mx-auto">
            <div className="space-y-2">
              <h4 className="font-semibold">Keywords</h4>
              <p className="text-sm text-muted-foreground">
                Try specific terms like "indigenous psychology", "mourning rituals", or "cultural evolution"
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Filters</h4>
              <p className="text-sm text-muted-foreground">
                Use filters to narrow down by content type, research category, or publication year
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Browse</h4>
              <p className="text-sm text-muted-foreground">
                If you're not sure what to search for, browse our projects and publications
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Contact</h4>
              <p className="text-sm text-muted-foreground">
                Can't find what you're looking for? Contact us for research assistance
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
