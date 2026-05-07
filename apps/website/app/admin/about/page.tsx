"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Save,
  X,
  Eye,
  Quote,
  Type,
  Info
} from "lucide-react";
import { api, ApiClient } from "@/components/api/client";

interface AboutContent {
  aboutFull: string[];
  quote: {
    text: string;
    author: string;
  };
}

export default function AboutAdminPage() {
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

  const [aboutContent, setAboutContent] = useState<AboutContent>({
    aboutFull: [
      "Dr. Stephen Asatsa is a Senior Lecturer and Head of Department of Psychology at the Catholic University of Eastern Africa. He integrates academic leadership with clinical practice.",
      "As a licensed psychologist registered by the Kenya Counselors and Psychologists Board, he co-founded BeautifulMind Consultants to advance mental health services in Kenya.",
      "His research focuses on indigenous knowledge systems, decolonization of psychology, thanatology, and cultural evolution. He advocates for culturally grounded psychological practice.",
      "Dr. Asatsa serves on governing councils including SRCD and represents Africa for the European Association of Personality Psychology."
    ],
    quote: {
      text: "The good life is one inspired by love and guided by knowledge.",
      author: "Bertrand Russell"
    }
  });

  const [previewData, setPreviewData] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAboutContent();
  }, []);

  const loadAboutContent = async () => {
    try {
      const response = await api.get("/api/admin/about");
      if (response.ok) {
        const data = await response.json();
        if (data.aboutFull || data.quote) {
          setAboutContent(data);
        }
      }
    } catch (error) {
      console.error("Failed to load about content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put("/api/admin/about", aboutContent);
      setPreviewData(aboutContent);
      alert("Content saved successfully!");
    } catch (error) {
      console.error("Failed to save about content:", error);
      alert("Failed to save content. Please try again.");
    }
  };

  const handleParagraphChange = (index: number, value: string) => {
    const newAboutFull = [...aboutContent.aboutFull];
    newAboutFull[index] = value;
    setAboutContent(prev => ({ ...prev, aboutFull: newAboutFull }));
  };

  const addParagraph = () => {
    setAboutContent(prev => ({
      ...prev,
      aboutFull: [...prev.aboutFull, ""]
    }));
  };

  const removeParagraph = (index: number) => {
    if (aboutContent.aboutFull.length <= 1) return;
    const newAboutFull = aboutContent.aboutFull.filter((_, i) => i !== index);
    setAboutContent(prev => ({ ...prev, aboutFull: newAboutFull }));
  };

  const moveParagraphUp = (index: number) => {
    if (index === 0) return;
    const newAboutFull = [...aboutContent.aboutFull];
    [newAboutFull[index - 1], newAboutFull[index]] = [newAboutFull[index], newAboutFull[index - 1]];
    setAboutContent(prev => ({ ...prev, aboutFull: newAboutFull }));
  };

  const moveParagraphDown = (index: number) => {
    if (index === aboutContent.aboutFull.length - 1) return;
    const newAboutFull = [...aboutContent.aboutFull];
    [newAboutFull[index], newAboutFull[index + 1]] = [newAboutFull[index + 1], newAboutFull[index]];
    setAboutContent(prev => ({ ...prev, aboutFull: newAboutFull }));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">About Section</h1>
          <p className="text-slate-600">Manage the "Who We Are" section content and quote</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setPreviewData(aboutContent)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Where this appears</h3>
            <p className="text-sm text-blue-700 mt-1">
              This content appears in the "Who We Are" section on the homepage, including the main paragraphs and the featured quote at the bottom.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Editor */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Type className="w-5 h-5" />
                About Paragraphs
              </h3>
              <Button size="sm" onClick={addParagraph}>
                <Plus className="w-4 h-4 mr-2" />
                Add Paragraph
              </Button>
            </div>

            <div className="space-y-4">
              {aboutContent.aboutFull.map((paragraph, index) => (
                <div key={index} className="border rounded-lg p-4 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      Paragraph {index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => moveParagraphUp(index)}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => moveParagraphDown(index)}
                        disabled={index === aboutContent.aboutFull.length - 1}
                      >
                        ↓
                      </Button>
                      {aboutContent.aboutFull.length > 1 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeParagraph(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <Textarea
                    value={paragraph}
                    onChange={(e) => handleParagraphChange(index, e.target.value)}
                    rows={3}
                    className="w-full"
                    placeholder="Enter paragraph content..."
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Quote className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-slate-900">Featured Quote</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quote Text
                </label>
                <Input
                  value={aboutContent.quote.text}
                  onChange={(e) => setAboutContent(prev => ({
                    ...prev,
                    quote: { ...prev.quote, text: e.target.value }
                  }))}
                  placeholder="Enter quote text..."
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quote Author
                </label>
                <Input
                  value={aboutContent.quote.author}
                  onChange={(e) => setAboutContent(prev => ({
                    ...prev,
                    quote: { ...prev.quote, author: e.target.value }
                  }))}
                  placeholder="Enter quote author..."
                  className="w-full"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="space-y-6">
          {previewData && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Preview
              </h3>

              <div className="space-y-6">
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  {previewData.aboutFull.map((paragraph, index) => (
                    <p key={index}>{paragraph || <em className="text-slate-400">Empty paragraph...</em>}</p>
                  ))}
                </div>

                <div className="pt-4">
                  <blockquote className="border-l-4 border-blue-500 pl-6 italic text-blue-600 bg-blue-50 p-4 rounded-r-lg">
                    <p className="text-lg mb-2">
                      "{previewData.quote.text || <em className="text-slate-400">No quote text...</em>}"
                    </p>
                    <cite className="text-sm font-medium text-blue-700">
                      {previewData.quote.author || <em className="text-slate-400">Unknown author</em>}
                    </cite>
                  </blockquote>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
