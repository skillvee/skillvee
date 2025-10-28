import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import Image from "next/image";
import { type Metadata } from "next";
import { HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Search,
  Users,
  CheckCircle,
  Zap,
  Briefcase,
  Clock,
  ThumbsUp,
  Shield,
  Star,
  ArrowRight,
  Brain
} from "lucide-react";
import Navigation from "~/components/navigation";
import { generateMetadata as genMeta } from "~/lib/seo/metadata";

export const metadata: Metadata = genMeta({
  title: "For Companies - Hire Pre-Vetted Data Science Talent Fast",
  description:
    "Access a pool of interview-ready data scientists who have proven their skills through AI-powered assessments. Streamline your hiring process and find qualified candidates faster.",
  path: "/companies",
  keywords: [
    "hire data scientists",
    "data science recruitment",
    "technical hiring platform",
    "pre-vetted candidates",
    "AI-powered hiring",
    "talent acquisition",
  ],
});

export default async function CompaniesPage() {
  const user = await currentUser();

  return (
    <HydrateClient>
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <Navigation currentPage="companies" />

        <main className="flex-1">
          {/* Hero Section */}
          <div className="bg-white py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-6">
              <div className="md:flex md:items-center md:justify-between">
                <div className="md:w-1/2 mb-10 md:mb-0 animate-fade-in">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-slide-up">
                    Hire <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">pre-vetted</span> data scientists
                  </h1>
                  <p className="text-xl text-gray-800 font-medium mb-6 animate-fade-in-delay">
                    Stop losing $240K on failed hires
                  </p>
                  <p className="text-lg text-gray-700 mb-6 animate-fade-in-delay-2">
                    Skip resume screening and technical interviews. Every candidate has already proven their skills through real projects.
                  </p>
                  <div className="bg-blue-100/50 rounded-lg p-4 mb-6 border-l-4 border-blue-600 animate-fade-in-delay-3">
                    <p className="font-semibold text-gray-800">From hire to shipping code in 48 hours ⚡</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay-4">
                    <Link href="/demo">
                      <Button size="lg" className="w-full sm:w-auto min-w-[200px] bg-primary hover:bg-primary/90 text-primary-foreground transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                        Schedule a demo
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto min-w-[200px] bg-white border border-primary text-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105 hover:shadow-md">
                        View pricing
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="md:w-1/2 flex justify-center animate-slide-left">
                  <div className="relative w-full max-w-md">
                    <Card className="bg-white shadow-xl hover:shadow-2xl transition-shadow card-hover">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-semibold">Matched Candidates</h3>
                          <div className="text-sm text-gray-500">12 matches</div>
                        </div>
                        
                        <div className="space-y-4 stagger-animation">
                          <div className="bg-green-50 rounded-lg p-3 border border-green-200 card-hover">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-shrink-0">
                                <Image
                                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
                                  alt="Anna K."
                                  width={32}
                                  height={32}
                                  className="rounded-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-sm">Anna K.</h3>
                                <p className="text-xs text-gray-500">Ex-Netflix • $140K</p>
                                <div className="flex gap-1 mt-1">
                                  <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded">✓ Skills Verified</span>
                                  <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">5 Projects</span>
                                </div>
                              </div>
                              <div className="ml-auto">
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">98% Match</span>
                              </div>
                            </div>
                            <p className="text-xs text-green-700 ml-8">⭐ Top performer - Proven ML expertise</p>
                          </div>
                          
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 card-hover">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-shrink-0">
                                <Image 
                                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80" 
                                  alt="Michael R." 
                                  width={32}
                                  height={32}
                                  className="rounded-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-sm">Michael R.</h3>
                                <p className="text-xs text-gray-500">Ex-Google • $165K</p>
                                <div className="flex gap-1 mt-1">
                                  <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded">✓ Skills Verified</span>
                                  <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">Available</span>
                                </div>
                              </div>
                              <div className="ml-auto">
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">95% Match</span>
                              </div>
                            </div>
                            <p className="text-xs text-blue-700 ml-8">🚀 Strong candidate - Deep learning expert</p>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 card-hover">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-shrink-0">
                                <Image 
                                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80" 
                                  alt="Sarah J." 
                                  width={32}
                                  height={32}
                                  className="rounded-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-sm">Sarah J.</h3>
                                <p className="text-xs text-gray-500">Ex-Apple • $125K</p>
                                <div className="flex gap-1 mt-1">
                                  <span className="bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded">⚡ Skills Tested</span>
                                  <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">Junior</span>
                                </div>
                              </div>
                              <div className="ml-auto">
                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">88% Match</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 ml-8">📈 Good potential - Developing skills</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-center mt-6">
                          <Link href="/demo">
                            <Button size="sm" variant="outline" className="text-gray-600 rounded-xl">View all candidates</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-6">
              <div className="text-center mb-16 animate-on-scroll">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">From job req to team member in 48 hours ⚡</h2>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                  No resume screening. No technical interviews. No hiring mistakes.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md h-full animate-on-scroll-zoom card-hover">
                  <CardContent className="p-8 h-full flex flex-col">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0 animate-bounce-subtle">1</div>
                      <div className="w-16 h-16 bg-blue-600/10 rounded-xl flex items-center justify-center animate-float">
                        <Search className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">Browse vetted talent</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed flex-grow">See portfolio projects, validated skills, and performance metrics. Every candidate has proven they can ship production code.</p>
                    <div className="flex items-center text-sm font-medium text-blue-600 mt-auto">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Skip months of screening
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md h-full">
                  <CardContent className="p-8 h-full flex flex-col">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0">2</div>
                      <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">Meet & approve</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed flex-grow">Quick culture-fit conversations. No whiteboard coding, no technical gotchas. Focus on what actually matters.</p>
                    <div className="flex items-center text-sm font-medium text-blue-600 mt-auto">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      30-min conversations, not all-day panels
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md h-full">
                  <CardContent className="p-8 h-full flex flex-col">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0">3</div>
                      <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Zap className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">Ship code same week</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed flex-grow">They start contributing immediately. No 3-month ramp-up, no training period, no surprises.</p>
                    <div className="flex items-center text-sm font-medium text-blue-600 mt-auto">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Productive from day one
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-16 text-center">
                <Link href="/demo">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground transform hover:scale-105 transition-all duration-300 hover:shadow-lg px-8">
                    See available candidates →
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Problem Agitation Section */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">The hidden cost of traditional data science hiring</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Most companies lose months and thousands of dollars on failed data science hires
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="bg-white border-red-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold text-red-600 mb-2">$240K</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost of a bad hire</h3>
                    <p className="text-gray-600">Considers salary, training, lost productivity and replacement costs</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-red-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold text-red-600 mb-2">46%</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">of hires fail completely</h3>
                    <p className="text-gray-600">Nearly half of new hires fail within 18 months</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-red-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold text-red-600 mb-2">4 months</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Time to replace a bad hire</h3>
                    <p className="text-gray-600">10 weeks to realize they won't work out, plus 6 weeks to find replacement</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-12 text-center">
                <p className="text-xs text-gray-400">
                  *Sources: SHRM 2024, Leadership IQ, Harvard Business Review, Bureau of Labor Statistics. Individual results may vary.
                </p>
              </div>
            </div>
          </section>

          {/* Risk Reversal Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">We guarantee your success 🛡️</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  We're so confident in our candidates, we put our money where our mouth is
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="bg-white border-blue-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">90-day performance guarantee</h3>
                    <p className="text-gray-600">If they don't ship working code in 30 days or underperform in 90 days, we'll replace them free of charge.</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-blue-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No upfront fees</h3>
                    <p className="text-gray-600">Only pay when you approve a candidate. No subscription, no setup costs, no risk on your end.</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-blue-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Priority replacement support</h3>
                    <p className="text-gray-600">If a candidate quits unexpectedly, you get priority access to our candidate pool for fast replacement at no additional cost.</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  We accept a limited number of companies per month to maintain quality
                </p>
              </div>
            </div>
          </section>

          {/* Key Benefits Section */}
          <section className="py-20 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-6">
              <div className="text-center mb-20">
                <div className="inline-flex items-center gap-2 bg-blue-50 px-6 py-2 rounded-full mb-6">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary">Why companies choose us</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="text-gray-900">The hiring experience </span>
                  <span className="text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">you've been waiting for</span>
                  The hiring experience you've been waiting for
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Stop playing hiring roulette. Every candidate is pre-validated through real projects.
                </p>
              </div>
              
              {/* Hero Feature Card */}
              <div className="mb-16">
                <Card className="bg-gradient-to-br from-blue-600/5 via-white to-yellow-200/5 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500">
                  <CardContent className="p-12">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                      <div>
                        <div className="inline-flex items-center gap-3 mb-6">
                          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                            <Zap className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-4xl">⚡</div>
                        </div>
                        <h3 className="text-3xl font-bold mb-4 text-gray-900">Zero interview waste</h3>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                          Skip the resume screening circus. Every candidate has already built real products, solved real problems, and shipped working code. You only meet people who can actually do the job.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Portfolio verified</span>
                          </div>
                          <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Skills tested</span>
                          </div>
                          <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">References checked</span>
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-yellow-200/20 rounded-3xl blur-xl"></div>
                        <div className="relative bg-white rounded-2xl p-8 shadow-xl">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                              <p className="text-sm text-gray-700">Pre-validated through real projects</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                              <p className="text-sm text-gray-700">Proven production code experience</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                              <p className="text-sm text-gray-700">Verified problem-solving skills</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Two Column Features */}
              <div className="grid md:grid-cols-2 gap-8 mb-16">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">48-hour placement guarantee</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      From "yes" to working team member in under 2 days. No 3-month hiring cycles, no endless interviews, no waiting around.
                    </p>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">Fast placement</div>
                      <div className="text-sm text-gray-500">Skip lengthy hiring cycles</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">Performance-backed hiring</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      We don't just place candidates, we guarantee results. If they don't ship working code in 30 days, full refund.
                    </p>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">Quality hires</div>
                      <div className="text-sm text-gray-500">Pre-validated candidates</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom CTA Section */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-gray-100 px-6 py-3 rounded-full mb-8">
                  <div className="flex -space-x-2">
                    <Image src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80" alt="" width={32} height={32} className="rounded-full border-2 border-white" />
                    <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80" alt="" width={32} height={32} className="rounded-full border-2 border-white" />
                    <Image src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80" alt="" width={32} height={32} className="rounded-full border-2 border-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Join the companies hiring smarter</span>
                </div>
              </div>
            </div>
          </section>


          {/* CTA */}
          <section className="py-12 sm:py-16 bg-gradient-to-br from-primary via-primary to-primary/90 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full"></div>
              <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full"></div>
              <div className="absolute bottom-20 left-1/4 w-12 h-12 border-2 border-white rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-24 h-24 border border-white rounded-full"></div>
            </div>

            <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-6 text-center relative z-10">
              <Badge className="bg-yellow-400 text-yellow-900 mb-6 sm:mb-8 text-sm font-semibold">
                ✨ Available now
              </Badge>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Ready to hire data scientists who actually <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">ship code?</span>
              </h2>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed">
                See how pre-validated talent can transform your hiring. Every candidate has proven they can build real products and solve real problems.
              </p>

              <div className="flex justify-center mb-8 sm:mb-12">
                <Link href="/demo">
                  <Button size="lg" className="bg-white text-primary hover:bg-gray-50 shadow-xl font-semibold transform hover:scale-105 transition-all duration-300">
                    <Zap className="w-5 h-5 mr-2" />
                    Schedule a Demo Now
                  </Button>
                </Link>
              </div>

            </div>
          </section>
        </main>
        
        {/* Footer */}
        <footer className="bg-gray-100 text-gray-800 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
              <div>
                <div className="mb-4">
                  <Image 
                    src="/skillvee-logo.png?v=2" 
                    alt="SkillVee" 
                    width={120} 
                    height={32}
                    className="object-contain"
                  />
                </div>
                <p className="text-gray-600 mb-4">
                  Revolutionizing how talent meets opportunity in the age of AI.
                </p>
                <p className="text-gray-600">
                  <a href="mailto:hi@skillvee.com" className="hover:text-gray-800">
                    hi@skillvee.com
                  </a>
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 text-gray-800">For Candidates</h3>
                <ul className="space-y-2 text-gray-600">
                  <li><Link href="/candidates" className="hover:text-gray-800">Get Started</Link></li>
                  <li><Link href="/practice" className="hover:text-gray-800">Practice Interviews</Link></li>
                  <li><Link href="/faq" className="hover:text-gray-800">FAQ</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 text-gray-800">For Companies</h3>
                <ul className="space-y-2 text-gray-600">
                  <li><Link href="/companies" className="hover:text-gray-800">Get in Touch</Link></li>
                  <li><Link href="/pricing" className="hover:text-gray-800">Pricing</Link></li>
                  <li><Link href="/demo" className="hover:text-gray-800">Demo</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 text-gray-800">Legal</h3>
                <ul className="space-y-2 text-gray-600">
                  <li><Link href="/privacy" className="hover:text-gray-800">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-gray-800">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-300 pt-8 text-center">
              <p className="text-gray-600">
                © 2025 SkillVee. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </HydrateClient>
  );
}