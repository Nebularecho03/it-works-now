"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { AboutContent } from "./types";

interface ProfessionalBioProps {
  content: AboutContent | null;
}

export function ProfessionalBio({ content }: ProfessionalBioProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.3,
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

  if (!content) {
    return (
      <section className="section-space">
        <div className="container-shell">
          <div className="text-center">
            <p className="text-muted-foreground">Loading biography...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      ref={ref}
      className="section-space bg-white dark:bg-slate-900"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <div className="container-shell">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Section Header */}
          <motion.div
            className="text-center space-y-4"
            variants={itemVariants}
          >
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground dark:text-white">
              Professional Biography
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A journey dedicated to advancing psychological science and mental health services in Africa
            </p>
          </motion.div>

          {/* Biography Content */}
          <motion.div
            className="prose prose-lg max-w-none dark:prose-invert space-y-6"
            variants={itemVariants}
          >
            {content.aboutFull.map((paragraph, index) => (
              <motion.p
                key={index}
                className="text-lg leading-relaxed text-muted-foreground dark:text-slate-300"
                variants={itemVariants}
              >
                {paragraph}
              </motion.p>
            ))}
          </motion.div>

          {/* Quote Section */}
          {content.quote && (
            <motion.div
              className="relative bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 rounded-2xl p-8 md:p-12 border-l-4 border-primary dark:border-primary/50"
              variants={itemVariants}
            >
              <div className="relative z-10">
                <blockquote className="text-xl md:text-2xl font-medium text-foreground dark:text-white italic mb-4">
                  "{content.quote.text}"
                </blockquote>
                <cite className="text-sm font-semibold text-primary dark:text-primary/90">
                  — {content.quote.author}
                </cite>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 text-6xl text-primary/10 dark:text-primary/20 font-serif">
                "
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
