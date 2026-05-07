"use client";

import { AnimatedStat } from "@/components/home/animated-stat";
import { useState, useEffect } from "react";
import { TrendingUp, Award, Users, BookOpen, Sparkles } from "lucide-react";

const statIcons = [TrendingUp, Award, Users, BookOpen];
const statColors = [
  "from-purple-500 to-violet-600",
  "from-emerald-500 to-teal-600", 
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600"
];
const statBgColors = [
  "bg-purple-50 hover:bg-purple-100",
  "bg-emerald-50 hover:bg-emerald-100",
  "bg-amber-50 hover:bg-amber-100", 
  "bg-rose-50 hover:bg-rose-100"
];

export function StatisticsSection() {
  const [stats, setStats] = useState<Array<{ value: number; suffix: string; label: string }>>([
    { value: 15, suffix: "+", label: "Years of Experience" },
    { value: 50, suffix: "+", label: "Publications" },
    { value: 1000, suffix: "+", label: "People Helped" },
    { value: 25, suffix: "+", label: "Research Projects" },
  ]);

  useEffect(() => {
    fetch("/api/statistics")
      .then(res => res.json())
      .then(data => {
        if (data.statistics && data.statistics.length > 0) {
          setStats(data.statistics.map((stat: any) => ({
            value: stat.value,
            suffix: stat.suffix || "",
            label: stat.label
          })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-purple-50 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0">
        {/* Floating gradient orbs */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
        <div className="absolute top-20 right-20 w-40 h-40 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000" />
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000" />
        
        {/* Additional decorative elements */}
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-blue-100 rounded-full mix-blend-multiply filter blur-lg opacity-15 animate-bounce" />
        <div className="absolute bottom-1/3 right-10 w-28 h-28 bg-rose-100 rounded-full mix-blend-multiply filter blur-lg opacity-15 animate-pulse animation-delay-1000" />
        <div className="absolute top-1/2 left-1/6 w-20 h-20 bg-indigo-100 rounded-full mix-blend-multiply filter blur-lg opacity-15 animate-bounce animation-delay-3000" />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #8b5cf6 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #10b981 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-1/3 w-8 h-8 border-2 border-purple-300 rotate-45 animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-20 right-1/3 w-6 h-6 border-2 border-emerald-300 rotate-12 animate-spin" style={{ animationDuration: '15s' }} />
        <div className="absolute top-1/2 right-20 w-10 h-10 border-2 border-amber-300 rounded-full animate-pulse" />
      </div>
      
      <div className="container-shell relative z-10">
        <div className="mb-16 text-center">
          <h2 className="font-display text-4xl mb-4 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent font-bold">
            Impact & Experience
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Years of dedicated service in psychology, research, and academic leadership
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = statIcons[index];
            const colorClass = statColors[index];
            const bgClass = statBgColors[index];
            
            return (
              <div 
                key={index} 
                className={`group relative ${bgClass} rounded-2xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer border border-white/50 backdrop-blur-sm`}
              >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${colorClass} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClass} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                
                {/* Stat number */}
                <div className="text-center mb-2">
                  <div className={`font-display text-4xl font-bold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
                    <AnimatedStat value={stat.value} suffix={stat.suffix} delay={index * 200} />
                  </div>
                </div>
                
                {/* Label */}
                <div className="text-center">
                  <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
                
                {/* Sparkle effect on hover */}
                <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-yellow-500 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-300" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
