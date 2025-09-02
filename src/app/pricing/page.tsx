import { currentUser } from "@clerk/nextjs/server";
import { SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { 
  CheckCircle, 
  Info, 
  Users, 
  Briefcase, 
  Zap,
  Shield,
  Clock,
  Star,
  ArrowRight
} from "lucide-react";

export default async function PricingPage() {
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
                <Link href="/companies" className="text-gray-600 hover:text-gray-900">
                  Companies
                </Link>
                <Link href="/pricing" className="text-primary font-medium">
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
                <SignInButton>
                  <Button>Sign In</Button>
                </SignInButton>
              )}
            </div>
          </div>
        </nav>

        <main className="flex-1">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Simple, transparent <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">pricing</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Free for data scientists forever. Premium talent acquisition for companies looking to hire fast.
              </p>
            </div>
          </div>

          {/* Pricing Cards */}
          <section className="py-16 bg-white relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* For Data Scientists */}
                <Card className="p-8 bg-white border-2 border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1" style={{backgroundColor: '#14B8A6'}}></div>
                  <CardContent className="p-0">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-bold mb-2 text-gray-900">For Data Scientists</h3>
                        <div className="flex items-end gap-2 mb-2">
                          <span className="text-4xl font-bold text-gray-900">$0</span>
                          <span className="text-gray-500 mb-1">/ forever</span>
                        </div>
                        <p className="text-gray-600">Build your career with top companies</p>
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-medium" style={{backgroundColor: 'rgba(20, 184, 166, 0.1)', color: '#14B8A6'}}>
                        Always Free
                      </div>
                    </div>
                    
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5" style={{color: '#14B8A6'}} />
                        <div>
                          <span className="text-gray-900 font-medium">Showcase your skills with verified portfolios</span>
                          <p className="text-gray-600 text-sm">Upload your best projects and get them validated by our AI</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5" style={{color: '#14B8A6'}} />
                        <div>
                          <span className="text-gray-900 font-medium">Apply to hundreds of companies instantly</span>
                          <p className="text-gray-600 text-sm">One profile, multiple opportunities with top tech companies</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5" style={{color: '#14B8A6'}} />
                        <div>
                          <span className="text-gray-900 font-medium">AI-powered interview coaching</span>
                          <p className="text-gray-600 text-sm">Practice real scenarios and get personalized feedback</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5" style={{color: '#14B8A6'}} />
                        <div>
                          <span className="text-gray-900 font-medium">Skip the technical interview grind</span>
                          <p className="text-gray-600 text-sm">Your portfolio speaks for itself - no more whiteboard coding</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5" style={{color: '#14B8A6'}} />
                        <div>
                          <span className="text-gray-900 font-medium">Direct access to hiring managers</span>
                          <p className="text-gray-600 text-sm">Get matched directly with companies looking for your skills</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5" style={{color: '#14B8A6'}} />
                        <div>
                          <span className="text-gray-900 font-medium">Exclusive data science resources</span>
                          <p className="text-gray-600 text-sm">Access our library of guides, templates, and career tools</p>
                        </div>
                      </li>
                    </ul>
                    
                    <Link href="/candidates">
                      <Button size="lg" className="w-full font-medium rounded-xl" style={{backgroundColor: '#14B8A6'}}>
                        Join as Data Scientist
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
                
                {/* For Companies */}
                <Card className="p-8 text-white rounded-xl shadow-xl relative overflow-hidden" style={{background: 'linear-gradient(135deg, #1E3A8A 0%, #1e40af 50%, #1d4ed8 100%)'}}>
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl" style={{backgroundColor: 'rgba(20, 184, 166, 0.15)'}}></div>
                  <CardContent className="p-0 relative">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-bold mb-2 text-white">For Companies</h3>
                        <div className="flex items-end gap-2 mb-2">
                          <span className="text-4xl font-bold text-white">Custom</span>
                          <span className="text-white/80 mb-1">pricing</span>
                        </div>
                        <p className="text-white/80">Hire vetted talent in 48 hours</p>
                      </div>
                      <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white">
                        Most Popular
                      </div>
                    </div>
                    
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5" style={{color: '#14B8A6'}} />
                        <div>
                          <span className="text-white font-medium">Access pre-vetted data scientists only</span>
                          <p className="text-white/70 text-sm">Every candidate has proven portfolio projects - no resume screening needed</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5" style={{color: '#14B8A6'}} />
                        <div>
                          <span className="text-white font-medium">48-hour placement guarantee</span>
                          <p className="text-white/70 text-sm">From "yes" to working team member in under 2 days</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5" style={{color: '#14B8A6'}} />
                        <div>
                          <span className="text-white font-medium">90-day performance guarantee</span>
                          <p className="text-white/70 text-sm">If they don't perform, we'll replace them free of charge</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5" style={{color: '#14B8A6'}} />
                        <div>
                          <span className="text-white font-medium">AI-powered candidate matching</span>
                          <p className="text-white/70 text-sm">Smart algorithms match candidates to your exact requirements</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5" style={{color: '#14B8A6'}} />
                        <div>
                          <span className="text-white font-medium">Dedicated account manager</span>
                          <p className="text-white/70 text-sm">Personal support to optimize your hiring process</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5" style={{color: '#14B8A6'}} />
                        <div>
                          <span className="text-white font-medium">No upfront costs</span>
                          <p className="text-white/70 text-sm">Only pay when you approve a candidate - zero risk</p>
                        </div>
                      </li>
                    </ul>
                    
                    <Link href="/demo">
                      <Button size="lg" className="w-full bg-white text-primary hover:bg-gray-100 font-medium rounded-xl">
                        Schedule Demo
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              {/* Value Comparison */}
              <div className="mt-16 text-center">
                <div className="inline-flex items-center gap-2 bg-gray-100 px-6 py-3 rounded-full mb-8">
                  <span className="text-sm font-medium text-gray-700">Why companies choose SkillVee</span>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Traditional hiring</h3>
                    <p className="text-gray-600 text-sm mb-4">4+ months to find qualified candidates</p>
                    <div className="text-2xl font-bold text-red-500">$240K</div>
                    <div className="text-gray-500 text-sm">average cost of bad hire</div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{backgroundColor: 'rgba(20, 184, 166, 0.1)'}}>
                      <Zap className="w-8 h-8" style={{color: '#14B8A6'}} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">SkillVee hiring</h3>
                    <p className="text-gray-600 text-sm mb-4">48 hours to hire proven talent</p>
                    <div className="text-2xl font-bold" style={{color: '#14B8A6'}}>0%</div>
                    <div className="text-gray-500 text-sm">failed placements to date</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Frequently asked questions</h2>
                <p className="text-lg text-gray-600">
                  Everything you need to know about our pricing and services.
                </p>
              </div>
              
              <div className="grid gap-8 md:grid-cols-2">
                <Card className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">Is it really free for data scientists?</h3>
                    <p className="text-gray-600">
                      Yes, our platform is completely free forever for data scientists. We make our revenue by helping companies find great talent, so candidates never pay anything.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">How does company pricing work?</h3>
                    <p className="text-gray-600">
                      We offer success-based pricing with no upfront costs. You only pay when you successfully hire a candidate we've matched to your role.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">Do you offer trials for companies?</h3>
                    <p className="text-gray-600">
                      Yes! We offer a free demo and consultation. You can also browse candidate profiles before committing to ensure the quality meets your standards.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">What's your placement guarantee?</h3>
                    <p className="text-gray-600">
                      We guarantee 48-hour placement and 90-day performance. If a hire doesn't work out in the first 90 days, we'll find a replacement at no additional cost.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Enterprise Section */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Enterprise solutions</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  For organizations with large-scale data science hiring needs, we offer customized enterprise solutions.
                </p>
              </div>
              
              <Card className="p-8 bg-white border-0 shadow-xl">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{backgroundColor: 'rgba(30, 58, 138, 0.1)'}}>
                        <Users className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">Volume hiring</h3>
                      <p className="text-gray-600">
                        Specialized solutions for companies looking to hire multiple data science positions simultaneously with bulk pricing.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{backgroundColor: 'rgba(30, 58, 138, 0.1)'}}>
                        <Briefcase className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">Custom assessments</h3>
                      <p className="text-gray-600">
                        Develop company-specific challenges and evaluation criteria to assess candidates against your unique requirements.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{backgroundColor: 'rgba(30, 58, 138, 0.1)'}}>
                        <Shield className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">Dedicated support</h3>
                      <p className="text-gray-600">
                        Get a dedicated account team to manage your entire talent pipeline and optimize your hiring process.
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Link href="/demo">
                      <Button size="lg" className="font-medium px-8 rounded-xl" style={{backgroundColor: '#1E3A8A'}}>
                        Contact Enterprise Sales
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="overflow-hidden border-0 shadow-xl" style={{background: 'linear-gradient(135deg, #1E3A8A 0%, #1e40af 100%)'}}>
                <CardContent className="p-0">
                  <div className="md:flex">
                    <div className="p-8 md:p-12 md:w-2/3">
                      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to transform your hiring?</h2>
                      <p className="text-xl text-white/90 mb-8">
                        Join hundreds of companies already hiring pre-vetted data science talent through SkillVee. See the difference quality makes.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/demo">
                          <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-medium px-8 rounded-xl">
                            Schedule Demo
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                        <Link href="/candidates">
                          <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white hover:text-primary font-medium px-8 rounded-xl">
                            Join as Candidate
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className="hidden md:block md:w-1/3 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                      <div className="absolute top-8 right-8 w-32 h-32 rounded-full blur-2xl" style={{backgroundColor: 'rgba(20, 184, 166, 0.2)'}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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