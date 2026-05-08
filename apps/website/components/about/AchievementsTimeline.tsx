"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Award, Trophy, Crown, Medal, Star, Calendar, Building, Users } from "lucide-react";
import { Award as AwardType } from "./types";

interface AchievementsTimelineProps {
  awards: AwardType[];
  loading: boolean;
}

const iconMap: Record<string, any> = {
  Award,
  Trophy,
  Crown,
  Medal,
  Star,
  Calendar,
  Building,
  Users,
};

const getColorClasses = (color: string) => {
  const colors: Record<string, any> = {
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-200 dark:border-emerald-700",
      dot: "bg-emerald-500",
      text: "text-emerald-900 dark:text-emerald-100",
      subtext: "text-emerald-700 dark:text-emerald-300",
      line: "bg-emerald-200 dark:bg-emerald-700",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-700",
      dot: "bg-green-500",
      text: "text-green-900 dark:text-green-100",
      subtext: "text-green-700 dark:text-green-300",
      line: "bg-green-200 dark:bg-green-700",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-700",
      dot: "bg-blue-500",
      text: "text-blue-900 dark:text-blue-100",
      subtext: "text-blue-700 dark:text-blue-300",
      line: "bg-blue-200 dark:bg-blue-700",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-200 dark:border-purple-700",
      dot: "bg-purple-500",
      text: "text-purple-900 dark:text-purple-100",
      subtext: "text-purple-700 dark:text-purple-300",
      line: "bg-purple-200 dark:bg-purple-700",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-200 dark:border-orange-700",
      dot: "bg-orange-500",
      text: "text-orange-900 dark:text-orange-100",
      subtext: "text-orange-700 dark:text-orange-300",
      line: "bg-orange-200 dark:bg-orange-700",
    },
  };
  return colors[color] || colors.emerald;
};

export function AchievementsTimeline({ awards, loading }: AchievementsTimelineProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  if (loading) {
    return (
      <section className="section-space bg-white dark:bg-slate-900">
        <div className="container-shell">
          <div className="text-center">
            <p className="text-muted-foreground">Loading achievements...</p>
          </div>
        </div>
      </section>
    );
  }

  if (awards.length === 0) {
    return (
      <section className="section-space bg-white dark:bg-slate-900">
        <div className="container-shell">
          <div className="text-center">
            <p className="text-muted-foreground">No achievements available at this time.</p>
          </div>
        </div>
      </section>
    );
  }

  // Sort awards by year (newest first)
  const sortedAwards = [...awards].sort((a, b) => b.year - a.year);

  return (
    <motion.section
      ref={ref}
      className="section-space bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:via-slate-800/50 dark:to-blue-900/10"
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
              Academic Leadership & Achievements
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              A timeline of significant milestones, awards, and leadership roles in academia and research
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative max-w-4xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary/20" />

            {/* Timeline items */}
            <motion.div
              className="space-y-12"
              variants={containerVariants}
            >
              {sortedAwards.map((award, index) => {
                const colors = getColorClasses(award.color);
                const Icon = iconMap[award.icon] || Award;
                
                return (
                  <motion.div
                    key={award.id}
                    className="relative flex items-start space-x-8"
                    variants={itemVariants}
                  >
                    {/* Timeline dot */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-16 h-16 rounded-full ${colors.dot} flex items-center justify-center text-white shadow-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      {/* Year badge */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
                          {award.year}
                        </span>
                      </div>
                    </div>

                    {/* Content card */}
                    <motion.div
                      className={`flex-1 p-6 rounded-2xl border ${colors.bg} ${colors.border} hover:shadow-lg transition-shadow duration-300`}
                      whileHover={{ x: 5, transition: { duration: 0.2 } }}
                    >
                      <div className="space-y-3">
                        <h3 className={`font-semibold text-xl ${colors.text}`}>
                          {award.title}
                        </h3>
                        
                        {award.organization && (
                          <p className={`text-sm font-medium ${colors.subtext} flex items-center gap-2`}>
                            <Building className="w-4 h-4" />
                            {award.organization}
                          </p>
                        )}
                        
                        {award.description && (
                          <p className={`text-sm leading-relaxed ${colors.subtext}`}>
                            {award.description}
                          </p>
                        )}
                        
                        {award.url && (
                          <a
                            href={award.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 text-sm ${colors.text} hover:underline transition-colors`}
                          >
                            Learn more
                            <Award className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
