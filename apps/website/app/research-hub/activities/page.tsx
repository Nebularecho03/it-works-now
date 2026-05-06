import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Presentation, Video, FileText, MapPin, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";
import { siteContent } from "@/lib/content/site-content";

export const metadata = {
  title: "Activities | HDLK-L Research Hub",
  description: "Research activities, conferences, publications, and media appearances from the Human Development, Indigenous Knowledge and Flourishing Lab",
};

export default function ActivitiesPage() {
  return (
    <div className="space-y-8">
            {/* Hero Section */}
            <section className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Calendar className="w-8 h-8 text-[#0F766E]" />
                <h1 className="text-4xl font-bold">Activities</h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Conferences, publications, media appearances, and community engagement activities from our research team
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

            {/* Recent Publications */}
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Recent Publications</h2>
                <p className="text-muted-foreground">Latest scholarly outputs from our research</p>
              </div>
              
              <div className="space-y-4">
                {siteContent.publications.slice(0, 3).map((publication, index) => (
                  <Card key={index} className="p-6 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="text-lg font-semibold">{publication.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{publication.year}</span>
                          <Badge variant="outline">{publication.type}</Badge>
                        </div>
                        <p className="text-muted-foreground">{publication.summary}</p>
                        {publication.fileUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={publication.fileUrl} target="_blank">
                              <ExternalLink className="w-3 h-3 mr-2" />
                              View Publication
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="text-center">
                <Button variant="outline" size="lg" asChild>
                  <Link href="/research-hub/publications">
                    View All Publications
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </section>

            {/* Conference Presentations */}
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Conference Presentations</h2>
                <p className="text-muted-foreground">Recent academic conferences and speaking engagements</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {siteContent.conferences.slice(0, 4).map((conference, index) => (
                  <Card key={index} className="p-6 hover:shadow-md transition-all duration-300">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Presentation className="w-5 h-5 text-[#0F766E]" />
                        <Badge variant="outline">Conference</Badge>
                      </div>
                      <h3 className="font-semibold line-clamp-2">{conference}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{conference.split(',').pop()?.trim()}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Media Gallery */}
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Media Gallery</h2>
                <p className="text-muted-foreground">Videos and media appearances from our research activities</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {siteContent.media.slice(0, 6).map((media, index) => (
                  <Card key={index} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="aspect-video bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                      <Video className="w-12 h-12 text-emerald-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{media.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Badge variant="outline">{media.kind}</Badge>
                        {media.year && <span>{media.year}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{media.description}</p>
                      <Button size="sm" variant="outline" className="w-full" asChild>
                        <Link href={media.href} target="_blank">
                          <ExternalLink className="w-3 h-3 mr-2" />
                          Watch
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Get Involved */}
            <section className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 text-white text-center">
              <div className="space-y-6">
                <Calendar className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-3xl font-bold">Join Our Activities</h2>
                <p className="text-lg max-w-2xl mx-auto opacity-90">
                  Participate in our research activities, attend our events, and contribute to advancing culturally grounded psychology.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100 border-0 px-8" asChild>
                    <Link href="/research-hub/community">
                      Get Involved
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-teal-600 px-8" asChild>
                    <Link href="/contact">
                      Contact Us
                    </Link>
                  </Button>
                </div>
              </div>
            </section>
    </div>
  );
}
