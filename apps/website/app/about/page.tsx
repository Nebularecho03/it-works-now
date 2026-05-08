"use client";

import { useState, useEffect } from "react";
import { AboutHero } from "@/components/about/AboutHero";
import { ProfessionalBio } from "@/components/about/ProfessionalBio";
import { ResearchInterests } from "@/components/about/ResearchInterests";
import { AchievementsTimeline } from "@/components/about/AchievementsTimeline";
import { ProfessionalNetworks } from "@/components/about/ProfessionalNetworks";
import { CallToAction } from "@/components/about/CallToAction";
import { AboutContent, ResearchInterest, Award, ExternalProfile, StatCounter } from "@/components/about/types";

export default function AboutPage() {
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [researchInterests, setResearchInterests] = useState<ResearchInterest[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [externalProfiles, setExternalProfiles] = useState<ExternalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats for hero section - these will be dynamic in the future
  const stats: StatCounter[] = [
    { label: "Publications", value: 48, description: "Peer-reviewed academic papers" },
    { label: "Research Projects", value: 12, description: "Active research initiatives" },
    { label: "Collaborators", value: 8, description: "Research partners worldwide" },
    { label: "Talks & Grants", value: 43, description: "Presentations and funding" },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [aboutRes, researchRes, awardsRes, profilesRes] = await Promise.all([
          fetch('/api/about'),
          fetch('/api/research-interests'),
          fetch('/api/awards'),
          fetch('/api/external-profiles')
        ]);

        // Check if responses are ok
        if (!aboutRes.ok) throw new Error('Failed to load about content');
        if (!researchRes.ok) throw new Error('Failed to load research interests');
        if (!awardsRes.ok) throw new Error('Failed to load awards');
        if (!profilesRes.ok) throw new Error('Failed to load profiles');

        const aboutData = await aboutRes.json();
        const researchData = await researchRes.json();
        const awardsData = await awardsRes.json();
        const profilesData = await profilesRes.json();

        setAboutContent(aboutData);
        setResearchInterests(researchData.research_interests || []);
        setAwards(awardsData.awards || []);
        setExternalProfiles(profilesData.external_profiles || []);
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load some content. Please try again later.');
        
        // Set fallback data
        setAboutContent({
          aboutFull: [
            "Dr. Stephen Asatsa is a Senior Lecturer and Head of Department of Psychology at the Catholic University of Eastern Africa. He is a licensed psychologist registered by the Kenya Counselors and Psychologists Board (KCPB) and co-founder of BeautifulMind Consultants.",
            "His research focuses on indigenous knowledge systems, decolonization of psychology, thanatology, cultural evolution, and the indigenization of psychological practice. He advocates for culturally grounded and contextually relevant mental health services in Africa."
          ],
          quote: {
            text: "The good life is one inspired by love and guided by knowledge.",
            author: "Bertrand Russell"
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Professional portrait - use the best available image
  const portraitSrc = "/uploads/admin/steve.jpg";

  // Contact information for CTA
  const contactInfo = {
    email: "hello@stephenasatsa.com",
    phone: "+254 770 140 889",
    location: "Karen, Nairobi",
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <AboutHero portraitSrc={portraitSrc} stats={stats} />

      {/* Professional Biography */}
      <ProfessionalBio content={aboutContent} />

      {/* Research Interests */}
      <ResearchInterests interests={researchInterests} loading={loading} />

      {/* Achievements Timeline */}
      <AchievementsTimeline awards={awards} loading={loading} />

      {/* Professional Networks */}
      <ProfessionalNetworks profiles={externalProfiles} loading={loading} />

      {/* Call to Action */}
      <CallToAction contactInfo={contactInfo} />

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-sm p-4 bg-red-500 text-white rounded-lg shadow-lg z-50">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

