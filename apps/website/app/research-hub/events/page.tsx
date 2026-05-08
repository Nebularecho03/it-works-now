import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Video, Presentation, ExternalLink } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Events | HDLK-L Research Hub",
  description: "Research events, conferences, workshops, and academic activities from the Human Development, Indigenous Knowledge and Flourishing Lab",
};

export default function EventsPage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Calendar className="w-8 h-8 text-[#0F766E]" />
          <h1 className="text-4xl font-bold">Events & Activities</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Conferences, workshops, and research activities from our lab
        </p>
      </section>

      {/* Upcoming Events */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
          <p className="text-muted-foreground">Join us at these upcoming research activities</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 border-l-4 border-[#0F766E] bg-gradient-to-r from-emerald-50 to-transparent">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#0F766E]" />
                <Badge className="bg-[#0F766E] text-white">Upcoming</Badge>
              </div>
              <h3 className="text-xl font-bold">Colloquium on African Psychology</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>Online</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Oct 3, 2025</span>
                </div>
              </div>
              <p className="text-muted-foreground">
                Luhya Traditional Mourning Rituals: Cultural insights and therapeutic implications for African psychology.
              </p>
              <Button className="w-full" asChild>
                <Link href="#">
                  Register to Attend
                </Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-teal-600 bg-gradient-to-r from-teal-50 to-transparent">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Presentation className="w-5 h-5 text-teal-600" />
                <Badge className="bg-teal-600 text-white">Workshop</Badge>
              </div>
              <h3 className="text-xl font-bold">Publishing Research Workshop</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>CUEA, Nairobi</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>July 24, 2025</span>
                </div>
              </div>
              <p className="text-muted-foreground">
                Transform your graduate research into publishable scholarly work for international journals.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="#">
                  Learn More
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Past Events */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Past Events</h2>
          <p className="text-muted-foreground">Recent conferences and presentations</p>
        </div>
        
        <div className="space-y-4">
          <Card className="p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                <Presentation className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold">International Conference on Cultural Psychology</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>Durham, UK</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>June 2024</span>
                  </div>
                  <Badge variant="outline">Conference</Badge>
                </div>
                <p className="text-muted-foreground">
                  Presented research on indigenous knowledge systems and their role in mental health practices across African communities.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold">Community Engagement Workshop</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>Nairobi, Kenya</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>March 2024</span>
                  </div>
                  <Badge variant="outline">Workshop</Badge>
                </div>
                <p className="text-muted-foreground">
                  Facilitated community-based participatory research methods with local mental health practitioners and traditional healers.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                <Video className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold">Webinar: Decolonizing Psychology</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    <span>Online</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>February 2024</span>
                  </div>
                  <Badge variant="outline">Webinar</Badge>
                </div>
                <p className="text-muted-foreground">
                  Online presentation on approaches to decolonizing psychological practice and education in African contexts.
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="#" target="_blank">
                    <ExternalLink className="w-3 h-3 mr-2" />
                    Watch Recording
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Event Categories */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Event Types</h2>
          <p className="text-muted-foreground">Different ways we engage with the research community</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Presentation className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Conferences</h3>
            <p className="text-muted-foreground">
              Presenting research findings at international and national academic conferences
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Workshops</h3>
            <p className="text-muted-foreground">
              Hands-on training and skill development for researchers and practitioners
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Webinars</h3>
            <p className="text-muted-foreground">
              Online presentations and discussions reaching global audiences
            </p>
          </Card>
        </div>
      </section>

      {/* Get Involved */}
      <section className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 text-white text-center">
        <div className="space-y-6">
          <Calendar className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold">Join Our Events</h2>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Participate in our research activities, attend our events, and contribute to advancing culturally grounded psychology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100 border-0 px-8" asChild>
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-teal-600 px-8" asChild>
              <Link href="/research-hub/publications">
                View Our Work
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
