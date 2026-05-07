"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { SectionHeading } from "@/components/layout/section-heading";
import { Card } from "@/components/ui/card";
import { siteContent } from "@/lib/content/site-content";
import { Brain, Award, Trophy, Globe, Linkedin, Twitter, Facebook, Instagram, Github, Youtube, ExternalLink, BookOpen, Users, GraduationCap } from "lucide-react";

const iconMap: Record<string, any> = {
  Brain,
  Users: Globe,
  Globe,
  BookOpen: Brain,
  Award,
  Star: Award,
  Building: Globe,
  GraduationCap: Award,
  Lightbulb: Brain,
  Microscope: Brain,
  Heart: Brain,
  Trophy,
  Medal: Trophy,
  Crown: Trophy,
  Gem: Trophy,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Github,
  Youtube,
  ExternalLink
};

const getColorClasses = (color: string) => {
  const colors: Record<string, any> = {
    emerald: {
      bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
      border: "border-emerald-200/50",
      iconBg: "bg-emerald-500",
      iconColor: "text-emerald-600",
      text: "text-emerald-900",
      subtext: "text-emerald-700",
      hover: "hover:shadow-emerald-500/25"
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-emerald-50",
      border: "border-green-200/50",
      iconBg: "bg-green-500",
      iconColor: "text-green-600",
      text: "text-green-900",
      subtext: "text-green-700",
      hover: "hover:shadow-green-500/25"
    },
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
      border: "border-blue-200/50",
      iconBg: "bg-blue-500",
      iconColor: "text-blue-600",
      text: "text-blue-900",
      subtext: "text-blue-700",
      hover: "hover:shadow-blue-500/25"
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-pink-50",
      border: "border-purple-200/50",
      iconBg: "bg-purple-500",
      iconColor: "text-purple-600",
      text: "text-purple-900",
      subtext: "text-purple-700",
      hover: "hover:shadow-purple-500/25"
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 to-red-50",
      border: "border-orange-200/50",
      iconBg: "bg-orange-500",
      iconColor: "text-orange-600",
      text: "text-orange-900",
      subtext: "text-orange-700",
      hover: "hover:shadow-orange-500/25"
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-pink-50",
      border: "border-red-200/50",
      iconBg: "bg-red-500",
      iconColor: "text-red-600",
      text: "text-red-900",
      subtext: "text-red-700",
      hover: "hover:shadow-red-500/25"
    },
    pink: {
      bg: "bg-gradient-to-br from-pink-50 to-rose-50",
      border: "border-pink-200/50",
      iconBg: "bg-pink-500",
      iconColor: "text-pink-600",
      text: "text-pink-900",
      subtext: "text-pink-700",
      hover: "hover:shadow-pink-500/25"
    },
    cyan: {
      bg: "bg-gradient-to-br from-cyan-50 to-sky-50",
      border: "border-cyan-200/50",
      iconBg: "bg-cyan-500",
      iconColor: "text-cyan-600",
      text: "text-cyan-900",
      subtext: "text-cyan-700",
      hover: "hover:shadow-cyan-500/25"
    },
    yellow: {
      bg: "bg-gradient-to-br from-yellow-50 to-amber-50",
      border: "border-yellow-200/50",
      iconBg: "bg-yellow-500",
      iconColor: "text-yellow-600",
      text: "text-yellow-900",
      subtext: "text-yellow-700",
      hover: "hover:shadow-yellow-500/25"
    }
  };
  return colors[color] || colors.emerald;
};

const researchHighlights = [
  { label: "Research Projects", value: siteContent.researchProjects.length, icon: BookOpen, description: "Active research initiatives and collaborations" },
  { label: "Publications", value: siteContent.publications.length, icon: GraduationCap, description: "Peer-reviewed academic papers and articles" },
  { label: "Grants & Funding", value: siteContent.grants.length, icon: Award, description: "Research funding and awards received" },
  { label: "Talks & Conferences", value: siteContent.conferences.length + siteContent.invitedTalks.length, icon: Users, description: "Academic presentations and speaking engagements" },
];

