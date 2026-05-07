"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/layout/section-heading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, Users, Award } from "lucide-react";
import Image from "next/image";

export function EnhancedCaseStudies() {
  const caseStudies = [
    {
      title: "Cultural Adaptation Research",
      client: "University Research Partnership",
      description: "Groundbreaking study on Luhya traditional mourning rituals and their psychological significance in modern mental health practice.",
      metrics: [
        { label: "Publications Generated", value: "8 peer-reviewed papers" },
        { label: "Research Funding", value: "$150K secured" },
        { label: "Student Impact", value: "50+ graduate students mentored" }
      ],
      tags: ["Cultural Psychology", "Research", "Academic Partnership"]
    },
    {
      title: "Community Mental Health Initiative",
      client: "County Health Department",
      description: "Collaborative program implementing culturally sensitive mental health services in underserved communities.",
      metrics: [
        { label: "Community Reach", value: "5,000+ residents" },
        { label: "Service Improvement", value: "40% increase in access" },
        { label: "Training Programs", value: "12 workshops conducted" }
      ],
      tags: ["Community Psychology", "Public Health", "Training"]
    },
    {
      title: "Academic Curriculum Development",
      client: "Catholic University of Eastern Africa",
      description: "Development of decolonized psychology curriculum integrating African indigenous knowledge systems with Western psychological frameworks.",
      metrics: [
        { label: "Curriculum Modules", value: "15 new courses" },
        { label: "Student Engagement", value: "25% increase in participation" },
        { label: "Faculty Adoption", value: "90% implementation rate" }
      ],
      tags: ["Education", "Curriculum Design", "Decolonization"]
    }
  ];

  return (
    <section className="section-space">
      <div className="container-shell space-y-12">
        <SectionHeading
          eyebrow="Case Studies"
          title="Real Impact Through Applied Research"
          description="Documented outcomes from academic partnerships and community interventions demonstrating measurable results."
        />
        <div className="space-y-8">
          {caseStudies.map((study, index) => (
            <motion.div
              key={study.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 p-8">
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {study.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-display text-2xl mb-4">{study.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{study.description}</p>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Measurable Results
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {study.metrics.map((metric) => (
                        <div key={metric.label} className="text-center p-4 bg-muted/30 rounded-lg">
                          <div className="text-2xl font-bold text-primary mb-1">{metric.value}</div>
                          <div className="text-sm font-medium text-muted-foreground">{metric.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button asChild variant="outline" className="w-full">
                      <a href="/contact" className="flex items-center justify-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Discuss Similar Project
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
