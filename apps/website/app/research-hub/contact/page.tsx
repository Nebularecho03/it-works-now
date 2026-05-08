import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Globe, Users, Calendar } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Contact | HDLK-L Research Hub",
  description: "Get in touch with the Human Development, Indigenous Knowledge and Flourishing Lab",
};

export default function ContactPage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Mail className="w-8 h-8 text-[#0F766E]" />
          <h1 className="text-4xl font-bold">Contact Us</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Connect with our research team for collaboration, inquiries, or to learn more about our work
        </p>
      </section>

      {/* Contact Information */}
      <section className="grid gap-8 md:grid-cols-2">
        <Card className="p-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Get in Touch</h2>
            <p className="text-muted-foreground">
              We welcome research collaborations, student inquiries, and opportunities to advance culturally grounded psychology.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-muted-foreground">research@hdlk-lab.org</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Location</h3>
                  <p className="text-muted-foreground">
                    Catholic University of Eastern Africa<br />
                    Nairobi, Kenya
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Global Network</h3>
                  <p className="text-muted-foreground">6 countries, 12 partner institutions</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Send us a Message</h2>
            
            <form className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <Input placeholder="Enter your first name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <Input placeholder="Enter your last name" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input type="email" placeholder="your.email@example.com" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Input placeholder="What is this regarding?" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea 
                  placeholder="Tell us about your research interests, collaboration ideas, or questions..."
                  rows={6}
                />
              </div>

              <Button className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </div>
        </Card>
      </section>

      {/* Research Collaboration */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Research Collaboration</h2>
          <p className="text-muted-foreground">Join our global research network</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Academic Partners</h3>
            <p className="text-muted-foreground mb-4">
              Collaborate on research projects, co-author publications, and share resources
            </p>
            <Button variant="outline" asChild>
              <Link href="/research-hub/team">View Our Team</Link>
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Student Opportunities</h3>
            <p className="text-muted-foreground mb-4">
              Graduate research positions, internships, and supervision opportunities
            </p>
            <Button variant="outline" asChild>
              <Link href="/research-hub/projects">View Projects</Link>
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Global Network</h3>
            <p className="text-muted-foreground mb-4">
              Connect with our international partners and research collaborators
            </p>
            <Button variant="outline">
              <MapPin className="w-4 h-4 mr-2" />
              View Partners
            </Button>
          </Card>
        </div>
      </section>

      {/* Office Hours */}
      <section className="bg-gradient-to-r from-[#0F766E] to-teal-600 rounded-2xl p-8 text-white">
        <div className="text-center space-y-6">
          <Calendar className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold">Office Hours & Visits</h2>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Regular Office Hours</h3>
              <p className="opacity-90">
                Monday - Friday: 9:00 AM - 4:00 PM<br />
                Saturday: 10:00 AM - 1:00 PM<br />
                Sunday: Closed
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Research Consultations</h3>
              <p className="opacity-90">
                By appointment only<br />
                Please email 2 weeks in advance<br />
                Virtual meetings available
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#0F766E] hover:bg-gray-100 border-0 px-8" asChild>
              <Link href="mailto:research@hdlk-lab.org">
                <Mail className="w-4 h-4 mr-2" />
                Schedule Appointment
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#0F766E] px-8" asChild>
              <Link href="/research-hub/about">
                Learn More About Us
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Quick Links</h2>
          <p className="text-muted-foreground">Find what you're looking for</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6 hover:shadow-md transition-all duration-300">
            <h3 className="font-semibold mb-3">Research</h3>
            <div className="space-y-2">
              <Link href="/research-hub/projects" className="block text-sm text-muted-foreground hover:text-[#0F766E]">
                Current Projects
              </Link>
              <Link href="/research-hub/publications" className="block text-sm text-muted-foreground hover:text-[#0F766E]">
                Publications
              </Link>
              <Link href="/research-hub/events" className="block text-sm text-muted-foreground hover:text-[#0F766E]">
                Upcoming Events
              </Link>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-all duration-300">
            <h3 className="font-semibold mb-3">People</h3>
            <div className="space-y-2">
              <Link href="/research-hub/team" className="block text-sm text-muted-foreground hover:text-[#0F766E]">
                Research Team
              </Link>
              <Link href="/research-hub/about" className="block text-sm text-muted-foreground hover:text-[#0F766E]">
                Lab Director
              </Link>
              <Link href="/research-hub/awards" className="block text-sm text-muted-foreground hover:text-[#0F766E]">
                Recognition
              </Link>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-all duration-300">
            <h3 className="font-semibold mb-3">Resources</h3>
            <div className="space-y-2">
              <Link href="/research-hub/search" className="block text-sm text-muted-foreground hover:text-[#0F766E]">
                Search Research
              </Link>
              <Link href="/research-hub/insights" className="block text-sm text-muted-foreground hover:text-[#0F766E]">
                Research Insights
              </Link>
              <Link href="/admin" className="block text-sm text-muted-foreground hover:text-[#0F766E]">
                Admin Portal
              </Link>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-all duration-300">
            <h3 className="font-semibold mb-3">Connect</h3>
            <div className="space-y-2">
              <Link href="mailto:research@hdlk-lab.org" className="block text-sm text-muted-foreground hover:text-[#0F766E]">
                Email Us
              </Link>
              <Link href="/research-hub/events" className="block text-sm text-muted-foreground hover:text-[#0F766E]">
                Attend Events
              </Link>
              <Link href="/research-hub/team" className="block text-sm text-muted-foreground hover:text-[#0F766E]">
                Collaborate
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
