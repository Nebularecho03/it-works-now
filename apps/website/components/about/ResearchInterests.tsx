"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Globe, Heart, Lightbulb, Microscope, Award, Trophy, Crown, Gem } from "lucide-react";
import { ResearchInterest } from "./types";

interface ResearchInterestsProps {
  interests: ResearchInterest[];
  loading: boolean;
}

const iconMap: Record<string, any> = {
  Brain,
  Globe,
  Heart,
  Lightbulb,
  Microscope,
  Award,
  Trophy,
  Crown,
  Gem,
};

const getColorClasses = (color: string) => {
  const colors: Record<string, any> = {
    emerald: {
      bg: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
      border: "border-emerald-200/50 dark:border-emerald-700/50",
      iconBg: "bg-emerald-500",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      text: "text-emerald-900 dark:text-emerald-100",
      subtext: "text-emerald-700 dark:text-emerald-300",
      hover: "hover:shadow-emerald-500/25 hover:border-emerald-300/70",
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      border: "border-green-200/50 dark:border-green-700/50",
      iconBg: "bg-green-500",
      iconColor: "text-green-600 dark:text-green-400",
      text: "text-green-900 dark:text-green-100",
      subtext: "text-green-700 dark:text-green-300",
      hover: "hover:shadow-green-500/25 hover:border-green-300/70",
    },
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
      border: "border-blue-200/50 dark:border-blue-700/50",
      iconBg: "bg-blue-500",
      iconColor: "text-blue-600 dark:text-blue-400",
      text: "text-blue-900 dark:text-blue-100",
      subtext: "text-blue-700 dark:text-blue-300",
      hover: "hover:shadow-blue-500/25 hover:border-blue-300/70",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
      border: "border-purple-200/50 dark:border-purple-700/50",
      iconBg: "bg-purple-500",
      iconColor: "text-purple-600 dark:text-purple-400",
      text: "text-purple-900 dark:text-purple-100",
      subtext: "text-purple-700 dark:text-purple-300",
      hover: "hover:shadow-purple-500/25 hover:border-purple-300/70",
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
      border: "border-orange-200/50 dark:border-orange-700/50",
      iconBg: "bg-orange-500",
      iconColor: "text-orange-600 dark:text-orange-400",
      text: "text-orange-900 dark:text-orange-100",
      subtext: "text-orange-700 dark:text-orange-300",
      hover: "hover:shadow-orange-500/25 hover:border-orange-300/70",
    },
  };
  return colors[color] || colors.emerald;
};

export function ResearchInterests({ interests, loading }: ResearchInterestsProps) {
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
            <p className="text-muted-foreground">Loading research interests...</p>
          </div>
        </div>
      </section>
    );
  }

  if (interests.length === 0) {
    return (
      <section className="section-space bg-slate-50 dark:bg-slate-800/50">
        <div className="container-shell">
          <div className="text-center">
            <p className="text-muted-foreground">No research interests available at this time.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      ref={ref}
      className="section-space bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/50 dark:from-slate-900 dark:via-blue-900/10 dark:to-teal-900/10"
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
              Research Interests & Expertise
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Exploring the intersection of indigenous knowledge, cultural psychology, and mental health practice in African contexts
            </p>
          </motion.div>

          {/* Research Interests Grid */}
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
          >
            {interests.map((interest) => {
              const colors = getColorClasses(interest.color);
              const Icon = iconMap[interest.icon] || Brain;
              
              return (
                <motion.div
                  key={interest.id}
                  className={`group relative p-6 rounded-2xl border ${colors.bg} ${colors.border} ${colors.hover} transition-all duration-300 cursor-pointer`}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  {/* Icon */}
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${colors.iconBg} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  {/* Content */}
                  <h3 className={`font-semibold text-xl mb-3 ${colors.text}`}>
                    {interest.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${colors.subtext}`}>
                    {interest.description}
                  </p>
                  
                  {/* Decorative element */}
                  <div className={`absolute top-4 right-4 w-20 h-20 ${colors.iconBg} opacity-5 rounded-full blur-xl`} />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
