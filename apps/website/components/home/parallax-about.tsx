"use client";

import Image from "next/image";
import { siteContent } from "@/lib/content/site-content";
import { useState, useEffect } from "react";

interface AboutContent {
  aboutFull: string[];
  quote: {
    text: string;
    author: string;
  };
}

export function ParallaxAboutSection() {
  const [aboutContent, setAboutContent] = useState<AboutContent>({
    aboutFull: siteContent.aboutFull,
    quote: siteContent.quote
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/about")
      .then(res => res.json())
      .then(data => {
        if (data.aboutFull || data.quote) {
          setAboutContent({
            aboutFull: data.aboutFull || siteContent.aboutFull,
            quote: data.quote || siteContent.quote
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="who-we-are" className="py-20 overflow-hidden">
        <div className="container-shell">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            <div className="relative">
              <div className="animate-pulse bg-gray-200 rounded-3xl h-96"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="who-we-are" className="py-20 overflow-hidden">
      <div className="container-shell">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="font-display text-4xl">Who We Are</h2>

            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {aboutContent.aboutFull.map((paragraph, index) => (
                <p key={index}>
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="pt-4">
              <blockquote className="border-l-4 border-accent pl-6 italic text-accent">
                <p className="text-lg mb-2">"{aboutContent.quote.text}"</p>
                <cite className="text-sm font-medium">{aboutContent.quote.author}</cite>
              </blockquote>
            </div>
          </div>

          <div className="relative">
            <div className="relative">
              <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-accent/10" />
              <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-accent/5" />

              <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-white p-4 shadow-soft">
                <Image
                  src="/assets/people/asatsa.webp"
                  alt="Dr. Stephen Asatsa"
                  width={600}
                  height={800}
                  sizes="(max-width: 1024px) 100vw, 38vw"
                  className="w-full rounded-2xl object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