export default function AboutPage() {
  const [researchInterests, setResearchInterests] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);
  const [externalProfiles, setExternalProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [researchRes, awardsRes, profilesRes] = await Promise.all([
          fetch('/api/research-interests'),
          fetch('/api/awards'),
          fetch('/api/external-profiles')
        ]);

        const researchData = await researchRes.json();
        const awardsData = await awardsRes.json();
        const profilesData = await profilesRes.json();

        setResearchInterests(researchData.research_interests || []);
        setAwards(awardsData.awards || []);
        setExternalProfiles(profilesData.external_profiles || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <section className="section-space">
      <div className="container-shell space-y-12">
        <SectionHeading
          eyebrow="About"
          title="Academic Leadership & Professional Practice"
          description="Dr. Stephen Asatsa combines academic excellence with clinical expertise, leading research in cultural psychology while providing evidence-based mental health services."
        />

        {/* Research Overview */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {researchHighlights.map((item) => (
            <Card key={item.label} className="flex items-center gap-4 p-6 hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
                <p className="text-sm font-medium text-primary">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-8">
          <Card className="p-8 sm:p-10">
            <div className="prose-copy">
              {siteContent.aboutFull.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Research Interests */}
            <Card className="p-7">
              <h3 className="font-display text-3xl mb-4">Research Interests</h3>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : researchInterests.length > 0 ? (
                <div className="space-y-3">
                  {researchInterests.map((interest) => {
                    const colors = getColorClasses(interest.color);
                    const Icon = iconMap[interest.icon] || Brain;
                    return (
                      <div key={interest.id} className={`flex items-start gap-3 p-3 rounded-lg ${colors.bg} border ${colors.border} hover:scale-[1.02] transition-transform`}>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.iconBg} text-white flex-shrink-0`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className={`font-medium ${colors.text}`}>{interest.title}</p>
                          {interest.description && <p className={`text-sm ${colors.subtext}`}>{interest.description}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                  <li>Indigenous knowledge systems</li>
                  <li>Decolonization of psychology</li>
                  <li>Thanatology</li>
                  <li>Cultural evolution</li>
                  <li>Indigenization of psychological practice</li></ul>
              )}
            </Card>

            {/* Awards */}
            <Card className="p-7">
              <h3 className="font-display text-3xl mb-4">Honors and Awards</h3>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : awards.length > 0 ? (
                <div className="space-y-3">
                  {awards.map((award) => {
                    const colors = getColorClasses(award.color);
                    const Icon = iconMap[award.icon] || Trophy;
                    return (
                      <div key={award.id} className={`flex items-start gap-3 p-3 rounded-lg ${colors.bg} border ${colors.border} hover:scale-[1.02] transition-transform`}>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.iconBg} text-white flex-shrink-0`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium ${colors.text}`}>{award.title}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${colors.iconBg} text-white`}>{award.year}</span>
                          </div>
                          {award.organization && <p className={`text-sm ${colors.subtext}`}>{award.organization}</p>}
                          {award.description && <p className={`text-sm ${colors.subtext}`}>{award.description}</p>}
                          {award.url && (
                            <Link href={award.url} target="_blank" rel="noopener noreferrer" className={`text-sm ${colors.subtext} hover:underline flex items-center gap-1 mt-1`}>
                              View <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                  {siteContent.awards.map((award) => (
                    <li key={`${award.title}-${award.year}`}>
                      <span className="font-semibold text-foreground">{award.year}</span> • {award.title}
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
              )}
            </Card>

            {/* External Profiles */}
            <Card className="p-7 lg:col-span-2">
              <h3 className="font-display text-3xl mb-4">Professional Networks & Profiles</h3>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : externalProfiles.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {externalProfiles.map((profile) => {
                    const colors = getColorClasses(profile.color);
                    const Icon = iconMap[profile.icon] || Globe;
                    return (
                      <Link
                        key={profile.id}
                        href={profile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block p-4 rounded-lg ${colors.bg} border ${colors.border} hover:scale-[1.02] hover:shadow-lg ${colors.hover} transition-all`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.iconBg} text-white flex-shrink-0`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold ${colors.text} truncate`}>{profile.label}</p>
                            {profile.platform && <p className={`text-xs ${colors.subtext}`}>{profile.platform}</p>}
                            <p className={`text-sm ${colors.subtext} line-clamp-2 mt-1`}>{profile.description}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <ul className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
                  {siteContent.externalProfiles.map((profile) => (
                    <li key={profile.label}>
                      <Link href={profile.href} className="font-semibold text-foreground underline-offset-4 hover:underline">
                        {profile.label}
                      </Link>
                      <p>{profile.description}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

