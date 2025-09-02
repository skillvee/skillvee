import { currentUser } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
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
  ArrowRight
} from "lucide-react";

export default async function CompaniesPage() {
  const user = await currentUser();

  return (
    <HydrateClient>
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <Image 
                  src="/skillvee-logo.png?v=2" 
                  alt="SkillVee" 
                  width={120} 
                  height={32}
                  className="object-contain"
                  priority
                />
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/companies" className="text-blue-600 font-medium">
                  Companies
                </Link>
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                  Pricing
                </Link>
                <Link href="/faq" className="text-gray-600 hover:text-gray-900">
                  FAQ
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard">
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                  <UserButton />
                </div>
              ) : (
                <>
                  <SignUpButton>
                    <Button>Schedule Demo</Button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        </nav>

        <main className="flex-1">
          {/* Hero Section */}
          <div className="bg-white py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="md:flex md:items-center md:justify-between">
                <div className="md:w-1/2 mb-10 md:mb-0">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Hire <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">pre-vetted</span> data scientists
                  </h1>
                  <p className="text-xl text-gray-800 font-medium mb-6">
                    Stop losing $240K on failed hires
                  </p>
                  <p className="text-lg text-gray-700 mb-6">
                    Skip resume screening and technical interviews. Every candidate has already proven their skills through real projects.
                  </p>
                  <div className="bg-blue-100/50 rounded-lg p-4 mb-6 border-l-4 border-primary">
                    <p className="font-semibold text-gray-800">From hire to shipping code in 48 hours ⚡</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {user ? (
                      <Button size="lg" className="font-medium px-8 rounded-xl">
                        Schedule a demo
                      </Button>
                    ) : (
                      <SignUpButton>
                        <Button size="lg" className="font-medium px-8 rounded-xl">
                          Schedule a demo
                        </Button>
                      </SignUpButton>
                    )}
                    <Link href="/pricing">
                      <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors rounded-xl">
                        View pricing
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="md:w-1/2 flex justify-center">
                  <div className="relative w-full max-w-md">
                    <Card className="bg-white shadow-xl hover:shadow-2xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-semibold">Matched Candidates</h3>
                          <div className="text-sm text-gray-500">12 matches</div>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="bg-primary/5 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex-shrink-0">
                                <Image 
                                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80" 
                                  alt="Anna K." 
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">Anna K.</h3>
                                <p className="text-sm text-gray-500">Ex-Netflix • $140K</p>
                                <div className="flex gap-1 mt-1">
                                  <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">Validated</span>
                                  <span className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded">Portfolio</span>
                                </div>
                              </div>
                              <div className="ml-auto">
                                <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full">98% Match</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Machine Learning</span>
                                <div className="flex">
                                  {[1,2,3,4,5].map(i => (
                                    <Star key={i} className={`w-4 h-4 ${i <= 5 ? 'fill-primary text-primary' : 'fill-gray-200 text-gray-200'}`} />
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">SQL</span>
                                <div className="flex">
                                  {[1,2,3,4,5].map(i => (
                                    <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'fill-primary text-primary' : 'fill-gray-200 text-gray-200'}`} />
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Python</span>
                                <div className="flex">
                                  {[1,2,3,4,5].map(i => (
                                    <Star key={i} className={`w-4 h-4 ${i <= 5 ? 'fill-primary text-primary' : 'fill-gray-200 text-gray-200'}`} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex-shrink-0">
                                <Image 
                                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80" 
                                  alt="Michael R." 
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">Michael R.</h3>
                                <p className="text-sm text-gray-500">Ex-Google • $165K</p>
                                <div className="flex gap-1 mt-1">
                                  <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">Validated</span>
                                  <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded">Available</span>
                                </div>
                              </div>
                              <div className="ml-auto">
                                <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full">95% Match</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Deep Learning</span>
                                <div className="flex">
                                  {[1,2,3,4,5].map(i => (
                                    <Star key={i} className={`w-4 h-4 ${i <= 5 ? 'fill-primary text-primary' : 'fill-gray-200 text-gray-200'}`} />
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Data Viz</span>
                                <div className="flex">
                                  {[1,2,3,4,5].map(i => (
                                    <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'fill-primary text-primary' : 'fill-gray-200 text-gray-200'}`} />
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Cloud</span>
                                <div className="flex">
                                  {[1,2,3,4,5].map(i => (
                                    <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'fill-primary text-primary' : 'fill-gray-200 text-gray-200'}`} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-center mt-6">
                          <Button size="sm" variant="outline" className="text-gray-600 rounded-xl">View all candidates</Button>
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">From job req to team member in 48 hours ⚡</h2>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                  No resume screening. No technical interviews. No hiring mistakes.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md h-full">
                  <CardContent className="p-8 h-full flex flex-col">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0">1</div>
                      <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Search className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">Browse vetted talent</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed flex-grow">See portfolio projects, validated skills, and performance metrics. Every candidate has proven they can ship production code.</p>
                    <div className="flex items-center text-sm font-medium text-primary mt-auto">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Skip months of screening
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md h-full">
                  <CardContent className="p-8 h-full flex flex-col">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0">2</div>
                      <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                        <Users className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">Meet & approve</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed flex-grow">Quick culture-fit conversations. No whiteboard coding, no technical gotchas. Focus on what actually matters.</p>
                    <div className="flex items-center text-sm font-medium text-green-600 mt-auto">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      30-min conversations, not all-day panels
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md h-full">
                  <CardContent className="p-8 h-full flex flex-col">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0">3</div>
                      <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Zap className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">Ship code same week</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed flex-grow">They start contributing immediately. No 3-month ramp-up, no training period, no surprises.</p>
                    <div className="flex items-center text-sm font-medium text-purple-600 mt-auto">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Productive from day one
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-16 text-center">
                {user ? (
                  <Button size="lg" className="font-medium px-8 py-4 text-lg rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary transition-all duration-300">
                    See available candidates →
                  </Button>
                ) : (
                  <SignUpButton>
                    <Button size="lg" className="font-medium px-8 py-4 text-lg rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary transition-all duration-300">
                      See available candidates →
                    </Button>
                  </SignUpButton>
                )}
              </div>
            </div>
          </section>

          {/* Problem Agitation Section */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">We guarantee your success 🛡️</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  We're so confident in our candidates, we put our money where our mouth is
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="bg-white border-green-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">90-day performance guarantee</h3>
                    <p className="text-gray-600">If they don't ship working code in 30 days or underperform in 90 days, we'll replace them free of charge.</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-green-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No upfront fees</h3>
                    <p className="text-gray-600">Only pay when you approve a candidate. No subscription, no setup costs, no risk on your end.</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-green-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-green-600" />
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-20">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-purple/10 px-6 py-2 rounded-full mb-6">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary">Why companies choose us</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-primary to-purple-600 bg-clip-text text-transparent">
                  The hiring experience you've been waiting for
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Stop playing hiring roulette. Every candidate is pre-validated through real projects.
                </p>
              </div>
              
              {/* Hero Feature Card */}
              <div className="mb-16">
                <Card className="bg-gradient-to-br from-primary/5 via-white to-purple/5 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500">
                  <CardContent className="p-12">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                      <div>
                        <div className="inline-flex items-center gap-3 mb-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center">
                            <Zap className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-4xl">⚡</div>
                        </div>
                        <h3 className="text-3xl font-bold mb-4 text-gray-900">Zero interview waste</h3>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                          Skip the resume screening circus. Every candidate has already built real products, solved real problems, and shipped working code. You only meet people who can actually do the job.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Portfolio verified</span>
                          </div>
                          <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Skills tested</span>
                          </div>
                          <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
                            <CheckCircle className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-800">References checked</span>
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple/20 rounded-3xl blur-xl"></div>
                        <div className="relative bg-white rounded-2xl p-8 shadow-xl">
                          <div className="text-center mb-6">
                            <div className="text-sm text-gray-500 mb-2">Traditional hiring</div>
                            <div className="text-3xl font-bold text-red-500 mb-1">46%</div>
                            <div className="text-sm text-gray-600">of hires fail</div>
                          </div>
                          <div className="border-t pt-6 text-center">
                            <div className="text-sm text-gray-500 mb-2">With SkillVee</div>
                            <div className="text-3xl font-bold text-green-500 mb-1">0%</div>
                            <div className="text-sm text-gray-600">failed placements</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Two Column Features */}
              <div className="grid md:grid-cols-2 gap-8 mb-16">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl">🚀</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">48-hour placement guarantee</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      From "yes" to working team member in under 2 days. No 3-month hiring cycles, no endless interviews, no waiting around.
                    </p>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-green-600">48 hours</div>
                      <div className="text-sm text-gray-500">vs. 3+ months traditional</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl">🛡️</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">Performance-backed hiring</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      We don't just place candidates, we guarantee results. If they don't ship working code in 30 days, full refund.
                    </p>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-purple-600">90%</div>
                      <div className="text-sm text-gray-500">still performing after 12 months</div>
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
          <section className="relative py-24 overflow-hidden" style={{background: 'linear-gradient(135deg, #1E3A8A 0%, #1e40af 50%, #1d4ed8 100%)'}}>
            {/* Background Effects */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width=%2760%27%20height=%2760%27%20viewBox=%270%200%2060%2060%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27none%27%20fill-rule=%27evenodd%27%3E%3Cg%20fill=%27%2314B8A6%27%20fill-opacity=%270.05%27%3E%3Cpath%20d=%27m36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl" style={{backgroundColor: 'rgba(20, 184, 166, 0.1)'}}></div>
              <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl" style={{backgroundColor: 'rgba(20, 184, 166, 0.08)'}}></div>
            </div>
            
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left side - Content */}
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: '#14B8A6'}}></div>
                    <span className="text-sm font-medium text-white">Available now</span>
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
                    Ready to hire data scientists who actually 
                    <span className="relative">
                      <span style={{background: 'linear-gradient(135deg, #14B8A6, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}> ship code?</span>
                      <div className="absolute -bottom-2 left-0 w-full h-1 rounded-full" style={{background: 'linear-gradient(135deg, #14B8A6, #0d9488)'}}></div>
                    </span>
                  </h2>
                  
                  <p className="text-xl text-white/90 mb-8 leading-relaxed">
                    See how pre-validated talent can transform your hiring. Every candidate has proven they can build real products and solve real problems.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <Link href="/demo">
                      <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-medium px-8 py-4 rounded-xl shadow-2xl hover:shadow-white/20 transition-all duration-300 group">
                        <span className="mr-2">Schedule a demo</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button size="lg" className="bg-transparent text-white border-2 border-white/30 hover:bg-white hover:text-primary transition-all duration-300 font-medium px-8 py-4 rounded-xl backdrop-blur-sm">
                        View pricing
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center gap-8 text-white/80 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>No setup fees</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>90-day guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>48-hour placement</span>
                    </div>
                  </div>
                </div>

                {/* Right side - Visual Element */}
                <div className="relative">
                  <div className="absolute -inset-4 rounded-3xl blur-2xl" style={{background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(13, 148, 136, 0.15))'}}></div>
                  
                  <Card className="relative bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                    <CardContent className="p-8">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background: 'linear-gradient(135deg, #14B8A6, #0d9488)'}}>
                          <Zap className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Transform your hiring</h3>
                        <p className="text-white/80">Join the companies already winning with pre-vetted talent</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                          <span className="text-white/90">Time to hire</span>
                          <div className="flex items-center gap-2">
                            <span className="text-red-400 line-through">4 months</span>
                            <ArrowRight className="w-4 h-4 text-white/60" />
                            <span className="font-bold" style={{color: '#14B8A6'}}>48 hours</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                          <span className="text-white/90">Interview rounds</span>
                          <div className="flex items-center gap-2">
                            <span className="text-red-400 line-through">5-8 rounds</span>
                            <ArrowRight className="w-4 h-4 text-white/60" />
                            <span className="font-bold" style={{color: '#14B8A6'}}>1 culture fit</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                          <span className="text-white/90">Failure rate</span>
                          <div className="flex items-center gap-2">
                            <span className="text-red-400 line-through">46%</span>
                            <ArrowRight className="w-4 h-4 text-white/60" />
                            <span className="font-bold" style={{color: '#14B8A6'}}>0%</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-white/20 text-center">
                        <div className="text-3xl font-bold text-white mb-1">10x faster</div>
                        <div className="text-white/80 text-sm">than traditional hiring</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        {/* Footer */}
        <footer className="bg-gray-50 text-gray-900 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">SV</span>
                  </div>
                  <span className="text-xl font-semibold">SkillVee</span>
                </div>
                <p className="text-gray-600">
                  Connecting data scientists with their dream careers.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">For Candidates</h3>
                <ul className="space-y-2 text-gray-600">
                  <li><Link href="/candidates" className="hover:text-gray-900">Apply Now</Link></li>
                  <li><Link href="/interview" className="hover:text-gray-900">Practice Interviews</Link></li>
                  <li><Link href="/resources" className="hover:text-gray-900">Resources</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">For Companies</h3>
                <ul className="space-y-2 text-gray-600">
                  <li><Link href="/companies" className="hover:text-gray-900">Post Jobs</Link></li>
                  <li><Link href="/pricing" className="hover:text-gray-900">Pricing</Link></li>
                  <li><Link href="/enterprise" className="hover:text-gray-900">Enterprise</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-600">
                  <li><Link href="/about" className="hover:text-gray-900">About Us</Link></li>
                  <li><Link href="/blog" className="hover:text-gray-900">Blog</Link></li>
                  <li><Link href="/careers" className="hover:text-gray-900">Careers</Link></li>
                  <li><Link href="/contact" className="hover:text-gray-900">Contact</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 mb-4 md:mb-0">
                © 2025 SkillVee. All rights reserved.
              </p>
              <div className="flex space-x-6 text-gray-500">
                <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </HydrateClient>
  );
}