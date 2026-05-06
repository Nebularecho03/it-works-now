import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteContent } from "@/lib/content/site-content";
import { createMetadata } from "@/lib/site";
import { ExternalLink, Calendar, Users, Target } from "lucide-react";

export const metadata = createMetadata(
  "Research Projects",
  "Active and completed research projects portfolio.",
  "/research-hub/projects",
);

export const revalidate = 3600;

export default function ResearchProjectsPage() {
  return (
    <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-4">Research Projects</h1>
            <p className="text-lg text-muted-foreground">
              Exploring innovative approaches to psychology, cultural healing, and community wellbeing.
            </p>
          </div>

          {/* Projects Grid */}
          <div className="grid gap-6">
            {siteContent.researchProjects.map((project, index) => (
              <Card key={index} className="p-6">
                <div className="space-y-4">
                  {/* Project Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{project.category}</Badge>
                        <Badge 
                          variant={project.status === 'Active' ? 'default' : 'outline'}
                          className={project.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
                      <p className="text-muted-foreground">{project.summary}</p>
                    </div>
                    {project.link && (
                      <Button asChild variant="outline" size="sm">
                        <a href={project.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Project
                        </a>
                      </Button>
                    )}
                  </div>

                  {/* Project Details */}
                  {project.details && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">Key Components:</h3>
                      <ul className="space-y-2">
                        {project.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Project Meta */}
                  <div className="flex flex-wrap gap-4 pt-4 border-t">
                    {project.funding && (
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="font-medium">Funding:</span>
                        <span className="text-muted-foreground">{project.funding}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Duration:</span>
                      <span className="text-muted-foreground">Ongoing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">Team Size:</span>
                      <span className="text-muted-foreground">5-8 researchers</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Project Statistics */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{siteContent.researchProjects.length}</div>
                <div className="text-sm text-muted-foreground">Total Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {siteContent.researchProjects.filter(p => p.status === 'Active').length}
                </div>
                <div className="text-sm text-muted-foreground">Active Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {siteContent.researchProjects.filter(p => p.funding).length}
                </div>
                <div className="text-sm text-muted-foreground">Funded Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">3</div>
                <div className="text-sm text-muted-foreground">Research Areas</div>
              </div>
            </div>
          </Card>

          {/* Related Resources */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Related Resources</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h3 className="font-medium">Research Methodology Guide</h3>
                  <p className="text-sm text-muted-foreground">Best practices for cultural psychology research</p>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h3 className="font-medium">Community Engagement Framework</h3>
                  <p className="text-sm text-muted-foreground">Guidelines for community-based research</p>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h3 className="font-medium">Funding Opportunities</h3>
                  <p className="text-sm text-muted-foreground">Current grants and funding sources</p>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
            </div>
          </Card>
    </div>
  );
}
