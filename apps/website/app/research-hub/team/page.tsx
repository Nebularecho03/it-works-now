import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Globe, ExternalLink, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { siteContent } from "@/lib/content/site-content";

export const metadata = {
  title: "Our Team | HDLK-L Research Hub",
  description: "Meet the research team and international collaborators at the Human Development, Indigenous Knowledge and Flourishing Lab",
};

export default function TeamPage() {
  return (
    <div className="space-y-8">
            {/* Hero Section */}
            <section className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Users className="w-8 h-8 text-[#0F766E]" />
                <h1 className="text-4xl font-bold">Our Team</h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                A diverse network of researchers, collaborators, and students working together to advance culturally grounded psychology
              </p>
            </section>

            {/* Core Leadership */}
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Core Leadership</h2>
                <p className="text-muted-foreground">Led by Dr. Stephen Asatsa at the Catholic University of Eastern Africa</p>
              </div>
              
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
                  <div className="space-y-4">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#0F766E] to-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      SA
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">Dr. Stephen Asatsa</h3>
                      <Badge className="mb-3 bg-[#0F766E]">Principal Investigator</Badge>
                      <p className="text-sm text-muted-foreground mb-4">
                        Senior Lecturer & Head of Psychology Department<br />
                        Catholic University of Eastern Africa
                      </p>
                      <p className="text-sm mb-4">
                        Leading research on indigenous psychology, cultural evolution, and decolonizing mental health practices in African contexts.
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center mb-4">
                        <Badge variant="secondary">Indigenous Psychology</Badge>
                        <Badge variant="secondary">Cultural Evolution</Badge>
                        <Badge variant="secondary">Thanatology</Badge>
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button size="sm" variant="outline" asChild>
                          <Link href="https://orcid.org/0000-0002-1045-2583" target="_blank">
                            ORCID
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href="https://scholar.google.com/citations?user=nBzSCvUAAAAJ&hl=en" target="_blank">
                            Google Scholar
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* International Collaborators */}
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">International Collaborators</h2>
                <p className="text-muted-foreground">Global research partners advancing cross-cultural psychology</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {siteContent.collaborators.map((collaborator, index) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 group">
                    <div className="space-y-4">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                        {collaborator.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-bold mb-2">{collaborator.name}</h3>
                        <Badge className="mb-2 bg-teal-100 text-teal-800">{collaborator.role}</Badge>
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-3">
                          <Globe className="w-3 h-3" />
                          <span>{collaborator.affiliation}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {collaborator.summary}
                        </p>
                        {collaborator.href && (
                          <Button size="sm" variant="outline" asChild className="w-full">
                            <Link href={collaborator.href} target="_blank">
                              <ExternalLink className="w-3 h-3 mr-2" />
                              View Profile
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Research Team */}
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Research Team</h2>
                <p className="text-muted-foreground">Dedicated research assistants and graduate students</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {siteContent.researchProjects.map((project) => 
                  project.team?.filter(member => member.name !== "Stephen Asatsa").map((member, memberIndex) => (
                    <Card key={`${project.title}-${memberIndex}`} className="p-4 hover:shadow-md transition-all duration-300">
                      <div className="space-y-3">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="text-center">
                          <h4 className="font-semibold text-sm mb-1">{member.name}</h4>
                          <Badge variant="outline" className="text-xs mb-2">{member.role}</Badge>
                          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>{member.affiliation}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ).flat().filter((member, index, self) => 
                  index === self.findIndex((m) => m.key === member.key)
                )}
              </div>
            </section>

            {/* Join Our Team */}
            <section className="bg-gradient-to-r from-[#0F766E] to-teal-600 rounded-2xl p-8 text-white text-center">
              <div className="space-y-6">
                <UserCheck className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-3xl font-bold">Join Our Research Team</h2>
                <p className="text-lg max-w-2xl mx-auto opacity-90">
                  We are always looking for passionate researchers and students to join our mission of decolonizing psychology and promoting cultural wellbeing.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-white text-[#0F766E] hover:bg-gray-100 border-0 px-8" asChild>
                    <Link href="/research-hub/community">
                      <Mail className="w-4 h-4 mr-2" />
                      Get Involved
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#0F766E] px-8" asChild>
                    <Link href="/contact">
                      Contact Us
                    </Link>
                  </Button>
                </div>
              </div>
            </section>
    </div>
  );
}
