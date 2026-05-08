"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { StatCounter } from "./types";

interface AboutHeroProps {
  portraitSrc: string;
  stats: StatCounter[];
}

export function AboutHero({ portraitSrc, stats }: AboutHeroProps) {
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

  const statVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <motion.section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-teal-900/20"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid opacity-5 dark:opacity-10" />
      
      <div className="container-shell section-space">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Text Content */}
          <motion.div
            className="space-y-8"
            variants={itemVariants}
          >
            <div className="space-y-4">
              <motion.h1 
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground dark:text-white"
                variants={itemVariants}
              >
                Dr. Stephen Asatsa
              </motion.h1>
              <motion.p 
                className="text-xl sm:text-2xl font-semibold text-primary dark:text-primary/90"
                variants={itemVariants}
              >
                Senior Lecturer & Head of Psychology Department
              </motion.p>
              <motion.p 
                className="text-lg text-muted-foreground italic"
                variants={itemVariants}
              >
                Catholic University of Eastern Africa
              </motion.p>
            </div>

            <motion.p 
              className="text-lg leading-relaxed text-muted-foreground max-w-xl"
              variants={itemVariants}
            >
              Leading research in indigenous knowledge systems and cultural psychology 
              while advancing mental health services across Africa.
            </motion.p>

            {/* Stats Grid */}
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6"
              variants={itemVariants}
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={statVariants}
                  className="text-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-border/50 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-primary dark:text-primary/90 mb-1">
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-foreground dark:text-white/90">
                    {stat.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    {stat.description}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Portrait */}
          <motion.div
            className="relative order-first lg:order-last"
            variants={itemVariants}
          >
            <div className="relative aspect-square lg:aspect-[3/4] max-w-md mx-auto lg:max-w-none">
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl transform rotate-3" />
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-3xl transform -rotate-3" />
              
              {/* Image container */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                <Image
                  src={portraitSrc}
                  alt="Dr. Stephen Asatsa"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
