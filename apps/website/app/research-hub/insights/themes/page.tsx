import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Layers, 
  Target, 
  Users, 
  Calendar,
  TrendingUp,
  Eye,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Thematic Groups | HDLK-L Research Hub",
  description: "Research organized by key themes and focus areas across our portfolio",
};

const thematicGroups = [
  {
    name: "Cultural Psychology",
    description: "Research exploring how cultural factors influence psychological processes and mental health across African contexts",
    projects: [
      {
        title: "Traditional Luhya Mourning Rituals",
        status: "Active",
        year: "2024",
        summary: "Exploring indigenous knowledge systems in cultural psychology through traditional mourning practices"
      },
      {
        title: "Cross-Cultural Development Study",
        status: "Completed", 
        year: "2023",
        summary: "Comparative analysis of psychological development across diverse African cultural environments"
      },
      {
        title: "Cultural Identity Formation",
        status: "Active",
        year: "2024",
        summary: "Investigating how cultural identity shapes psychological wellbeing in African adolescents"
      }
    ],
    publications: 12,
    impact: "High",
    keyFindings: [
      "Cultural context significantly influences mental health outcomes",
      "Traditional practices show strong therapeutic potential",
      "Cultural identity is protective factor in psychological wellbeing"
    ],
    color: "emerald"
  },
  {
    name: "Indigenous Knowledge",
    description: "Studies of traditional knowledge systems and their applications in modern psychological practice",
    projects: [
      {
        title: "Traditional Healing Practices",
        status: "Active",
        year: "2024",
        summary: "Documentation and validation of traditional African healing methods for mental health"
      },
      {
        title: "Indigenous Knowledge Integration",
        status: "Completed",
        year: "2023",
        summary: "Framework for integrating indigenous knowledge with modern psychological practice"
      },
      {
        title: "Community Wisdom Systems",
        status: "Active",
        year: "2024",
        summary: "Exploring how community-based wisdom contributes to collective mental health"
      }
    ],
    publications: 9,
    impact: "High",
    keyFindings: [
      "Indigenous knowledge systems are empirically valid",
      "Community acceptance drives treatment success",
      "Traditional methods complement modern approaches"
    ],
    color: "blue"
  },
  {
    name: "Community Mental Health",
    description: "Research on community-based approaches to mental health promotion and intervention in African contexts",
    projects: [
      {
        title: "Community-Based Mental Health Interventions",
        status: "Active",
        year: "2024",
        summary: "Developing and testing community-driven mental health programs"
      },
      {
        title: "Peer Support Networks",
        status: "Completed",
        year: "2023",
        summary: "Effectiveness of peer support systems in community mental health"
      },
      {
        title: "Community Resilience Factors",
        status: "Active",
        year: "2024",
        summary: "Identifying factors that contribute to community psychological resilience"
      }
    ],
    publications: 7,
    impact: "Medium",
    keyFindings: [
      "Community involvement improves treatment outcomes",
      "Peer support is effective for mild to moderate conditions",
      "Cultural relevance is key to intervention success"
    ],
    color: "purple"
  },
  {
    name: "Thanatology & Bereavement",
    description: "Studies of death, mourning practices, and cultural approaches to grief and loss across African societies",
    projects: [
      {
        title: "Luhya Mourning Rituals Analysis",
        status: "Completed",
        year: "2023",
        summary: "Comprehensive study of traditional Luhya mourning practices and psychological impacts"
      },
      {
        title: "Cross-Cultural Bereavement Study",
        status: "Active",
        year: "2024",
        summary: "Comparative analysis of bereavement practices across different African cultures"
      },
      {
        title: "Grief Counseling Integration",
        status: "Active",
        year: "2024",
        summary: "Integrating traditional mourning practices with modern grief counseling"
      }
    ],
    publications: 6,
    impact: "Medium",
    keyFindings: [
      "Traditional mourning practices have therapeutic benefits",
      "Cultural rituals facilitate grief processing",
      "Integrated approaches show better outcomes"
    ],
    color: "amber"
  }
];

