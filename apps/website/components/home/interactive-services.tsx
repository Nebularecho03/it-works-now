"use client";

import { siteContent } from "@/lib/content/site-content";
import { Card } from "@/components/ui/card";
import { Brain, Users, BookOpen, GraduationCap, Building, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const serviceIcons = [Brain, Users, BookOpen, GraduationCap, Building, Calendar];

const iconMap: Record<string, any> = {
  Brain,
  Users,
  BookOpen,
  GraduationCap,
  Building,
  Calendar
};

const serviceColors = [
  "from-purple-500 to-violet-600",
  "from-emerald-500 to-teal-600", 
  "from-blue-500 to-cyan-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-purple-600"
];

const serviceBgColors = [
  "bg-purple-50 hover:bg-purple-100",
  "bg-emerald-50 hover:bg-emerald-100",
  "bg-blue-50 hover:bg-blue-100",
  "bg-amber-50 hover:bg-amber-100",
  "bg-rose-50 hover:bg-rose-100",
  "bg-indigo-50 hover:bg-indigo-100"
];

export function InteractiveServicesSection() {
  const [services, setServices] = useState<Array<{ title: string; description: string; bullets: string[]; icon?: string; link?: string }>>(siteContent.services);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then(res => res.json())
      .then(data => {
        if (data.services && data.services.length > 0) {
          setServices(data.services.map((s: any) => ({
            title: s.title,
            description: s.description,
            bullets: s.bullets ? JSON.parse(s.bullets) : [],
            icon: s.icon || 'Brain',
            link: s.link || '/services'
          })) as Array<{ title: string; description: string; bullets: string[]; icon?: string; link?: string }>);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container-shell">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" />
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/3 w-36 h-36 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000" />
      </div>
      
      <div className="container-shell relative z-10">
        <div className="mb-16 text-center">
          <h2 className="font-display text-4xl mb-4 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent font-bold">
            Our Services
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Comprehensive psychological care, research leadership, and professional development services
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon || 'Brain'] || serviceIcons[index] || Brain;
            const colorClass = serviceColors[index % serviceColors.length];
            const bgClass = serviceBgColors[index % serviceBgColors.length];
            const isHovered = hoveredIndex === index;

            return (
              <div 
                key={service.title} 
                className="group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Card className={`relative h-full border border-white/50 p-6 transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer ${bgClass} backdrop-blur-sm`}>
                  {/* Glow effect on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} rounded-lg opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <div className="mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${colorClass} text-white shadow-lg transition-all duration-300 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className={`font-display text-xl mb-3 transition-all duration-300 ${isHovered ? 'text-transparent bg-gradient-to-r ' + colorClass + ' bg-clip-text' : 'text-slate-900'}`}>
                    {service.title}
                  </h3>

                  <p className="text-muted-foreground mb-4 leading-relaxed transition-colors duration-300 group-hover:text-slate-700">
                    {service.description}
                  </p>

                  <ul className="space-y-2 mb-4">
                    {service.bullets.slice(0, 3).map((bullet: string, bulletIndex: number) => (
                      <li 
                        key={bullet} 
                        className="flex items-center gap-2 text-sm text-muted-foreground transition-all duration-300 group-hover:text-slate-600"
                        style={{ 
                          animationDelay: isHovered ? `${bulletIndex * 100}ms` : '0ms',
                          animation: isHovered ? `slideInRight 0.3s ease-out ${bulletIndex * 100}ms both` : 'none'
                        }}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isHovered ? 'bg-gradient-to-r ' + colorClass + ' scale-150' : 'bg-accent/60'}`} />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  {/* Learn more link */}
                  <div className="flex items-center justify-between mt-auto">
                    <a 
                      href={service.link || "/services"}
                      className={`text-sm font-medium transition-all duration-300 ${isHovered ? 'text-transparent bg-gradient-to-r ' + colorClass + ' bg-clip-text' : 'text-slate-500'} hover:underline`}
                    >
                      Learn more
                    </a>
                    <ArrowRight className={`w-4 h-4 transition-all duration-300 ${isHovered ? 'translate-x-2 text-transparent bg-gradient-to-r ' + colorClass + ' bg-clip-text' : 'text-slate-400'}`} />
                  </div>

                  {/* Sparkle effect on hover */}
                  <Sparkles className={`absolute -top-2 -right-2 h-4 w-4 text-yellow-500 transition-all duration-300 ${isHovered ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />
                </Card>
              </div>
            );
          })}
        </div>

        {/* Additional call-to-action */}
        <div className="mt-16 text-center">
          <a 
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full border border-purple-200 hover:bg-gradient-to-r hover:from-purple-200 hover:to-indigo-200 transition-all duration-300 hover:scale-105"
          >
            <span className="text-purple-700 font-medium">Need a custom solution?</span>
            <ArrowRight className="w-4 h-4 text-purple-600" />
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
