import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteContent } from "@/lib/content/site-content";
import { createMetadata } from "@/lib/site";
import { Award, Calendar, ExternalLink, Trophy, Star } from "lucide-react";

export const metadata = createMetadata(
  "Awards and Recognition",
  "Academic awards, grants, and professional recognition.",
  "/research-hub/awards",
);

export const revalidate = 3600;

const additionalAwards = [
  {
    title: "Excellence in Teaching Award",
    organization: "Catholic University of Eastern Africa",
    year: "2023",
    type: "Teaching",
    description: "Recognized for outstanding contribution to psychology education"
  },
  {
    title: "Best Research Paper Award",
    organization: "African Psychological Association",
    year: "2022",
    type: "Research",
    description: "Awarded for groundbreaking research on indigenous healing practices"
  },
  {
    title: "Community Service Excellence",
    organization: "Kenya Psychological Association",
    year: "2021",
    type: "Service",
    description: "Recognized for exceptional community mental health initiatives"
  }
];

const grants = [
  {
    title: "Traditional Luhya Mourning Rituals Research",
    organization: "Templeton Foundation",
    amount: "$150,000",
    year: "2024",
    status: "Active",
    description: "Major interdisciplinary project exploring therapeutic value of Indigenous mourning rituals"
  },
  {
    title: "Cultural Evolution Society Transformation Fund",
    organization: "Cultural Evolution Society",
    amount: "$75,000",
    year: "2024",
    status: "Active",
    description: "Support for research on cultural transmission and resilience"
  },
  {
    title: "Mental Health Services Research Grant",
    organization: "National Research Fund",
    amount: "$50,000",
    year: "2023",
    status: "Completed",
    description: "Evaluation of community-based mental health interventions"
  }
];

export default function ResearchAwardsPage() {
  return (
    <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-4">Awards and Recognition</h1>
            <p className="text-lg text-muted-foreground">
              Celebrating academic achievements, research excellence, and professional recognition.
            </p>
          </div>

          {/* Statistics Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{siteContent.awards.length + additionalAwards.length}</div>
              <div className="text-sm text-muted-foreground">Total Awards</div>
            </Card>
            <Card className="p-4 text-center">
              <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{grants.length}</div>
              <div className="text-sm text-muted-foreground">Research Grants</div>
            </Card>
            <Card className="p-4 text-center">
              <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">$275,000</div>
              <div className="text-sm text-muted-foreground">Total Funding</div>
            </Card>
            <Card className="p-4 text-center">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">2024</div>
              <div className="text-sm text-muted-foreground">Latest Award</div>
            </Card>
          </div>

          {/* Academic Awards */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Academic Awards</h2>
            <div className="space-y-4">
              {[...siteContent.awards, ...additionalAwards].map((award, index) => (
                <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      <h3 className="font-semibold">{award.title}</h3>
                      <Badge variant="secondary">{award.year}</Badge>
                    </div>
                    {'organization' in award && (
                      <p className="text-muted-foreground mb-1">{award.organization}</p>
                    )}
                    {'description' in award && award.description && (
                      <p className="text-sm text-muted-foreground">{award.description}</p>
                    )}
                  </div>
                  {'href' in award && award.href && (
                    <Button asChild variant="outline" size="sm">
                      <a href={award.href} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Research Grants */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Research Grants</h2>
            <div className="space-y-4">
              {grants.map((grant, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold mb-1">{grant.title}</h3>
                      <p className="text-muted-foreground">{grant.organization}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{grant.amount}</div>
                      <Badge 
                        variant={grant.status === 'Active' ? 'default' : 'outline'}
                        className={grant.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {grant.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{grant.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {grant.year}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Professional Recognition */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Professional Recognition</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Leadership Roles</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Head of Department of Psychology, CUEA</li>
                  <li>• Africa Regional Representative, EAPP</li>
                  <li>• Governing Council Member, SRCD</li>
                  <li>• E-newsletter Editor, ISSBD</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Editorial Positions</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Review Editor, Frontiers in Psychology</li>
                  <li>• Review Editor, Frontiers in Reproductive Health</li>
                  <li>• Editorial Board Member, African Journal of Psychology</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Certifications and Licenses */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Certifications and Licenses</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Registered Psychologist</h4>
                  <p className="text-sm text-muted-foreground">Kenya Counselors and Psychologists Board</p>
                </div>
                <Badge variant="outline">Licensed</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Research Ethics Certification</h4>
                  <p className="text-sm text-muted-foreground">National Commission for Science, Technology and Innovation</p>
                </div>
                <Badge variant="outline">Certified</Badge>
              </div>
            </div>
          </Card>
    </div>
  );
}
