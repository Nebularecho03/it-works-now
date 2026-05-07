import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Users, FileText, Trophy, ArrowRight, Lock, Star } from "lucide-react";

// Mock data - will be replaced with API calls
const featuredProjects = [
  {
    id: "1",
    title: "Traditional Luhya Mourning Rituals",
    summary: "Exploring indigenous knowledge systems in cultural psychology",
    category: "Cultural Psychology",
    image: "/images/research/project1.jpg",
    featured: true
  },
  {
    id: "2", 
    title: "Mental Health in African Contexts",
    summary: "Decolonizing mental health practices through community-based approaches",
    category: "Clinical Psychology",
    image: "/images/research/project2.jpg",
    featured: true
  }
];

const stats = [
  { label: "Research Projects", value: "12+", icon: Brain },
  { label: "Publications", value: "24+", icon: FileText },
  { label: "Team Members", value: "15+", icon: Users },
  { label: "Awards", value: "8+", icon: Trophy }
];

const subscriptionFeatures = [
  { title: "Full Research Access", included: true },
  { title: "Download Publications", included: true },
  { title: "Save Research Items", included: true },
  { title: "Messaging with Researchers", included: true },
  { title: "Advanced Search & Filters", included: true },
  { title: "Priority Support", included: true }
];

export default function ResearchHubPublic() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
        <div className="container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl mb-6">
                🧠🌿
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                Research Hub v2
              </h1>
              <p className="text-2xl md:text-3xl font-light opacity-90 mb-6">
                Human Development, Indigenous Knowledge and Flourishing Lab
              </p>
              <p className="text-lg md:text-xl opacity-80 max-w-3xl mx-auto mb-8">
                Access cutting-edge research in cultural psychology, indigenous knowledge systems, 
                and evidence-based mental health practices in African contexts.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 border-0 px-8" asChild>
                <Link href="/research-hub-v2/auth/register">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600 px-8" asChild>
                <Link href="/research-hub-v2/public/preview">
                  Preview Research <Star className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Projects Preview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Research
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our latest research projects advancing psychological science and cultural understanding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {featuredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-video bg-gradient-to-br from-emerald-100 to-teal-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="w-16 h-16 text-emerald-600 opacity-50" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-emerald-600 text-white">Featured</Badge>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{project.category}</Badge>
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-gray-600 mb-4">{project.summary}</p>
                  <Button variant="outline" className="w-full" disabled>
                    Sign up to view full research
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" asChild>
              <Link href="/research-hub-v2/auth/register">
                Unlock Full Access <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get access to premium research content and advanced features.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="p-8 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Research Access</h3>
                <div className="text-4xl font-bold text-emerald-600 mb-2">
                  $29<span className="text-lg text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">Full access to all research content and features</p>
              </div>

              <div className="space-y-4 mb-8">
                {subscriptionFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Star className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-gray-700">{feature.title}</span>
                  </div>
                ))}
              </div>

              <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700" asChild>
                <Link href="/research-hub-v2/auth/register">
                  Start Premium Trial
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Explore Cutting-Edge Research?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join our research community and gain access to exclusive content, 
            collaborate with researchers, and stay updated with latest findings.
          </p>
          <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 border-0 px-8" asChild>
            <Link href="/research-hub-v2/auth/register">
              Get Started Now <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
