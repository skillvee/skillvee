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
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SV</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">SkillVee</span>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/candidates" className="text-gray-600 hover:text-gray-900">
                  Candidates
                </Link>
                <Link href="/companies" className="text-primary font-medium">
                  Companies
                </Link>
                <Link href="/interview" className="text-gray-600 hover:text-gray-900">
                  AI Interview
                </Link>
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                  Pricing
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
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16 md:py-24">
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

          {/* Problem Agitation Section */}
          <section className="py-16 bg-red-50 border-t border-red-100">
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
                <p className="text-xl text-gray-700 font-medium mb-4">
                  Your competitors are already using pre-validated talent while you're still guessing 📊
                </p>
                <p className="text-xs text-gray-400">
                  *Sources: SHRM 2024, Leadership IQ, Harvard Business Review, Bureau of Labor Statistics. Individual results may vary.
                </p>
              </div>
            </div>
          </section>

          {/* Key Benefits Section */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Why companies choose us 🏆</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  We help you find the best data science talent, validated through practical assessments and ready to make an impact.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-white hover:shadow-lg transition-all duration-300 border-l-4 border-primary">
                  <CardContent className="p-6">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary mb-4 w-fit">
                      <Search size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Zero interview waste</h3>
                    <p className="text-gray-600 mb-3">Only talk to candidates who've already proven they can code. Every data scientist has completed real projects, not just passed interviews.</p>
                    <div className="text-sm font-medium text-primary">✓ Portfolio verified ✓ Skills tested ✓ References checked</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white hover:shadow-lg transition-all duration-300 border-l-4 border-green-500">
                  <CardContent className="p-6">
                    <div className="p-3 rounded-lg bg-green-100 text-green-600 mb-4 w-fit">
                      <Clock size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">48-hour placement guarantee</h3>
                    <p className="text-gray-600 mb-3">From approval to working candidate in under 2 days. Skip the 3-month hiring cycles and start seeing results immediately.</p>
                    <div className="text-sm font-medium text-green-600">Average placement time: 1.3 days</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white hover:shadow-lg transition-all duration-300 border-l-4 border-purple-500">
                  <CardContent className="p-6">
                    <div className="p-3 rounded-lg bg-purple-100 text-purple-600 mb-4 w-fit">
                      <Shield size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Performance-backed hiring</h3>
                    <p className="text-gray-600 mb-3">We guarantee results, not just placements. If they don't ship working code in 30 days, full refund.</p>
                    <div className="text-sm font-medium text-purple-600">90% of hires still performing after 12 months</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works 🔍</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Our streamlined process makes hiring data science talent quick and effective.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="relative">
                  <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
                  <Card className="ml-4 bg-white hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">Search for candidates</h3>
                      <p className="text-gray-600">Specify your requirements for data science roles, from technical skills to domain expertise, and browse matched candidates.</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</div>
                  <Card className="ml-4 bg-white hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">Meet candidates</h3>
                      <p className="text-gray-600">Schedule interviews with pre-vetted candidates who match your requirements. Focus on team fit and specific project needs.</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</div>
                  <Card className="ml-4 bg-white hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">Hire & onboard quickly</h3>
                      <p className="text-gray-600">Make offers to candidates with confidence and get them working on your projects within 24 hours.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="mt-12 text-center">
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
              </div>
            </div>
          </section>


          {/* Risk Reversal Section */}
          <section className="py-16 bg-green-50">
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">48-hour replacement</h3>
                    <p className="text-gray-600">If a candidate quits unexpectedly, we'll find you a replacement within 48 hours at no additional cost.</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-12 text-center bg-white rounded-xl p-8 border-2 border-green-200">
                <p className="text-2xl font-bold text-gray-900 mb-2">⚠️ Limited Availability</p>
                <p className="text-lg text-gray-600 mb-4">
                  We currently accept only <span className="font-semibold text-green-600">12 new companies per month</span> to maintain quality
                </p>
                <p className="text-sm text-gray-500">Next available demo slot: <span className="font-medium">Thursday, January 9th</span></p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-primary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Stop losing to competitors with better talent 🚀</h2>
              <p className="text-xl text-white/90 font-medium mb-2">
                Book your demo now - only 3 spots left this month
              </p>
              <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
                Join 200+ companies that have eliminated hiring risk with pre-validated data scientists
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-medium px-8 rounded-xl">
                    Schedule a demo
                  </Button>
                ) : (
                  <SignUpButton>
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-medium px-8 rounded-xl">
                      Schedule a demo
                    </Button>
                  </SignUpButton>
                )}
                <Link href="/pricing">
                  <Button size="lg" className="bg-primary text-white border-2 border-white hover:bg-white hover:text-primary transition-colors font-medium px-8 rounded-xl">
                    View pricing
                  </Button>
                </Link>
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