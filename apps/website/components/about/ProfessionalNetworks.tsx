"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Globe, Linkedin, Twitter, Facebook, Instagram, Github, Youtube, ExternalLink, Award, BookOpen } from "lucide-react";
import { ExternalProfile } from "./types";

interface ProfessionalNetworksProps {
  profiles: ExternalProfile[];
  loading: boolean;
}

const iconMap: Record<string, any> = {
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Github,
  Youtube,
  ExternalLink,
  Award,
  BookOpen,
};

const getPlatformColors = (platform: string) => {
  const platforms: Record<string, any> = {
    "Google Scholar": {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
      border: "border-blue-200 dark:border-blue-700",
      iconBg: "bg-blue-500",
      hover: "hover:shadow-blue-500/25 hover:border-blue-300/70",
      text: "text-blue-900 dark:text-blue-100",
      subtext: "text-blue-700 dark:text-blue-300",
    },
    "LinkedIn": {
      bg: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
      border: "border-blue-200 dark:border-blue-700",
      iconBg: "bg-blue-600",
      hover: "hover:shadow-blue-600/25 hover:border-blue-300/70",
      text: "text-blue-900 dark:text-blue-100",
      subtext: "text-blue-700 dark:text-blue-300",
    },
    "ResearchGate": {
      bg: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      border: "border-green-200 dark:border-green-700",
      iconBg: "bg-green-600",
      hover: "hover:shadow-green-600/25 hover:border-green-300/70",
      text: "text-green-900 dark:text-green-100",
      subtext: "text-green-700 dark:text-green-300",
    },
    "ORCID": {
      bg: "bg-gradient-to-br from-emerald-50 to-lime-50 dark:from-emerald-900/20 dark:to-lime-900/20",
      border: "border-emerald-200 dark:border-emerald-700",
      iconBg: "bg-emerald-600",
      hover: "hover:shadow-emerald-600/25 hover:border-emerald-300/70",
      text: "text-emerald-900 dark:text-emerald-100",
      subtext: "text-emerald-700 dark:text-emerald-300",
    },
    "BeautifulMind Consultants": {
      bg: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
      border: "border-purple-200 dark:border-purple-700",
      iconBg: "bg-purple-600",
      hover: "hover:shadow-purple-600/25 hover:border-purple-300/70",
      text: "text-purple-900 dark:text-purple-100",
      subtext: "text-purple-700 dark:text-purple-300",
    },
  };
  return platforms[platform] || platforms["Google Scholar"];
};

export function ProfessionalNetworks({ profiles, loading }: ProfessionalNetworksProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  if (loading) {
    return (
      <section className="section-space bg-slate-50 dark:bg-slate-800/50">
        <div className="container-shell">
          <div className="text-center">
            <p className="text-muted-foreground">Loading professional networks...</p>
          </div>
        </div>
      </section>
    );
  }

  if (profiles.length === 0) {
    return (
      <section className="section-space bg-slate-50 dark:bg-slate-800/50">
        <div className="container-shell">
          <div className="text-center">
            <p className="text-muted-foreground">No professional networks available at this time.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      ref={ref}
      className="section-space bg-gradient-to-br from-white via-slate-50/50 to-teal-50/30 dark:from-slate-900 dark:via-slate-800/50 dark:to-teal-900/10"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <div className="container-shell">
        <div className="space-y-12">
          {/* Section Header */}
          <motion.div
            className="text-center space-y-4"
            variants={itemVariants}
          >
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground dark:text-white">
              Professional Networks & Profiles
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Connect and explore Dr. Asatsa's academic contributions across various professional platforms
            </p>
          </motion.div>

          {/* Networks Grid */}
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            variants={containerVariants}
          >
            {profiles.map((profile) => {
              const colors = getPlatformColors(profile.platform);
              const Icon = iconMap[profile.icon] || Globe;
              
              return (
                <motion.a
                  key={profile.id}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group block p-6 rounded-2xl border ${colors.bg} ${colors.border} ${colors.hover} transition-all duration-300 text-decoration-none`}
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="space-y-4">
                    {/* Icon */}
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${colors.iconBg} text-white group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className={`font-semibold text-lg ${colors.text} group-hover:underline`}>
                        {profile.label}
                      </h3>
                      <p className={`text-sm font-medium ${colors.subtext}`}>
                        {profile.platform}
                      </p>
                      <p className={`text-sm leading-relaxed ${colors.subtext} line-clamp-3`}>
                        {profile.description}
                      </p>
                    </div>
                    
                    {/* External link indicator */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ExternalLink className="w-3 h-3" />
                      <span>Visit profile</span>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className={`absolute top-4 right-4 w-16 h-16 ${colors.iconBg} opacity-5 rounded-full blur-xl`} />
                </motion.a>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
