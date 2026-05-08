"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Mail, Phone, MapPin, Calendar, ArrowRight } from "lucide-react";

interface CallToActionProps {
  contactInfo?: {
    email: string;
    phone: string;
    location: string;
  };
}

export function CallToAction({ contactInfo }: CallToActionProps) {
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
        duration: 0.6,
      },
    },
  };

  const defaultContact = {
    email: "hello@stephenasatsa.com",
    phone: "+254 770 140 889",
    location: "Karen, Nairobi",
  };

  const contact = contactInfo || defaultContact;

  return (
    <motion.section
      ref={ref}
      className="section-space bg-gradient-to-br from-primary via-primary/90 to-accent dark:from-slate-900 dark:via-primary/95 dark:to-accent/95 text-white"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <div className="container-shell">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Section Header */}
          <motion.div
            className="text-center space-y-6"
            variants={itemVariants}
          >
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Let's Connect
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Whether you're interested in research collaboration, clinical consultation, or academic partnerships, 
              I'm here to explore how we can work together to advance mental health services in Africa.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={itemVariants}
          >
            <motion.a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-all duration-300 group"
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.95 }}
            >
              <Calendar className="w-5 h-5" />
              Book Consultation
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.a>
            
            <motion.a
              href={`tel:${contact.phone}`}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300"
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.95 }}
            >
              <Phone className="w-5 h-5" />
              Call Now
            </motion.a>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            className="grid gap-8 sm:grid-cols-3 pt-8 border-t border-white/20"
            variants={containerVariants}
          >
            <motion.div
              className="text-center space-y-3"
              variants={itemVariants}
            >
              <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Email</h3>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-white/90 hover:text-white transition-colors"
                >
                  {contact.email}
                </a>
              </div>
            </motion.div>

            <motion.div
              className="text-center space-y-3"
              variants={itemVariants}
            >
              <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Phone</h3>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-white/90 hover:text-white transition-colors"
                >
                  {contact.phone}
                </a>
              </div>
            </motion.div>

            <motion.div
              className="text-center space-y-3"
              variants={itemVariants}
            >
              <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Location</h3>
                <p className="text-white/90">
                  {contact.location}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
