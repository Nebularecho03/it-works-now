import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeartHandshake, UsersRound, MessageCircle, ExternalLink, Mail, Globe, Star } from "lucide-react";
import Link from "next/link";
import { siteContent } from "@/lib/content/site-content";

export const metadata = {
  title: "Community | HDLK-L Research Hub",
  description: "Join our research community, collaborate on projects, and access mental health resources from the Human Development, Indigenous Knowledge and Flourishing Lab",
};

export default function CommunityPage() {
  return (
    <div className="space-y-8">
            {/* Hero Section */}
            <section className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <HeartHandshake className="w-8 h-8 text-[#0F766E]" />
                <h1 className="text-4xl font-bold">Community</h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Join our growing community of researchers, practitioners, and partners working together to advance culturally grounded psychology
              </p>
            </section>

            {/* Ways to Get Involved */}
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Ways to Get Involved</h2>
                <p className="text-muted-foreground">Find your place in our research community</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#0F766E] to-emerald-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <UsersRound className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">Student Research Opportunities</h3>
                      <p className="text-muted-foreground mb-4">
                        Join our research team as a graduate assistant or research intern. Gain hands-on experience in culturally grounded psychology research.
                      </p>
                      <Button className="w-full" asChild>
                        <Link href="/contact">
                          Apply Now
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <HeartHandshake className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">Research Collaboration</h3>
                      <p className="text-muted-foreground mb-4">
                        Partner with us on research projects, grant applications, or academic publications in psychology and mental health.
                      </p>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/contact">
                          Collaborate
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">Community Engagement</h3>
                      <p className="text-muted-foreground mb-4">
                        Participate in our community workshops, mental health awareness programs, and cultural psychology initiatives.
                      </p>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="#newsletter">
                          Join Newsletter
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* Testimonials */}
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Community Voices</h2>
                <p className="text-muted-foreground">What our collaborators and community members say</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-3">
                {siteContent.testimonials.map((testimonial, index) => (
                  <Card key={index} className="p-6 hover:shadow-md transition-all duration-300">
                    <div className="space-y-4">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <blockquote className="text-muted-foreground italic mb-4">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{testimonial.name}</div>
                          <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Partner Network */}
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Partner Network</h2>
                <p className="text-muted-foreground">Institutions and organizations we collaborate with</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                  <div className="space-y-4">
                    <Globe className="w-8 h-8 text-[#0F766E]" />
                    <h3 className="text-xl font-bold">Academic Partners</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Catholic University of Eastern Africa (Kenya)</li>
                      <li>• Durham University (UK)</li>
                      <li>• University of Zurich (Switzerland)</li>
                      <li>• University of Namibia</li>
                      <li>• University of the Free State (South Africa)</li>
                      <li>• Addis Ababa University (Ethiopia)</li>
                    </ul>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="space-y-4">
                    <HeartHandshake className="w-8 h-8 text-teal-600" />
                    <h3 className="text-xl font-bold">Funding Partners</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Templeton Foundation</li>
                      <li>• Swiss National Science Foundation</li>
                      <li>• Cultural Evolution Society</li>
                      <li>• John Templeton Foundation</li>
                      <li>• International Consortium of Universities for Drug Demand Reduction</li>
                      <li>• Society for Research in Child Development</li>
                    </ul>
                  </div>
                </Card>
              </div>
            </section>

            {/* Resources */}
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Community Resources</h2>
                <p className="text-muted-foreground">Mental health resources and tools for practitioners and community members</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="p-6 hover:shadow-md transition-all duration-300">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Mental Health Support</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Access professional mental health services through BeautifulMind Consultants.
                    </p>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link href="https://beautifulmind.cc/" target="_blank">
                        <ExternalLink className="w-3 h-3 mr-2" />
                        BeautifulMind
                      </Link>
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-md transition-all duration-300">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Research Tools</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Access our research methodologies, assessment tools, and cultural psychology frameworks.
                    </p>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link href="/research-hub/resources">
                        <ExternalLink className="w-3 h-3 mr-2" />
                        View Resources
                      </Link>
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-md transition-all duration-300">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Training Programs</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Professional development workshops and training in culturally grounded psychology.
                    </p>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link href="/research-hub/activities">
                        <ExternalLink className="w-3 h-3 mr-2" />
                        View Programs
                      </Link>
                    </Button>
                  </div>
                </Card>
              </div>
            </section>

            {/* Newsletter Signup */}
            <section id="newsletter" className="bg-gradient-to-r from-[#0F766E] to-teal-600 rounded-2xl p-8 text-white text-center">
              <div className="space-y-6">
                <Mail className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-3xl font-bold">Stay Connected</h2>
                <p className="text-lg max-w-2xl mx-auto opacity-90">
                  Join our newsletter to receive updates on research findings, upcoming events, and opportunities to get involved.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <Button size="lg" className="bg-white text-[#0F766E] hover:bg-gray-100 border-0 px-8">
                    Subscribe
                  </Button>
                </div>
              </div>
            </section>
    </div>
  );
}
