"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ResearchHubLayout } from "@/components/admin/research-hub/layout/research-hub-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SaveButton, CancelButton, DraftButton } from "@/components/admin/research-hub/ui/action-buttons";
import { 
  TextField, 
  TextareaField, 
  SelectField, 
  MultiSelectField, 
  DateField, 
  NumberField, 
  UrlField 
} from "@/components/admin/research-hub/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Upload,
  Plus,
  X,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateProjectData } from "@/lib/admin/research-hub/types";
import { createProjectSchema } from "@/lib/admin/research-hub/validations";

// Mock data - replace with actual API calls
const teamMembers = [
  { value: "stephen-asatsa", label: "Dr. Stephen Asatsa" },
  { value: "sheina-lew-levy", label: "Sheina Lew-Levy, PhD" },
  { value: "amber-thalmayer", label: "Prof. Amber Gayle Thalmayer" },
  { value: "elizabeth-shino", label: "Dr. Elizabeth Shino" },
  { value: "luzelle-naude", label: "Prof. Luzelle Naudé" }
];

const categories = [
  { value: "Cultural Psychology", label: "Cultural Psychology" },
  { value: "Cross-Cultural Psychology", label: "Cross-Cultural Psychology" },
  { value: "Developmental Psychology", label: "Developmental Psychology" },
  { value: "Mental Health", label: "Mental Health" },
  { value: "Thanatology", label: "Thanatology" },
  { value: "Social Psychology", label: "Social Psychology" },
  { value: "Clinical Psychology", label: "Clinical Psychology" }
];

const countries = [
  { value: "Kenya", label: "Kenya" },
  { value: "Uganda", label: "Uganda" },
  { value: "Tanzania", label: "Tanzania" },
  { value: "South Africa", label: "South Africa" },
  { value: "Namibia", label: "Namibia" },
  { value: "Ethiopia", label: "Ethiopia" },
  { value: "Switzerland", label: "Switzerland" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "USA", label: "USA" },
  { value: "Germany", label: "Germany" }
];

