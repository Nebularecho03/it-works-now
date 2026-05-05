import Link from "next/link";
import Image from "next/image";

import { SectionHeading } from "@/components/layout/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SaveItemButton } from "@/components/user/save-item-button";
import { siteContent } from "@/lib/content/site-content";
import { createMetadata } from "@/lib/site";
import { EnhancedCaseStudies } from "@/components/sections/enhanced-case-studies";

export const metadata = createMetadata(
  "Research and Publications",
  "Filterable research, publications, grants, and talks.",
  "/research",
);
export const revalidate = 3600;

const researchHighlights = [
  { label: "Projects", value: siteContent.researchProjects.length },
  { label: "Publications", value: siteContent.publications.length },
  { label: "Grants", value: siteContent.grants.length },
  { label: "Talks", value: siteContent.conferences.length + siteContent.invitedTalks.length },
];

export default async function ResearchPage() {
  return (
    <>
      <section className="section-space">
        <div className="container-shell space-y-12">
          <SectionHeading
            eyebrow="Research"
            title="Projects, publications, grants, conferences, and invited talks."
            description="The original site content is still here, but this page now groups it into tighter, easier-to-scan blocks so the information uses the full width more effectively."
          />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {researchHighlights.map((item) => (
            <Card key={item.label} className="flex items-end justify-between gap-4 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{item.label}</p>
                <p className="mt-3 font-display text-4xl text-foreground">{item.value}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/10" />
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {siteContent.researchProjects.map((project) => (
            <Card key={project.title} className="p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {project.category} • {project.status}
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight">{project.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{project.summary}</p>
              {project.funding ? <p className="mt-3 text-sm font-medium text-foreground">Funding: {project.funding}</p> : null}
              {project.details ? (
                <ul className="mt-4 space-y-2 text-sm leading-7 text-muted-foreground">
                  {project.details.map((detail) => (
                    <li key={detail} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {project.team ? (
                <div className="mt-6 space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Research Team</h4>
                  <div className="space-y-4">
                    {project.team.map((member, index) => (
                      <div key={index} className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-background/80 to-background/40 p-5 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:border-accent/30">
                        <div className="flex items-start gap-4">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-border/50 shadow-sm">
                            <Image
                              src={member.image}
                              alt={member.name}
                              fill
                              sizes="64px"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="font-semibold text-foreground leading-tight">{member.name}</h5>
                                <p className="text-sm font-medium text-accent mt-1">{member.role}</p>
                                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{member.affiliation}</p>
                              </div>
                              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-accent/60"></div>
                              </div>
                            </div>
                            {member.bio && (
                              <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                                {member.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {project.link ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button asChild variant="ghost" className="px-0">
                    <Link href={project.link}>Read more</Link>
                  </Button>
                  <SaveItemButton
                    type="research"
                    itemKey={project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                    title={project.title}
                    href={project.link}
                  />
                </div>
              ) : null}
            </Card>
          ))}
        </div>

        <Card className="p-7">
          <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Publications</p>
              <h3 className="font-display text-3xl">Selected outputs and academic resources</h3>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                Publications now sit in a compact card grid so the section feels lighter while keeping the same information visible.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="https://scholar.google.com/citations?user=nBzSCvUAAAAJ&hl=en">See full publications</Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {siteContent.publications.map((publication) => (
              <div
                key={publication.title}
                className="rounded-[24px] border border-border bg-background/70 p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  <span>{publication.type}</span>
                  <span className="text-border">•</span>
                  <span>{publication.year}</span>
                </div>
                <h4 className="mt-3 text-lg font-semibold leading-snug text-foreground">{publication.title}</h4>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{publication.summary}</p>
                {publication.fileUrl ? (
                  <Button asChild variant="ghost" className="mt-3 px-0">
                    <Link href={publication.fileUrl}>Open file</Link>
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-7">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Grants</p>
              <h3 className="font-display text-3xl">Funding and travel support</h3>
            </div>
            <ul className="mt-6 grid gap-3 md:grid-cols-2">
              {siteContent.grants.map((grant) => (
                <li
                  key={grant}
                  className="rounded-[22px] border border-border/80 bg-background/65 px-4 py-3 text-sm leading-7 text-muted-foreground"
                >
                  {grant}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-7">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Conferences and Talks</p>
              <h3 className="font-display text-3xl">Conference activity and invited speaking</h3>
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="rounded-[24px] border border-border/80 bg-background/65 p-5">
                <h4 className="text-lg font-semibold text-foreground">Conferences</h4>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                  {siteContent.conferences.map((conference) => (
                    <li key={conference} className="border-b border-border/70 pb-3 last:border-0 last:pb-0">
                      {conference}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[24px] border border-border/80 bg-background/65 p-5">
                <h4 className="text-lg font-semibold text-foreground">Invited talks</h4>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                  {siteContent.invitedTalks.map((talk) => (
                    <li key={talk} className="border-b border-border/70 pb-3 last:border-0 last:pb-0">
                      {talk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-7">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Recognition</p>
              <h3 className="font-display text-3xl">Honors and awards</h3>
            </div>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-muted-foreground">
              {siteContent.awards.map((award) => (
                <li
                  key={`${award.title}-${award.year}`}
                  className="rounded-[22px] border border-border/80 bg-background/65 px-4 py-3"
                >
                  <span className="font-medium text-foreground">{award.year}</span> • {award.title}
                  {award.href ? (
                    <>
                      {" "}
                      <Link href={award.href} className="text-foreground underline-offset-4 hover:underline">
                        Reference
                      </Link>
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-7">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Media</p>
              <h3 className="font-display text-3xl">Media and talk archive</h3>
            </div>
            <div className="mt-6 grid gap-4">
              {siteContent.media.map((item) => (
                <div
                  key={item.href}
                  className="rounded-[22px] border border-border/80 bg-background/65 px-4 py-4 text-sm leading-7 text-muted-foreground"
                >
                  <Link href={item.href} className="font-medium text-foreground underline-offset-4 hover:underline">
                    {item.title}
                  </Link>
                  <p className="mt-1">
                    {item.kind}
                    {item.year ? ` • ${item.year}` : ""}
                  </p>
                  {item.description ? <p className="mt-1">{item.description}</p> : null}
                </div>
              ))}
            </div>
          </Card>
        </div>

          <Card className="p-7">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Collaboration</p>
              <h3 className="font-display text-3xl">Project collaborators</h3>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {siteContent.collaborators.map((person) => (
                <div key={person.name} className="rounded-[24px] border border-border p-5">
                  <div className="flex items-start gap-4">
                    {person.image ? (
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
                        <Image
                          src={person.image}
                          alt={person.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{person.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {person.role} • {person.affiliation}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{person.summary}</p>
                  {person.href ? (
                    <Button asChild variant="ghost" className="mt-3 px-0">
                      <Link href={person.href}>Open profile</Link>
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <EnhancedCaseStudies />
    </>
  );
}
