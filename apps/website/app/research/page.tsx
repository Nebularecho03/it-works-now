import Link from "next/link";
import Image from "next/image";

import { SectionHeading } from "@/components/layout/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SaveItemButton } from "@/components/user/save-item-button";
import { siteContent } from "@/lib/content/site-content";
import { createMetadata } from "@/lib/site";

export const metadata = createMetadata(
  "Research and Publications",
  "Filterable research, publications, grants, and talks.",
  "/research",
);
export const revalidate = 3600;

export default async function ResearchPage() {
  return (
    <>
      <section className="section-space">
        <div className="container-shell space-y-12">
          <SectionHeading
            eyebrow="Research"
            title="Academic Contributions & Scholarly Work"
            description="A comprehensive overview of research projects, publications, funding, and academic engagements that advance psychological science and cultural understanding."
          />

          {/* Research Projects */}
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="font-display text-4xl">Active Research Projects</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Current initiatives exploring indigenous knowledge systems, cultural psychology, and evidence-based mental health practices.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {siteContent.researchProjects.map((project) => (
                <Card key={project.title} className="p-8 hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                          {project.category} • {project.status}
                        </p>
                        <h3 className="font-display text-2xl leading-tight">{project.title}</h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-primary"></div>
                      </div>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">{project.summary}</p>

                    {project.funding && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-foreground">Funding:</span>
                        <span className="text-primary font-semibold">{project.funding}</span>
                      </div>
                    )}

                    {project.details && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground">Key Aspects</h4>
                        <ul className="space-y-2">
                          {project.details.map((detail) => (
                            <li key={detail} className="flex gap-3 text-sm text-muted-foreground">
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60"></span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {project.team && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-foreground">Research Team</h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {project.team.map((member, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 border-border/50">
                                <Image
                                  src={member.image}
                                  alt={member.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="font-semibold text-foreground text-sm">{member.name}</h5>
                                <p className="text-xs font-medium text-primary">{member.role}</p>
                                <p className="text-xs text-muted-foreground">{member.affiliation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {project.link && (
                      <div className="flex flex-wrap gap-3 pt-4">
                        <Button asChild variant="default" size="sm">
                          <Link href={project.link}>Learn More</Link>
                        </Button>
                        <SaveItemButton
                          type="research"
                          itemKey={project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                          title={project.title}
                          href={project.link}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Publications */}
          <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
            <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">Publications</p>
                <h3 className="font-display text-3xl">Academic Output & Scholarly Contributions</h3>
                <p className="text-muted-foreground max-w-2xl">
                  Peer-reviewed publications exploring cultural psychology, indigenous knowledge systems, and evidence-based mental health practices.
                </p>
              </div>
              <Button asChild variant="outline" size="lg">
                <Link href="https://scholar.google.com/citations?user=nBzSCvUAAAAJ&hl=en" className="flex items-center gap-2">
                  <span>View Full Profile</span>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.69L10.5 15.75l-3.06-3.06a1.5 1.5 0 0 0-2.12 2.12l4.12 4.12a1.5 1.5 0 0 0 2.12 0l7.62-7.62a1.5 1.5 0 0 0-2.12-2.12z"/>
                  </svg>
                </Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {siteContent.publications.map((publication) => (
                <Card key={publication.title} className="p-6 hover:shadow-lg transition-all duration-300 border border-border/50 bg-background/80">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-semibold uppercase tracking-wider text-primary px-3 py-1 bg-primary/10 rounded-full">
                        {publication.type}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-medium text-foreground">{publication.year}</span>
                    </div>

                    <h4 className="font-semibold text-lg leading-tight text-foreground">{publication.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{publication.summary}</p>

                    {publication.fileUrl && (
                      <Button asChild variant="ghost" size="sm" className="px-0 mt-4">
                        <Link href={publication.fileUrl} className="flex items-center gap-2">
                          <span>Read Publication</span>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Grants and Conferences */}
          <div className="grid gap-8 xl:grid-cols-[1fr_1.2fr]">
            <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">Funding</p>
                <h3 className="font-display text-3xl">Research Grants & Awards</h3>
                <p className="text-muted-foreground">
                  Competitive funding secured for advancing psychological research and community mental health initiatives.
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                {siteContent.grants.map((grant) => (
                  <li
                    key={grant}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                      <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <span className="text-sm leading-relaxed text-foreground">{grant}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">Academic Engagement</p>
                <h3 className="font-display text-3xl">Conferences & Invited Talks</h3>
                <p className="text-muted-foreground">
                  Presentations and speaking engagements at international conferences and academic institutions.
                </p>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-foreground flex items-center gap-2">
                    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    Conferences
                  </h4>
                  <ul className="space-y-3">
                    {siteContent.conferences.map((conference) => (
                      <li key={conference} className="flex gap-3 text-sm text-muted-foreground border-l-2 border-primary/30 pl-4">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60"></span>
                        <span>{conference}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-foreground flex items-center gap-2">
                    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
                    </svg>
                    Invited Talks
                  </h4>
                  <ul className="space-y-3">
                    {siteContent.invitedTalks.map((talk) => (
                      <li key={talk} className="flex gap-3 text-sm text-muted-foreground border-l-2 border-primary/30 pl-4">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60"></span>
                        <span>{talk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Recognition and Media */}
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">Recognition</p>
                <h3 className="font-display text-3xl">Honors & Awards</h3>
                <p className="text-muted-foreground">
                  Academic and professional recognition for contributions to psychology and mental health.
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                {siteContent.awards.map((award) => (
                  <li
                    key={`${award.title}-${award.year}`}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/50"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">{award.year}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-foreground">{award.title}</span>
                      </div>
                      {award.href && (
                        <Link href={award.href} className="text-sm text-primary hover:underline">
                          View Reference
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">Media</p>
                <h3 className="font-display text-3xl">Public Engagement</h3>
                <p className="text-muted-foreground">
                  Media appearances, interviews, and public scholarship contributing to broader conversations about mental health.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                {siteContent.media.map((item) => (
                  <div
                    key={item.href}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                      <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <Link href={item.href} className="font-semibold text-foreground hover:text-primary transition-colors">
                        {item.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>{item.kind}</span>
                        {item.year && (
                          <>
                            <span>•</span>
                            <span>{item.year}</span>
                          </>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Collaborators */}
          <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
            <div className="space-y-4 text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Collaboration</p>
              <h3 className="font-display text-3xl">Research Network & Partners</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Esteemed colleagues and collaborators who contribute to advancing psychological science and cultural understanding.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {siteContent.collaborators.map((person) => (
                <Card key={person.name} className="p-6 hover:shadow-lg transition-all duration-300 border border-border/50 bg-background/80">
                  <div className="flex items-start gap-4">
                    {person.image && (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-border/50">
                        <Image
                          src={person.image}
                          alt={person.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground mb-1">{person.name}</h4>
                      <p className="text-sm font-medium text-primary mb-2">{person.role}</p>
                      <p className="text-sm text-muted-foreground mb-3">{person.affiliation}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{person.summary}</p>
                      {person.href && (
                        <Button asChild variant="ghost" size="sm" className="px-0 mt-3">
                          <Link href={person.href} className="flex items-center gap-2">
                            <span>View Profile</span>
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}