const fundingBodies = [
  { value: "Templeton Foundation", label: "Templeton Foundation" },
  { value: "Swiss National Science Foundation", label: "Swiss National Science Foundation" },
  { value: "Society for Research in Child Development", label: "Society for Research in Child Development" },
  { value: "Cultural Evolution Society", label: "Cultural Evolution Society" },
  { value: "John Templeton Foundation", label: "John Templeton Foundation" },
  { value: "ICUDDR", label: "ICUDDR" }
];

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateProjectData>({
    title: "",
    shortDescription: "",
    fullDescription: "",
    category: [],
    countries: [],
    startDate: "",
    endDate: "",
    sampleSize: undefined,
    fundingBody: "",
    fundingAmount: "",
    fundingCurrency: "USD",
    leadResearcher: "",
    collaborators: [],
    methodology: "",
    keyFindings: [],
    outputs: [],
    relatedPublications: [],
    externalLinks: [],
    featuredImage: "",
    gallery: [],
    status: "draft",
    featured: false,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [],
    displayOrder: 0
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title]);

  // Auto-generate SEO title from project title
  useEffect(() => {
    if (formData.title && !formData.seoTitle) {
      setFormData(prev => ({ 
        ...prev, 
        seoTitle: `${formData.title} - HDLK-L Research` 
      }));
    }
  }, [formData.title]);

  const handleInputChange = (field: keyof CreateProjectData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddKeyFinding = () => {
    setFormData(prev => ({
      ...prev,
      keyFindings: [...prev.keyFindings, ""]
    }));
  };

  const handleUpdateKeyFinding = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      keyFindings: prev.keyFindings.map((finding, i) => i === index ? value : finding)
    }));
  };

  const handleRemoveKeyFinding = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyFindings: prev.keyFindings.filter((_, i) => i !== index)
    }));
  };

  const handleAddOutput = () => {
    setFormData(prev => ({
      ...prev,
      outputs: [...prev.outputs, ""]
    }));
  };

  const handleUpdateOutput = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      outputs: prev.outputs.map((output, i) => i === index ? value : output)
    }));
  };

  const handleRemoveOutput = (index: number) => {
    setFormData(prev => ({
      ...prev,
      outputs: prev.outputs.filter((_, i) => i !== index)
    }));
  };

  const handleAddExternalLink = () => {
    setFormData(prev => ({
      ...prev,
      externalLinks: [...prev.externalLinks, { title: "", url: "" }]
    }));
  };

  const handleUpdateExternalLink = (index: number, field: "title" | "url", value: string) => {
    setFormData(prev => ({
      ...prev,
      externalLinks: prev.externalLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const handleRemoveExternalLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      externalLinks: prev.externalLinks.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    try {
      createProjectSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        const newErrors: Record<string, string> = {};
        // @ts-ignore
        error.issues.forEach((issue: any) => {
          newErrors[issue.path[0]] = issue.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSave = async (status: 'draft' | 'published' = 'draft') => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call to save project
      const projectData = {
        ...formData,
        status,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      };

      console.log('Saving project:', projectData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message and redirect
      alert(`Project ${status === 'published' ? 'published' : 'saved as draft'} successfully!`);
      router.push('/admin/research-hub/projects');
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // Save draft first, then open preview
    if (!validateForm()) {
      return;
    }
    
    // TODO: Save draft and get preview URL
    console.log('Previewing project:', formData);
    alert('Preview functionality coming soon!');
  };

  return (
    <ResearchHubLayout title="New Project">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
              <p className="text-gray-600">Add a new research project to the HDLK-L portfolio</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <DraftButton onClick={() => handleSave('draft')} disabled={loading} />
            <SaveButton onClick={() => handleSave('published')} disabled={loading} />
          </div>
        </div>

        {/* Form */}
        <Card className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <TextField
                label="Project Title"
                name="title"
                value={formData.title}
                onChange={(value) => handleInputChange('title', value)}
                placeholder="Enter project title"
                required
                error={errors.title}
                description="This will be the main title displayed on the website"
              />

              <TextField
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={(value) => handleInputChange('slug', value)}
                placeholder="project-slug"
                error={errors.slug}
                description="URL-friendly version of the title (auto-generated)"
              />
            </div>

            <TextareaField
              label="Short Description"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={(value) => handleInputChange('shortDescription', value)}
              placeholder="Brief description of the project (max 500 characters)"
              required
              error={errors.shortDescription}
              rows={3}
              description="This appears in project listings and search results"
            />

            <TextareaField
              label="Full Description"
              name="fullDescription"
              value={formData.fullDescription}
              onChange={(value) => handleInputChange('fullDescription', value)}
              placeholder="Detailed description of the project"
              required
              error={errors.fullDescription}
              rows={6}
              description="Complete project description for the main project page"
            />
          </div>

          <Separator />

          {/* Classification */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Classification</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <MultiSelectField
                label="Categories"
                name="category"
                value={formData.category}
                onChange={(value) => handleInputChange('category', value)}
                placeholder="Select categories"
                required
                error={errors.category}
                options={categories}
                description="Select all relevant categories for this project"
              />

              <MultiSelectField
                label="Countries"
                name="countries"
                value={formData.countries}
                onChange={(value) => handleInputChange('countries', value)}
                placeholder="Select countries"
                required
                error={errors.countries}
                options={countries}
                description="Countries where this research takes place"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <DateField
                label="Start Date"
                name="startDate"
                value={formData.startDate}
                onChange={(value) => handleInputChange('startDate', value)}
                required
                error={errors.startDate}
              />

              <DateField
                label="End Date (Optional)"
                name="endDate"
                value={formData.endDate}
                onChange={(value) => handleInputChange('endDate', value)}
                error={errors.endDate}
              />

              <NumberField
                label="Sample Size (Optional)"
                name="sampleSize"
                value={formData.sampleSize}
                onChange={(value) => handleInputChange('sampleSize', value)}
                placeholder="Number of participants"
                min={0}
                error={errors.sampleSize}
              />
            </div>
          </div>

          <Separator />

          {/* Funding */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Funding Information</h2>
            
            <div className="grid gap-6 md:grid-cols-3">
              <SelectField
                label="Funding Body"
                name="fundingBody"
                value={formData.fundingBody}
                onChange={(value) => handleInputChange('fundingBody', value)}
                placeholder="Select funding body"
                required
                error={errors.fundingBody}
                options={fundingBodies}
              />

              <TextField
                label="Funding Amount"
                name="fundingAmount"
                value={formData.fundingAmount}
                onChange={(value) => handleInputChange('fundingAmount', value)}
                placeholder="100000"
                error={errors.fundingAmount}
              />

              <SelectField
                label="Currency"
                name="fundingCurrency"
                value={formData.fundingCurrency}
                onChange={(value) => handleInputChange('fundingCurrency', value)}
                options={[
                  { value: "USD", label: "USD" },
                  { value: "EUR", label: "EUR" },
                  { value: "GBP", label: "GBP" },
                  { value: "CHF", label: "CHF" },
                  { value: "KES", label: "KES" }
                ]}
              />
            </div>
          </div>

          <Separator />

          {/* Team */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Research Team</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <SelectField
                label="Lead Researcher"
                name="leadResearcher"
                value={formData.leadResearcher}
                onChange={(value) => handleInputChange('leadResearcher', value)}
                placeholder="Select lead researcher"
                required
                error={errors.leadResearcher}
                options={teamMembers}
              />

              <MultiSelectField
                label="Collaborators"
                name="collaborators"
                value={formData.collaborators}
                onChange={(value) => handleInputChange('collaborators', value)}
                placeholder="Select collaborators"
                options={teamMembers}
                description="Other researchers involved in the project"
              />
            </div>

            <TextareaField
              label="Methodology"
              name="methodology"
              value={formData.methodology}
              onChange={(value) => handleInputChange('methodology', value)}
              placeholder="Describe the research methodology"
              required
              error={errors.methodology}
              rows={4}
              description="Research methods, data collection, analysis approaches"
            />
          </div>

          <Separator />

          {/* Results */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Research Results</h2>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">Key Findings</label>
                <Button variant="outline" size="sm" onClick={handleAddKeyFinding}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Finding
                </Button>
              </div>
              <div className="space-y-3">
                {formData.keyFindings.map((finding, index) => (
                  <div key={index} className="flex gap-3">
                    <TextField
                      label={`Key Finding ${index + 1}`}
                      name={`keyFinding-${index}`}
                      value={finding}
                      onChange={(value) => handleUpdateKeyFinding(index, value)}
                      placeholder="Enter key finding"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveKeyFinding(index)}
                      className="px-3"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">Outputs</label>
                <Button variant="outline" size="sm" onClick={handleAddOutput}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Output
                </Button>
              </div>
              <div className="space-y-3">
                {formData.outputs.map((output, index) => (
                  <div key={index} className="flex gap-3">
                    <TextField
                      label={`Output ${index + 1}`}
                      name={`output-${index}`}
                      value={output}
                      onChange={(value) => handleUpdateOutput(index, value)}
                      placeholder="Enter output (e.g., Academic paper, Workshop, Database)"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveOutput(index)}
                      className="px-3"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* External Links */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">External Links</h2>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">Related Links</label>
                <Button variant="outline" size="sm" onClick={handleAddExternalLink}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
              </div>
              <div className="space-y-4">
                {formData.externalLinks.map((link, index) => (
                  <div key={index} className="grid gap-4 md:grid-cols-3">
                    <TextField
                      label="Link Title"
                      name={`link-title-${index}`}
                      value={link.title}
                      onChange={(value) => handleUpdateExternalLink(index, 'title', value)}
                      placeholder="Enter link title"
                    />
                    <TextField
                      label="Link URL"
                      name={`link-url-${index}`}
                      value={link.url}
                      onChange={(value) => handleUpdateExternalLink(index, 'url', value)}
                      placeholder="Enter link URL (e.g., https://example.com)"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveExternalLink(index)}
                      className="px-3"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* SEO & Publishing */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">SEO & Publishing</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <TextField
                label="SEO Title"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={(value) => handleInputChange('seoTitle', value)}
                placeholder="SEO title (max 60 characters)"
                error={errors.seoTitle}
                description="Title for search engines (auto-generated from project title)"
              />

              <TextField
                label="SEO Description"
                name="seoDescription"
                value={formData.seoDescription}
                onChange={(value) => handleInputChange('seoDescription', value)}
                placeholder="SEO description (max 160 characters)"
                error={errors.seoDescription}
                description="Description for search engines"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <NumberField
                label="Display Order"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={(value) => handleInputChange('displayOrder', value)}
                min={0}
                error={errors.displayOrder}
                description="Order in project listings (0 = highest)"
              />

              <SelectField
                label="Status"
                name="status"
                value={formData.status}
                onChange={(value) => handleInputChange('status', value as 'draft' | 'published')}
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "published", label: "Published" }
                ]}
                description="Publishing status"
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Featured Project</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-600">
                    Show in featured projects section
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </ResearchHubLayout>
  );
}
