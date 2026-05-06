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
  CheckCircle,
  ArrowRight,
  Mail,
  Award, 
  MapPin,
  ExternalLink
} from "lucide-react";

export const metadata = {
  title: "About Our Research Hub | Dr. Stephen Asatsa",
  description: "Welcome to the Human Development, Indigenous Knowledge and Flourishing Lab (HDLK-L)",
};

export default function ResearchAboutPage() {
  return (
    <div className="space-y-8">
            {/* Hero Section with Lab Identity */}
            <section className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0F766E] to-teal-600 rounded-xl flex items-center justify-center text-white">
                  🧠🌿
                </div>
                <h1 className="text-4xl font-bold">About HDLK-L</h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Human Development, Indigenous Knowledge and Flourishing Lab
              </p>
              <div className="bg-gradient-to-r from-[#0F766E] to-teal-600 rounded-2xl p-8 text-white max-w-4xl mx-auto">
                <p className="text-lg leading-relaxed">
                  A pioneering research center dedicated to culturally grounded psychology, indigenous knowledge systems, and decolonizing mental health practices in African contexts.
                </p>
              </div>
            </section>

            {/* Mission, Vision & Values */}
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Our Foundation</h2>
                <p className="text-muted-foreground">The principles that guide our research and practice</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="p-6 hover:shadow-lg transition-all duration-300">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold">Mission</h3>
                    <p className="text-muted-foreground">
                      To integrate traditional African wisdom with rigorous scientific methods to advance human flourishing across the continent and beyond, while decolonizing psychological practice and education.
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
                      To become Africa's leading research hub for culturally grounded psychology, producing evidence-based knowledge that honors indigenous wisdom while meeting global academic standards.
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

            {/* Dr. Stephen Asatsa's Professional Profile */}
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
                      <p className="text-muted-foreground">Senior Lecturer & Head of Psychology Department<br />
                      Catholic University of Eastern Africa</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Credentials</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• PhD in Psychology</li>
                        <li>• Registered & Licensed Psychologist (Kenya Counselors and Psychologists Board)</li>
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

            {/* Lab Philosophy & Approach */}
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
                      We combine qualitative and quantitative research methods to provide comprehensive insights, including ethnographic studies, focus groups, interviews, surveys, and statistical analysis.
                    </p>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold">Evidence-Based Practice</h3>
                    <p className="text-muted-foreground">
                      Our research is grounded in scientific rigor and empirical evidence, following established protocols for data collection, analysis, and interpretation.
                    </p>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold">Community Engagement</h3>
                    <p className="text-muted-foreground">
                      We actively involve community members in the research process, ensuring cultural relevance and practical applicability of our findings.
                    </p>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold">Innovative Design</h3>
                    <p className="text-muted-foreground">
                      We employ cutting-edge research methodologies and technologies to address complex psychological questions and explore new frontiers.
                    </p>
                  </div>
                </Card>
              </div>
            </section>

            {/* Key Focus Areas */}
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Core Research Areas</h2>
                <p className="text-muted-foreground">Our primary focus areas in psychological research</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-emerald-500">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      🧠
                    </div>
                    <h3 className="text-xl font-bold text-emerald-700">Indigenous Psychology</h3>
                    <p className="text-muted-foreground">
                      Exploring and validating traditional African healing practices and knowledge systems for psychological wellbeing.
                    </p>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-blue-500">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      🌱
                    </div>
                    <h3 className="text-xl font-bold text-blue-700">Cross-Cultural Development</h3>
                    <p className="text-muted-foreground">
                      Studying psychological development across diverse African contexts and cultural environments.
                    </p>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-purple-500">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      ❤️
                    </div>
                    <h3 className="text-xl font-bold text-purple-700">Mental Health & Trauma</h3>
                    <p className="text-muted-foreground">
                      Addressing mental health challenges through culturally appropriate interventions and trauma-informed care.
                    </p>
                  </div>
                </Card>
              </div>
            </section>

            {/* International Footprint */}
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Global Research Network</h2>
                <p className="text-muted-foreground">Collaborating with institutions across multiple continents</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { country: "Kenya", institution: "Catholic University of Eastern Africa", role: "Lead Institution" },
                  { country: "UK", institution: "Durham University", role: "Research Partner" },
                  { country: "Switzerland", institution: "University of Zurich", role: "Research Partner" },
                  { country: "Namibia", institution: "University of Namibia", role: "Research Partner" },
                  { country: "South Africa", institution: "University of the Free State", role: "Research Partner" },
                  { country: "Ethiopia", institution: "Addis Ababa University", role: "Research Partner" }
                ].map((partner, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-all duration-300">
                    <div className="space-y-3">
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
                    <Link href="/research-hub/community">
                      <Users className="w-4 h-4 mr-2" />
                      Get Involved
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#0F766E] px-8" asChild>
                    <Link href="/contact">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Us
                    </Link>
                  </Button>
                </div>
              </div>
            </section>

            {/* ==================== LAB INTRODUCTION ==================== */}
            <section className="bg-white rounded-3xl p-10 shadow-sm">
              <div className="grid md:grid-cols-12 gap-10 items-center">
                <div className="md:col-span-7 space-y-6">
                  <h2 className="text-4xl font-bold">Human Development, Indigenous Knowledge and Flourishing Lab (HDLK-L)</h2>
                  <p className="text-lg text-muted-foreground">
                    Founded and led by Dr. Stephen Asatsa, the HDLK-L is a pioneering research laboratory 
                    dedicated to decolonizing psychology and centering African indigenous knowledge systems 
                    in the study of human development and mental wellbeing.
                  </p>
                  <p className="text-muted-foreground">
                    Our work stands at the intersection of cultural psychology, community resilience, 
                    and contemporary mental health challenges across Africa.
                  </p>
                </div>
                <div className="md:col-span-5">
                  <div className="aspect-square bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center text-white text-7xl">
                    🧠🌿
                  </div>
                </div>
              </div>
            </section>

            {/* ==================== FOUR PHILOSOPHY PILLARS ==================== */}
            <section className="space-y-12">
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-4 text-slate-900">Our Philosophy Pillars</h2>
                <p className="text-slate-600 max-w-2xl mx-auto text-lg font-light">
                  Four core principles guide our research approach and methodology
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Decolonizing Psychology */}
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-teal-200">
                  <div className="text-4xl mb-4">🌱</div>
                  <h3 className="text-xl font-bold text-teal-900 mb-3">Decolonizing Psychology</h3>
                  <p className="text-teal-700 text-sm leading-relaxed">
                    Challenging Western-centric frameworks and amplifying indigenous knowledge systems from African communities.
                  </p>
                </div>

                {/* Cultural Grounding */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-amber-200">
                  <div className="text-4xl mb-4">🌍</div>
                  <h3 className="text-xl font-bold text-amber-900 mb-3">Cultural Grounding</h3>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    Every study is designed with deep respect for local contexts, traditions, and ways of knowing.
                  </p>
                </div>

                {/* Community-Centered */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-emerald-200">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-xl font-bold text-emerald-900 mb-3">Community-Centered</h3>
                  <p className="text-emerald-700 text-sm leading-relaxed">
                    Research conducted with communities, not on them — ensuring relevance and sustainable impact.
                  </p>
                </div>

                {/* Interdisciplinary Excellence */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-300">
                  <div className="text-4xl mb-4">🔬</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Interdisciplinary Excellence</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Blending psychology, anthropology, cultural evolution, and thanatology.
                  </p>
                </div>
              </div>
            </section>

            {/* ==================== METHODOLOGICAL APPROACH ==================== */}
            <section className="space-y-12">
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-4 text-slate-900">Methodological Approach</h2>
                <p className="text-slate-600 max-w-2xl mx-auto text-lg font-light">
                  Blending qualitative depth with quantitative rigor for comprehensive insights
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Qualitative Depth Panel */}
                <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-3xl p-8 shadow-xl border border-teal-200">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                      🎯
                    </div>
                    <h3 className="text-2xl font-bold text-teal-900">Qualitative Depth</h3>
                  </div>
                  <ul className="space-y-4 text-teal-800">
                    <li className="flex items-start gap-3">
                      <span className="text-teal-600 font-bold mt-1">•</span>
                      <span className="leading-relaxed">Ethnographic studies & participant observation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-600 font-bold mt-1">•</span>
                      <span className="leading-relaxed">In-depth interviews with traditional healers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-600 font-bold mt-1">•</span>
                      <span className="leading-relaxed">Focus group discussions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-600 font-bold mt-1">•</span>
                      <span className="leading-relaxed">Participatory Action Research</span>
                    </li>
                  </ul>
                </div>

                {/* Quantitative Rigor Panel */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-3xl p-8 shadow-xl border border-amber-200">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                      📊
                    </div>
                    <h3 className="text-2xl font-bold text-amber-900">Quantitative Rigor</h3>
                  </div>
                  <ul className="space-y-4 text-amber-800">
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold mt-1">•</span>
                      <span className="leading-relaxed">Longitudinal studies</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold mt-1">•</span>
                      <span className="leading-relaxed">Psychometric testing & surveys</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold mt-1">•</span>
                      <span className="leading-relaxed">Statistical modeling</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold mt-1">•</span>
                      <span className="leading-relaxed">Cross-cultural comparative research</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ==================== CORE RESEARCH AREAS ==================== */}
            <section className="space-y-12">
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-4 text-slate-900">Core Research Areas</h2>
                <p className="text-slate-600 max-w-2xl mx-auto text-lg font-light">
                  Six key domains where we advance psychological science
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Indigenous Psychology */}
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200">
                  <div className="text-6xl mb-6 text-center">🌿</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Indigenous Psychology</h3>
                  <p className="text-slate-600 text-center leading-relaxed">
                    Traditional healing practices and cultural approaches to mental health
                  </p>
                </div>

                {/* Cultural Evolution & Resilience */}
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200">
                  <div className="text-6xl mb-6 text-center">🔄</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Cultural Evolution & Resilience</h3>
                  <p className="text-slate-600 text-center leading-relaxed">
                    How cultures adapt, transmit knowledge, and build community strength
                  </p>
                </div>

                {/* Thanatology & Bereavement */}
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200">
                  <div className="text-6xl mb-6 text-center">🕊️</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Thanatology & Bereavement</h3>
                  <p className="text-slate-600 text-center leading-relaxed">
                    Death, mourning rituals, and cultural pathways to healing
                  </p>
                </div>

                {/* Youth Development */}
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200">
                  <div className="text-6xl mb-6 text-center">🌱</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Youth Development</h3>
                  <p className="text-slate-600 text-center leading-relaxed">
                    Adolescent mental health and positive youth development in African contexts
                  </p>
                </div>

                {/* Community Wellbeing */}
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200">
                  <div className="text-6xl mb-6 text-center">🤝</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Community Wellbeing</h3>
                  <p className="text-slate-600 text-center leading-relaxed">
                    Factors that foster collective resilience and flourishing
                  </p>
                </div>

                {/* Decolonizing Mental Health */}
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200">
                  <div className="text-6xl mb-6 text-center">🧠</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Decolonizing Mental Health</h3>
                  <p className="text-slate-600 text-center leading-relaxed">
                    Reimagining psychological services for African realities
                  </p>
                </div>
              </div>
            </section>

            {/* ==================== BOTTOM STATS BAR ==================== */}
            <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-12 shadow-2xl">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                {/* Active Projects */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="text-5xl font-bold text-emerald-400 mb-2">12</div>
                  <div className="text-white/90 font-medium">Active Projects</div>
                </div>

                {/* Publications */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="text-5xl font-bold text-blue-400 mb-2">28</div>
                  <div className="text-white/90 font-medium">Publications</div>
                </div>

                {/* Awards & Recognitions */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="text-5xl font-bold text-amber-400 mb-2">15</div>
                  <div className="text-white/90 font-medium">Awards & Recognitions</div>
                </div>

                {/* Countries */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="text-5xl font-bold text-purple-400 mb-2">6</div>
                  <div className="text-white/90 font-medium">Countries</div>
                </div>
              </div>
            </section>

            {/* ==================== CTA ==================== */}
            <section className="text-center py-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Collaborate or Learn More?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Whether you're a student, researcher, or organization — we welcome meaningful partnerships.
              </p>
              <Button size="lg" asChild>
                <Link href="/contact">
                  Get In Touch <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </section>
    </div>
  );
}
