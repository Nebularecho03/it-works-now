"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Calendar, ShieldCheck, GraduationCap, Building2, Facebook, Twitter, Instagram, Linkedin, ExternalLink, ArrowUp, Copy, Check, Users, FileText, Award, BookOpen, MessageCircle } from "lucide-react";

import { siteContent } from "@/lib/content/site-content";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [researchStats, setResearchStats] = useState({
    publications: 0,
    projects: 0,
    collaborators: 0
  });
  const [mobileSection, setMobileSection] = useState<string | null>(null);

  // Fetch research stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Mock stats for now - replace with actual API call
        setResearchStats({
          publications: 48,
          projects: 12,
          collaborators: 8
        });
      } catch (error) {
        console.error('Failed to fetch research stats:', error);
      }
    };
    fetchStats();
  }, []);

  const copyToClipboard = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPhone(text);
      setTimeout(() => setCopiedPhone(null), 2000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMobileSection = (section: string) => {
    setMobileSection(mobileSection === section ? null : section);
  };

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
      </div>
      
      <div className="container-shell relative z-10 py-10 md:py-14">
        {/* ROW 1 - Primary Footer */}
        <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
          
          {/* LEFT SECTION - Brand Identity */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-white">
                Dr. Stephen Asatsa
              </h2>
              <div className="h-0.5 w-16 bg-emerald-500/50 rounded-full" />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Psychologist • Research Leader • Mental Health Advocate
            </p>
            <Link 
              href={siteContent.contact.bookingUrl} 
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-600/25"
            >
              <Calendar className="w-4 h-4" />
              Book Consultation
            </Link>
          </div>

          {/* CENTER SECTION - Smart Navigation */}
          <div className="space-y-4">
            {/* Mobile Accordion Header */}
            <button
              onClick={() => toggleMobileSection('navigation')}
              className="md:hidden flex items-center justify-between w-full font-semibold text-sm uppercase tracking-wider text-slate-400 hover:text-emerald-400 transition-colors"
              aria-expanded={mobileSection === 'navigation'}
              aria-controls="navigation-content"
            >
              <span>Explore</span>
              <ArrowUp className={`w-4 h-4 transition-transform duration-200 ${mobileSection === 'navigation' ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Desktop Header */}
            <h3 className="hidden md:block font-semibold text-sm uppercase tracking-wider text-slate-400">Explore</h3>
            
            {/* Navigation Content */}
            <div 
              id="navigation-content"
              className={`${mobileSection === 'navigation' ? 'block' : 'hidden'} md:block`}
            >
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <Link href="/about" className="block text-slate-300 hover:text-emerald-400 transition-colors">About</Link>
                  <Link href="/research" className="block text-slate-300 hover:text-emerald-400 transition-colors">Research Hub</Link>
                  <Link href="/publications" className="block text-slate-300 hover:text-emerald-400 transition-colors">Publications</Link>
                  <Link href="/gallery" className="block text-slate-300 hover:text-emerald-400 transition-colors">Gallery</Link>
                </div>
                <div className="space-y-2">
                  <Link href="/services" className="block text-slate-300 hover:text-emerald-400 transition-colors">Counseling</Link>
                  <Link href="/mentorship" className="block text-slate-300 hover:text-emerald-400 transition-colors">Mentorship</Link>
                  <Link href="/consulting" className="block text-slate-300 hover:text-emerald-400 transition-colors">Consulting</Link>
                  <Link href="/contact" className="block text-slate-300 hover:text-emerald-400 transition-colors">Contact</Link>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION - Compact Contact Card */}
          <div className="space-y-4">
            {/* Mobile Accordion Header */}
            <button
              onClick={() => toggleMobileSection('contact')}
              className="md:hidden flex items-center justify-between w-full font-semibold text-sm uppercase tracking-wider text-slate-400 hover:text-emerald-400 transition-colors"
              aria-expanded={mobileSection === 'contact'}
              aria-controls="contact-content"
            >
              <span>Contact</span>
              <ArrowUp className={`w-4 h-4 transition-transform duration-200 ${mobileSection === 'contact' ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Desktop Header */}
            <h3 className="hidden md:block font-semibold text-sm uppercase tracking-wider text-slate-400">Contact</h3>
            
            {/* Contact Content */}
            <div 
              id="contact-content"
              className={`${mobileSection === 'contact' ? 'block' : 'hidden'} md:block`}
            >
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 group">
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300">Karen, Nairobi</span>
                </div>
                <div className="flex items-center gap-3 group">
                  <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`mailto:${siteConfig.email}`} 
                      className="text-slate-300 hover:text-emerald-400 transition-colors"
                      aria-label={`Send email to ${siteConfig.email}`}
                    >
                      {siteConfig.email}
                    </Link>
                    <button
                      onClick={() => copyToClipboard(siteConfig.email, 'email')}
                      className="p-1 rounded hover:bg-slate-700 transition-colors"
                      title="Copy email"
                      aria-label="Copy email address"
                    >
                      {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400 hover:text-white" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 group">
                  <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300">{siteContent.contact.phones[0]}</span>
                    <button
                      onClick={() => copyToClipboard(siteContent.contact.phones[0], 'phone')}
                      className="p-1 rounded hover:bg-slate-700 transition-colors"
                      title="Copy phone"
                      aria-label="Copy phone number"
                    >
                      {copiedPhone === siteContent.contact.phones[0] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400 hover:text-white" />}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Compact Trust Signals */}
              <div className="pt-2 space-y-1 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                  <span>Licensed KCPB</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                  <span>HOD Psychology, CUEA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                  <span>Co-Founder, BeautifulMind</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2 - Utility Bar */}
        <div className="border-t border-slate-700/50 mt-8 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            
            {/* Left - Copyright */}
            <div className="text-slate-400">
              © {new Date().getFullYear()} Dr. Stephen Asatsa. All rights reserved.
            </div>
            
            {/* Center - Socials & Stats */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              {/* Social Links */}
              <div className="flex items-center gap-3">
                {siteContent.contact.socialLinks.map((item) => {
                  const iconMap: Record<string, any> = {
                    'Facebook': Facebook,
                    'Twitter': Twitter,
                    'X': Twitter,
                    'Instagram': Instagram,
                    'LinkedIn': Linkedin,
                  };
                  const Icon = iconMap[item.label] || ExternalLink;
                  return (
                    <Link 
                      key={item.label} 
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/30 text-slate-300 hover:bg-emerald-600 hover:text-white transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      aria-label={`Visit ${item.label} profile`}
                    >
                      <Icon className="w-4 h-4" />
                    </Link>
                  );
                })}
              </div>
              
              {/* Research Stats */}
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" aria-hidden="true" />
                  <span>{researchStats.publications} Publications</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-3 h-3" aria-hidden="true" />
                  <span>{researchStats.projects} Projects</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" aria-hidden="true" />
                  <span>{researchStats.collaborators} Collaborators</span>
                </div>
              </div>
            </div>
            
            {/* Right - Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/admin-signup"
                className="px-3 py-1.5 text-xs bg-slate-700/30 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Go to admin login"
              >
                Admin Login
              </Link>
              <button
                onClick={scrollToTop}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-700/30 hover:bg-emerald-600/50 text-slate-300 hover:text-white rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                title="Scroll to top"
                aria-label="Back to top"
              >
                <ArrowUp className="w-3 h-3" />
                <span>Top</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
