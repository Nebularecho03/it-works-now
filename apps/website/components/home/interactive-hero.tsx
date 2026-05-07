"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CalendarDays, ChevronDown, Download, ExternalLink, Mail, PhoneCall, Play, Video, MessageCircle, Star, ArrowRight } from "lucide-react";

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
      {/* Clean artistic background */}
      <div className="absolute inset-0">
        {/* Main gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(180,140,92,0.10),transparent_28%)]" />
        
        {/* Subtle artistic accent */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse animation-delay-2000" />
      </div>

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
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
                Ready to partner with institutions, families, and research communities to strengthen mental health, cultural resilience, and scholarly impact.
              </p>
            </div>

            {/* Call to action buttons */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 group"
                >
                  <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CalendarDays className="mr-2 h-5 w-5 relative z-10" />
                    <span className="relative z-10">{ctaText}</span>
                    <ArrowRight className="ml-2 h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                  </a>
                </Button>
                
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-gradient-to-r from-rose-400 to-pink-600 bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 text-rose-700 hover:text-rose-800 shadow-lg hover:shadow-rose-500/20 transition-all duration-300 hover:scale-105 hover:border-rose-400"
                >
                  <Link href="/contact" className="group">
                    <MessageCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    Contact
                  </Link>
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button 
                  asChild 
                  size="sm" 
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105 group"
                >
                  <a href={heroData?.downloadCvUrl || '/Stephen_Asatsa-CV-2025.pdf'} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                    Download CV
                  </a>
                </Button>

                <Button 
                  asChild 
                  size="sm" 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105 group"
                >
                  <Link href={heroData?.researchLabUrl || '/research-hub'}>
                    <ExternalLink className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                    Research Lab
                  </Link>
                </Button>

                <Button 
                  asChild 
                  size="sm" 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 group"
                >
                  <Link href="/about">
                    <Star className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                    About Me
                  </Link>
                </Button>

                <Button 
                  asChild 
                  size="sm" 
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105 group"
                >
                  <Link href="/services">
                    <PhoneCall className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                    Services
                  </Link>
                </Button>

                <Button 
                  asChild 
                  size="sm" 
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 group"
                >
                  <a href="https://beautifulmind.cc/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                    BeautifulMind
                  </a>
                </Button>
              </div>

              {/* Professional organizations row */}
              <div className="mt-4 flex flex-wrap gap-3">
                <Button 
                  asChild 
                  size="sm" 
                  variant="outline"
                  className="border-2 border-blue-300 hover:border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 shadow-md hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 group"
                >
                  <a href="https://www.srcd.org/about-us/who-we-are/governing-council" target="_blank" rel="noopener noreferrer">
                    <Star className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                    SRCD Council
                  </a>
                </Button>

                <Button 
                  asChild 
                  size="sm" 
                  variant="outline"
                  className="border-2 border-green-300 hover:border-green-500 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 shadow-md hover:shadow-green-500/20 transition-all duration-300 hover:scale-105 group"
                >
                  <a href="https://eapp.org/organization/regional-promoters/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                    EAPP Africa
                  </a>
                </Button>

                <Button 
                  asChild 
                  size="sm" 
                  variant="outline"
                  className="border-2 border-purple-300 hover:border-purple-500 bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 shadow-md hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 group"
                >
                  <a href="https://issbd.org/publications-2/" target="_blank" rel="noopener noreferrer">
                    <Video className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                    ISSBD
                  </a>
                </Button>

                <Button 
                  asChild 
                  size="sm" 
                  variant="outline"
                  className="border-2 border-orange-300 hover:border-orange-500 bg-orange-50 hover:bg-orange-100 text-orange-700 hover:text-orange-800 shadow-md hover:shadow-orange-500/20 transition-all duration-300 hover:scale-105 group"
                >
                  <a href="https://loop.frontiersin.org/people/828729/editorial" target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                    Frontiers Editor
                  </a>
                </Button>
              </div>

              {/* Additional interactive buttons row */}
              <div className="mt-4 flex flex-wrap gap-3">
                <Button 
                  asChild 
                  size="sm" 
                  variant="outline"
                  className="border-2 border-indigo-300 hover:border-indigo-500 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 shadow-md hover:shadow-indigo-500/20 transition-all duration-300 hover:scale-105 group"
                >
                  <Link href="/research">
                    <Video className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                    Research Papers
                  </Link>
                </Button>

                <Button 
                  asChild 
                  size="sm" 
                  variant="outline"
                  className="border-2 border-green-300 hover:border-green-500 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 shadow-md hover:shadow-green-500/20 transition-all duration-300 hover:scale-105 group"
                >
                  <Link href="/gallery">
                    <Play className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                    Media Gallery
                  </Link>
                </Button>

                <Button 
                  asChild 
                  size="sm" 
                  variant="outline"
                  className="border-2 border-purple-300 hover:border-purple-500 bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 shadow-md hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 group"
                >
                  <a href="mailto:stephen.asatsa@university.edu" className="group">
                    <Mail className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                    Quick Email
                  </a>
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
