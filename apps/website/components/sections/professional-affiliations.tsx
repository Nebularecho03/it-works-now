"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, BookOpen, Network, Heart, Award, Users, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ProfessionalAffiliations() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const keyAffiliations = [
    {
      title: "Citation Profile & Academic Outputs",
      description: "Persistent researcher identity and scholarly record with indexed publications and citations.",
      icon: BookOpen,
      url: "https://scholar.google.com/citations?user=nBzSCvUAAAAJ&hl=en",
      color: "blue",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "Research Network & Projects",
      description: "Research network profile showcasing project visibility and collaborative research initiatives.",
      icon: Network,
      url: "https://www.researchgate.net/profile/Stephen-Asatsa",
      color: "emerald",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      title: "Mental Health Social Enterprise",
      description: "BeautifulMind Consultants - Kenyan mental health social enterprise co-founded by Dr. Asatsa.",
      icon: Heart,
      url: "https://beautifulmind.cc/",
      color: "rose",
      gradient: "from-rose-500 to-pink-600"
    }
  ];

  const additionalOrganizations = [
    {
      name: "Society for Research in Child Development",
      role: "Governing Council Member",
      icon: Users,
      url: "https://www.srcd.org/about-us/who-we-are/governing-council"
    },
    {
      name: "European Association of Personality Psychology",
      role: "Africa Regional Representative",
      icon: Globe,
      url: "https://eapp.org/organization/regional-promoters/"
    },
    {
      name: "International Society for Study of Behavioral Development",
      role: "E-newsletter Editor",
      icon: BookOpen,
      url: "https://issbd.org/publications-2/"
    },
    {
      name: "Frontiers in Psychology",
      role: "Review Editor",
      icon: Award,
      url: "https://loop.frontiersin.org/people/828729/editorial"
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container-shell">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Award className="h-4 w-4" />
            Professional Affiliations
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Global Leadership in Psychology
          </h2>

          <p className="text-lg text-muted-foreground leading-8 max-w-3xl mx-auto">
            Active involvement in leading psychological and academic organizations worldwide,
            contributing to research, education, and mental health advocacy.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200/50">
            <p className="text-sm text-emerald-800 font-medium">
              Persistent researcher identity and scholarly record driving evidence-based psychological practice.
            </p>
          </div>
        </div>

        {/* Key Affiliations Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {keyAffiliations.map((affiliation, index) => {
            const Icon = affiliation.icon;

            return (
              <Card
                key={index}
                className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50/50 p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Background gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${affiliation.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                <div className="relative z-10">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className={`h-8 w-8 text-${affiliation.color}-600`} />
                  </div>

                  <h3 className="font-bold text-xl text-foreground mb-3 group-hover:text-primary transition-colors">
                    {affiliation.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {affiliation.description}
                  </p>

                  <Button
                    asChild
                    className={`w-full bg-gradient-to-r ${affiliation.gradient} hover:opacity-90 text-white border-0 transition-all duration-300 group-hover:shadow-lg`}
                  >
                    <a
                      href={affiliation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit Organization
                    </a>
                  </Button>
                </div>

                {/* Floating particles effect */}
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary/20 animate-pulse" />
                <div className="absolute bottom-4 left-4 w-1 h-1 rounded-full bg-primary/30 animate-pulse delay-1000" />
              </Card>
            );
          })}
        </div>

        {/* Additional Organizations */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">
              Additional Professional Engagements
            </h3>
            <p className="text-muted-foreground">
              Contributing to global psychological science through leadership and editorial roles
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {additionalOrganizations.map((org, index) => {
              const Icon = org.icon;
              return (
                <div
                  key={index}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:shadow-md transition-all duration-300"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {org.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {org.role}
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <a
                      href={org.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex -space-x-2">
              <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse delay-200" />
              <div className="h-3 w-3 rounded-full bg-rose-500 animate-pulse delay-400" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Advancing psychological science through global collaboration and leadership
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
