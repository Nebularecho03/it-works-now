import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Brain, 
  Target, 
  Globe, 
  Users, 
  Heart,
  Lightbulb,
  ArrowRight,
  Mail,
  Award
} from "lucide-react";

export const metadata = {
  title: "About | HDLK-L Research Hub",
  description: "Human Development, Indigenous Knowledge and Flourishing Lab - Culturally grounded psychology research",
};

export default function ResearchAboutPage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#0F766E] to-teal-600 rounded-xl flex items-center justify-center text-white">
            🧠🌿
          </div>
          <h1 className="text-4xl font-bold">African Center for Cultural Psychology</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Human Development, Indigenous Knowledge and Flourishing Lab
        </p>
        <div className="bg-gradient-to-r from-[#0F766E] to-teal-600 rounded-2xl p-8 text-white max-w-4xl mx-auto">
          <p className="text-lg leading-relaxed">
            Pioneering research center dedicated to culturally grounded psychology, indigenous knowledge systems, and decolonizing mental health practices in African contexts.
          </p>
        </div>
      </section>

      {/* Mission, Vision & Values */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground">
            To honor African wisdom through research that serves communities while advancing scientific knowledge.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold">Mission</h3>
              <p className="text-muted-foreground">
                Integrate traditional African wisdom with rigorous scientific methods to advance human flourishing across the continent.
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">Vision</h3>
              <p className="text-muted-foreground">
                Become Africa's leading research hub for culturally grounded psychology, producing evidence-based knowledge that honors indigenous wisdom.
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold">Values</h3>
              <p className="text-muted-foreground">
                Cultural authenticity, scientific excellence, community impact, and decolonization of psychology practice and education.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Lab Director */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Led by Dr. Stephen Asatsa</h2>
          <p className="text-muted-foreground">Senior Lecturer & Head of Psychology Department</p>
        </div>
        
        <Card className="p-8 max-w-4xl mx-auto">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#0F766E] to-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                SA
              </div>
              <h3 className="text-xl font-bold mb-2">Dr. Stephen Asatsa</h3>
              <Badge className="mb-3 bg-[#0F766E]">Principal Investigator</Badge>
            </div>
            
            <div className="md:col-span-2 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Position</h4>
                <p className="text-muted-foreground">
                  Senior Lecturer & Head of Psychology Department<br />
                  Catholic University of Eastern Africa
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Credentials</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• PhD in Psychology</li>
                  <li>• Registered & Licensed Psychologist (Kenya)</li>
                  <li>• Co-founder, BeautifulMind Consultants</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Indigenous Psychology</Badge>
                  <Badge variant="secondary">Cross-Cultural Psychology</Badge>
                  <Badge variant="secondary">Thanatology</Badge>
                  <Badge variant="secondary">Cultural Evolution</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Research Philosophy */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Research Philosophy</h2>
          <p className="text-muted-foreground">Our approach to culturally grounded psychology</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold">Mixed-Methods Approach</h3>
              <p className="text-muted-foreground">
                Blend African indigenous wisdom with modern research methodologies to develop innovative solutions that respect cultural traditions.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">Community Engagement</h3>
              <p className="text-muted-foreground">
                Actively involve community members in research process, ensuring cultural relevance and practical applicability of findings.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Core Research Areas */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Core Research Areas</h2>
          <p className="text-muted-foreground">Our primary focus areas in psychological research</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-emerald-500">
            <div className="space-y-4">
              <div className="text-2xl">🧠</div>
              <h3 className="text-xl font-bold text-emerald-700">Indigenous Psychology</h3>
              <p className="text-muted-foreground">
                Exploring traditional African healing practices and knowledge systems for psychological wellbeing.
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-blue-500">
            <div className="space-y-4">
              <div className="text-2xl">🌱</div>
              <h3 className="text-xl font-bold text-blue-700">Cross-Cultural Development</h3>
              <p className="text-muted-foreground">
                Studying psychological development across diverse African contexts and cultural environments.
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-purple-500">
            <div className="space-y-4">
              <div className="text-2xl">❤️</div>
              <h3 className="text-xl font-bold text-purple-700">Mental Health & Trauma</h3>
              <p className="text-muted-foreground">
                Addressing mental health challenges through culturally appropriate interventions and trauma-informed care.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Global Partners */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Global Research Network</h2>
          <p className="text-muted-foreground">Collaborating with institutions across multiple continents</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { country: "Kenya", institution: "Catholic University of Eastern Africa", role: "Lead Institution" },
            { country: "UK", institution: "Durham University", role: "Research Partner" },
            { country: "Switzerland", institution: "University of Zurich", role: "Research Partner" },
            { country: "Namibia", institution: "University of Namibia", role: "Research Partner" },
            { country: "South Africa", institution: "University of the Free State", role: "Research Partner" },
            { country: "Ethiopia", institution: "Addis Ababa University", role: "Research Partner" }
          ].map((partner, index) => (
            <Card key={index} className="p-4 hover:shadow-md transition-all duration-300">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#0F766E]" />
                  <span className="font-semibold text-sm">{partner.country}</span>
                </div>
                <div className="text-sm">
                  <div className="font-medium">{partner.institution}</div>
                  <div className="text-muted-foreground">{partner.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Key Metrics */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl">
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-4xl font-bold text-emerald-400 mb-2">12</div>
            <div className="text-white/90 font-medium">Active Projects</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-4xl font-bold text-blue-400 mb-2">28</div>
            <div className="text-white/90 font-medium">Publications</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-4xl font-bold text-amber-400 mb-2">15</div>
            <div className="text-white/90 font-medium">Awards</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-4xl font-bold text-purple-400 mb-2">6</div>
            <div className="text-white/90 font-medium">Countries</div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-[#0F766E] to-teal-600 rounded-2xl p-8 text-white text-center">
        <div className="space-y-6">
          <Brain className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold">Join Our Research Journey</h2>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Collaborate with us and contribute to impactful studies that advance psychological science and improve lives across African communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#0F766E] hover:bg-gray-100 border-0 px-8" asChild>
              <Link href="/contact">
                <Mail className="w-4 h-4 mr-2" />
                Contact Us
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#0F766E] px-8" asChild>
              <Link href="/research-hub/team">
                <Users className="w-4 h-4 mr-2" />
                Collaborate
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
