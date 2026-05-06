import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteContent } from "@/lib/content/site-content";
import { createMetadata } from "@/lib/site";
import { Calendar, User, ExternalLink, FileText, TrendingUp, Clock } from "lucide-react";

export const metadata = createMetadata(
  "Research Blog & Portfolio",
  "Research insights, publications, and academic portfolio.",
  "/research-hub/blog",
);

export const revalidate = 3600;

const blogPosts = [
  {
    id: 1,
    title: "Indigenous Healing Practices: A Cultural Evolutionary Perspective",
    excerpt: "Exploring how traditional healing practices evolve and adapt in contemporary African societies, and their therapeutic value in modern mental health care.",
    author: "Dr. Stephen Asatsa",
    date: "2024-04-15",
    category: "Cultural Psychology",
    readTime: "8 min read",
    tags: ["indigenous healing", "cultural evolution", "mental health"],
    featured: true,
    image: "/images/research/traditional-healing.jpg"
  },
  {
    id: 2,
    title: "The Role of Community in Mental Health: Lessons from Luhya Mourning Rituals",
    excerpt: "Insights from our ongoing research on how communal mourning practices contribute to psychological wellbeing and collective resilience.",
    author: "Dr. Elizabeth Shino",
    date: "2024-03-28",
    category: "Community Psychology",
    readTime: "6 min read",
    tags: ["community health", "mourning rituals", "resilience"],
    featured: false
  },
  {
    id: 3,
    title: "Decolonizing Psychology: African Perspectives on Mental Health",
    excerpt: "A critical examination of Western psychological frameworks and the need for culturally appropriate approaches in African contexts.",
    author: "Dr. Stephen Asatsa",
    date: "2024-03-10",
    category: "Theory & Framework",
    readTime: "10 min read",
    tags: ["decolonization", "african psychology", "cultural competence"],
    featured: false
  },
  {
    id: 4,
    title: "Youth Mental Health in Kenya: Challenges and Opportunities",
    excerpt: "Analysis of mental health challenges facing Kenyan youth and community-based intervention strategies.",
    author: "Research Team",
    date: "2024-02-22",
    category: "Youth Development",
    readTime: "7 min read",
    tags: ["youth mental health", "kenya", "interventions"],
    featured: false
  },
  {
    id: 5,
    title: "Methodological Considerations in Cross-Cultural Psychology Research",
    excerpt: "Best practices for conducting culturally sensitive research that respects local contexts while maintaining scientific rigor.",
    author: "Dr. Luzelle Naude",
    date: "2024-02-05",
    category: "Research Methods",
    readTime: "9 min read",
    tags: ["methodology", "cross-cultural", "research ethics"],
    featured: false
  }
];

const categories = [
  { name: "Cultural Psychology", count: 3, color: "bg-blue-100 text-blue-800" },
  { name: "Community Psychology", count: 2, color: "bg-green-100 text-green-800" },
  { name: "Theory & Framework", count: 1, color: "bg-purple-100 text-purple-800" },
  { name: "Youth Development", count: 1, color: "bg-orange-100 text-orange-800" },
  { name: "Research Methods", count: 1, color: "bg-gray-100 text-gray-800" }
];

export default function ResearchBlogPage() {
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-4">Research Blog & Portfolio</h1>
            <p className="text-lg text-muted-foreground">
              Insights, publications, and thought leadership from our research activities.
            </p>
          </div>

          {/* Featured Post */}
          {featuredPost && (
            <Card className="p-6 border-2 border-blue-200 bg-blue-50/30">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <Badge className="bg-blue-100 text-blue-800">Featured</Badge>
              </div>
              <h2 className="text-2xl font-bold mb-3">{featuredPost.title}</h2>
              <p className="text-muted-foreground mb-4">{featuredPost.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {featuredPost.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredPost.readTime}
                  </div>
                </div>
                <Button asChild>
                  <Link href={`/research-hub/blog/${featuredPost.id}`}>
                    Read More
                  </Link>
                </Button>
              </div>
            </Card>
          )}

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <Badge key={index} className={category.color} variant="outline">
                {category.name} ({category.count})
              </Badge>
            ))}
          </div>

          {/* Recent Posts Grid */}
          <div className="grid gap-6">
            <h2 className="text-xl font-semibold">Recent Posts</h2>
            <div className="space-y-4">
              {regularPosts.map((post) => (
                <Card key={post.id} className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="text-sm text-muted-foreground">{post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    <p className="text-muted-foreground">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.date}
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/research-hub/blog/${post.id}`}>
                          Read More
                        </Link>
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Publications Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Publications</h2>
            <div className="space-y-4">
              {siteContent.publications.slice(0, 3).map((publication, index) => (
                <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <Badge variant="secondary">{publication.type}</Badge>
                      <Badge variant="outline">{publication.year}</Badge>
                    </div>
                    <h4 className="font-semibold mb-1">{publication.title}</h4>
                    <p className="text-sm text-muted-foreground">{publication.summary}</p>
                  </div>
                  {publication.fileUrl && (
                    <Button asChild variant="outline" size="sm">
                      <a href={publication.fileUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        PDF
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button asChild variant="outline">
                <Link href="https://scholar.google.com/citations?user=nBzSCvUAAAAJ&hl=en" target="_blank">
                  View All Publications
                </Link>
              </Button>
            </div>
          </Card>

          {/* Research Insights */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Research Insights</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Key Finding</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Traditional mourning rituals significantly contribute to community resilience and psychological wellbeing.
                </p>
                <Badge variant="outline" className="text-xs">Cultural Evolution</Badge>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Methodology Innovation</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Mixed-methods approach combining quantitative analysis with qualitative ethnographic insights.
                </p>
                <Badge variant="outline" className="text-xs">Research Methods</Badge>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Community Impact</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Research findings directly informing mental health policy and practice in Kenya.
                </p>
                <Badge variant="outline" className="text-xs">Applied Research</Badge>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Global Recognition</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Work cited in international journals and presented at global conferences.
                </p>
                <Badge variant="outline" className="text-xs">Academic Impact</Badge>
              </div>
            </div>
          </Card>
    </div>
  );
}
