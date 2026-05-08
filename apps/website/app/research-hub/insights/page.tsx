import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  TrendingUp, 
  Link2, 
  Layers, 
  Target,
  Eye,
  ArrowRight,
  Calendar,
  Users
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Research Insights | HDLK-L Research Hub",
  description: "Research insights, cross-project connections, and thematic analysis from our research portfolio",
};

// Mock research insights data
const researchInsights = [
  {
    id: "1",
    title: "Indigenous Knowledge Systems in Mental Health",
    summary: "Our research consistently demonstrates that traditional African healing practices show significant promise in complementing modern mental health approaches.",
    keyFindings: [
      "78% improvement in treatment outcomes when traditional practices are integrated",
      "Strong community acceptance of culturally-grounded interventions",
      "Cost-effective solutions for resource-limited settings"
    ],
    relatedProjects: ["Traditional Luhya Mourning Rituals", "Decolonizing Mental Health"],
    impact: "High",
    category: "Mental Health"
  },
  {
    id: "2", 
    title: "Cross-Cultural Psychology Framework",
    summary: "Development of a robust framework for understanding psychological phenomena across diverse African cultural contexts.",
    keyFindings: [
      "Validated across 6 African countries",
      "Adaptable to different cultural contexts",
      "Shows strong predictive validity"
    ],
    relatedProjects: ["Cultural Psychology Review", "Cross-Cultural Development Study"],
    impact: "High",
    category: "Theory Development"
  },
  {
    id: "3",
    title: "Community-Based Research Methodologies",
    summary: "Innovative approaches to conducting research that actively involves community members in the research process.",
    keyFindings: [
      "Improved research relevance and applicability",
      "Enhanced community trust and participation",
      "Sustainable knowledge transfer"
    ],
    relatedProjects: ["Community Engagement Workshop", "Participatory Action Research"],
    impact: "Medium",
    category: "Methodology"
  }
];

const thematicGroups = [
  {
    name: "Cultural Psychology",
    description: "Research exploring how cultural factors influence psychological processes and mental health",
    projectCount: 8,
    publicationCount: 12,
    color: "bg-emerald-100 text-emerald-800 border-emerald-200"
  },
  {
    name: "Indigenous Knowledge",
    description: "Studies of traditional knowledge systems and their applications in modern contexts",
    projectCount: 6,
    publicationCount: 9,
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  {
    name: "Community Mental Health",
    description: "Research on community-based approaches to mental health and wellbeing",
    projectCount: 5,
    publicationCount: 7,
    color: "bg-purple-100 text-purple-800 border-purple-200"
  },
  {
    name: "Thanatology & Bereavement",
    description: "Studies of death, mourning practices, and cultural approaches to grief",
    projectCount: 4,
    publicationCount: 6,
    color: "bg-amber-100 text-amber-800 border-amber-200"
  }
];

export default function InsightsPage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="w-8 h-8 text-[#0F766E]" />
          <h1 className="text-4xl font-bold">Research Insights</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Key findings, cross-project connections, and thematic analysis from our research portfolio
        </p>
      </section>

      {/* Featured Insights */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Featured Research Insights</h2>
          <p className="text-muted-foreground">Key discoveries and breakthrough findings from our research</p>
        </div>

        <div className="space-y-6">
          {researchInsights.map((insight) => (
            <Card key={insight.id} className="p-8 hover:shadow-lg transition-all duration-300">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">{insight.title}</h3>
                    <div className="flex items-center gap-3">
                      <Badge className={insight.impact === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                        {insight.impact} Impact
                      </Badge>
                      <Badge variant="outline">{insight.category}</Badge>
                    </div>
                  </div>
                  <Eye className="w-6 h-6 text-muted-foreground" />
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  {insight.summary}
                </p>

                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Key Findings</h4>
                  <ul className="space-y-2">
                    {insight.keyFindings.map((finding, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-[#0F766E] flex-shrink-0 mt-0.5" />
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Related Projects</h4>
                  <div className="flex flex-wrap gap-2">
                    {insight.relatedProjects.map((project, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {project}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Thematic Groups */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Thematic Research Groups</h2>
          <p className="text-muted-foreground">Research organized by key themes and focus areas</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {thematicGroups.map((theme, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{theme.name}</h3>
                    <p className="text-muted-foreground">{theme.description}</p>
                  </div>
                  <Badge className={theme.color}>
                    {theme.projectCount} projects
                  </Badge>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>{theme.projectCount} projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>{theme.publicationCount} publications</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/research-hub/insights/themes">
                    <Eye className="w-4 h-4 mr-2" />
                    Explore Theme
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Cross-Project Connections */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Cross-Project Connections</h2>
          <p className="text-muted-foreground">Discover how our research projects interconnect and build upon each other</p>
        </div>

        <Card className="p-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Research Networks</h3>
              <p className="text-muted-foreground">
                Our projects form interconnected networks of knowledge, with findings from one study often informing and enhancing others.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Link2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Strong Connections</h4>
                    <p className="text-sm text-muted-foreground">8 project pairs with direct methodological links</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Shared Participants</h4>
                    <p className="text-sm text-muted-foreground">12 researchers across multiple projects</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold">Knowledge Evolution</h3>
              <p className="text-muted-foreground">
                Track how ideas and findings have evolved across our research portfolio over time.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="font-medium">2021-2022: Foundation Studies</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">2022-2023: Framework Development</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="font-medium">2023-2024: Applied Research</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="font-medium">2024-2025: Implementation & Scaling</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button size="lg" asChild>
              <Link href="/research-hub/insights/links">
                <Link2 className="w-4 h-4 mr-2" />
                Explore All Connections
              </Link>
            </Button>
          </div>
        </Card>
      </section>

      {/* Research Impact Dashboard */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Research Impact Dashboard</h2>
          <p className="text-muted-foreground">Measuring the real-world impact of our research</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-600">87%</h3>
            <p className="text-muted-foreground">Community Adoption Rate</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-blue-600">15,000+</h3>
            <p className="text-muted-foreground">People Impacted</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-purple-600">6</h3>
            <p className="text-muted-foreground">Countries Reached</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-amber-600">24</h3>
            <p className="text-muted-foreground">Policy Changes Influenced</p>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-[#0F766E] to-teal-600 rounded-2xl p-8 text-white text-center">
        <div className="space-y-6">
          <Brain className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold">Explore Our Research Insights</h2>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Dive deeper into our research findings and discover how our work is advancing culturally grounded psychology
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#0F766E] hover:bg-gray-100 border-0 px-8" asChild>
              <Link href="/research-hub/insights/findings">
                <Target className="w-4 h-4 mr-2" />
                View Detailed Findings
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#0F766E] px-8" asChild>
              <Link href="/research-hub/search">
                Search Research Database
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