export default function ThematicGroupsPage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Layers className="w-8 h-8 text-[#0F766E]" />
          <h1 className="text-4xl font-bold">Thematic Research Groups</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Research organized by key themes and focus areas across our portfolio
        </p>
      </section>

      {/* Theme Overview */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Research Themes</h2>
          <p className="text-muted-foreground">Explore our research organized by key thematic areas</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {thematicGroups.map((theme, index) => (
            <Card key={index} className="p-8 hover:shadow-lg transition-all duration-300">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{theme.name}</h3>
                    <p className="text-muted-foreground">{theme.description}</p>
                  </div>
                  <Badge className={theme.impact === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                    {theme.impact} Impact
                  </Badge>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>{theme.projects.length} projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>{theme.publications} publications</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Key Findings</h4>
                  <ul className="space-y-2">
                    {theme.keyFindings.map((finding, findingIndex) => (
                      <li key={findingIndex} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 bg-${theme.color}-500`}></div>
                        <span className="text-sm">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/research-hub/insights/themes/${theme.name.toLowerCase().replace(' ', '-')}`}>
                    <Eye className="w-4 h-4 mr-2" />
                    Explore {theme.name}
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Projects by Theme */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Featured Projects by Theme</h2>
          <p className="text-muted-foreground">Key research projects from each thematic area</p>
        </div>

        <div className="space-y-6">
          {thematicGroups.map((theme) => (
            <Card key={theme.name} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 bg-${theme.color}-100 rounded-lg flex items-center justify-center`}>
                    <Layers className={`w-4 h-4 text-${theme.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold">{theme.name}</h3>
                  <Badge variant="outline">{theme.projects.length} projects</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {theme.projects.map((project, projectIndex) => (
                    <Card key={projectIndex} className="p-4 hover:shadow-md transition-all duration-300">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className={project.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {project.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{project.year}</span>
                        </div>
                        <h4 className="font-semibold">{project.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{project.summary}</p>
                        <Button size="sm" variant="outline" className="w-full">
                          <Eye className="w-3 h-3 mr-2" />
                          View Project
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Cross-Theme Analysis */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Cross-Theme Analysis</h2>
          <p className="text-muted-foreground">How our research themes connect and reinforce each other</p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">Research Theme Interconnections</h3>
              <p className="text-muted-foreground">
                Our thematic areas are highly interconnected, with findings from one theme often informing and enhancing others.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-semibold">Strong Connections</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Cultural Psychology ↔ Indigenous Knowledge</div>
                      <div className="text-sm text-muted-foreground">Shared projects: 4</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Indigenous Knowledge ↔ Community Mental Health</div>
                      <div className="text-sm text-muted-foreground">Shared projects: 3</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Community Mental Health ↔ Thanatology</div>
                      <div className="text-sm text-muted-foreground">Shared projects: 2</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Emerging Synergies</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="font-medium text-emerald-800">Cultural Context in Mental Health</div>
                    <div className="text-sm text-emerald-600">Combining cultural psychology with community approaches</div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-blue-800">Traditional Practices in Grief</div>
                    <div className="text-sm text-blue-600">Integrating indigenous knowledge with bereavement studies</div>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="font-medium text-purple-800">Community-Based Healing</div>
                    <div className="text-sm text-purple-600">Leveraging community structures for mental health support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Impact Metrics */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Theme Impact Metrics</h2>
          <p className="text-muted-foreground">Measuring the impact of our thematic research areas</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-600">34</h3>
            <p className="text-muted-foreground">Total Projects</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-blue-600">18</h3>
            <p className="text-muted-foreground">Researchers Involved</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-purple-600">4</h3>
            <p className="text-muted-foreground">Years of Research</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-amber-600">34</h3>
            <p className="text-muted-foreground">Publications</p>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-[#0F766E] to-teal-600 rounded-2xl p-8 text-white text-center">
        <div className="space-y-6">
          <Layers className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold">Explore Our Thematic Research</h2>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Dive deeper into our research themes and discover how our work is advancing understanding in each area
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#0F766E] hover:bg-gray-100 border-0 px-8" asChild>
              <Link href="/research-hub/projects">
                <Target className="w-4 h-4 mr-2" />
                View All Projects
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#0F766E] px-8" asChild>
              <Link href="/research-hub/publications">
                Browse Publications
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
