"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CalendarDays, ChevronDown, Download, ExternalLink, Mail, PhoneCall } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteContent } from "@/lib/content/site-content";
import { siteConfig } from "@/lib/site";
import { useHomepageContent } from "@/hooks/use-homepage-content";

export function InteractiveHeroSection() {
  const { content: heroData, loading } = useHomepageContent('hero');

  const headline = heroData?.headline || siteContent.hero.headline;
  const ctaText = heroData?.cta_text || siteContent.hero.primaryCta.label;
  const ctaUrl = heroData?.cta_url || siteContent.contact.bookingUrl;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8f3ea_0%,#fcfaf6_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(180,140,92,0.10),transparent_28%)]" />

      <div className="container-shell relative z-10 py-16 sm:py-20 lg:py-24 space-y-8 lg:space-y-10">
            {/* Headline + Image row */}
            <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
              {/* Headline */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <h1 className="font-display text-4xl leading-[0.95] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent sm:text-5xl lg:text-6xl xl:text-7xl font-bold">
                  {headline}
                </h1>
              </div>
              
              {/* Image beside headline */}
              <div className="relative order-first lg:order-last animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
                <div className="relative">
                  {/* Background glow effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 rounded-[32px] blur-2xl opacity-60" />
                  
                  {/* Main image container */}
                  <div className="relative overflow-hidden rounded-[32px] border border-white/20 bg-white/10 backdrop-blur-sm shadow-[0_25px_50px_rgba(16,185,129,0.15)]">
                    <div className="relative aspect-[3/4] lg:aspect-[4/5]">
                      <Image
                        src={heroData?.background_image_url || "/assets/people/hero.webp"}
                        alt="Dr. Stephen Asatsa"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                        className="object-cover object-top"
                        priority
                      />
                    </div>
                  </div>
                  
                  {/* Floating badges */}
                  <div className="absolute -top-4 -right-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-3 shadow-lg animate-bounce">
                    <BadgeCheck className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="absolute -bottom-4 -left-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-3 shadow-lg animate-pulse">
                    <PhoneCall className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <p className="max-w-2xl text-lg leading-relaxed text-slate-600">
                {heroData?.tagline || 'Senior Lecturer, licensed psychologist, and research leader advancing culturally grounded psychological science.'}
              </p>
            </div>

            {/* Call to action buttons */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
                >
                  <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
                    <CalendarDays className="mr-2 h-5 w-5" />
                    {ctaText}
                  </a>
                </Button>
                
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline"
                  className="border-slate-300 hover:bg-slate-50 text-slate-700"
                >
                  <Link href="/contact">
                    Contact
                  </Link>
                </Button>
              </div>
            </div>

      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground">
        <div className="flex animate-[bounce_2s_ease-in-out_infinite] flex-col items-center gap-2">
          <span className="text-xs font-medium">Scroll to explore</span>
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
    </section>
  );
}
