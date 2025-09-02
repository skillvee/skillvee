import { currentUser } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { 
  CheckCircle, 
  Users, 
  Briefcase, 
  Zap,
  Shield,
  Clock,
  ArrowRight
} from "lucide-react";
import Navigation from "~/components/navigation";

export default async function PricingPage() {
  const user = await currentUser();

  return (
    <HydrateClient>
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <Navigation currentPage="pricing" />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-white py-20">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <Badge className="bg-green-50 text-green-700 border-green-200 w-fit mx-auto mb-6 animate-bounce-in">
                ✨ Free Forever for Data Scientists
              </Badge>
              <h1 className="text-5xl font-bold mb-6 leading-tight animate-fade-in">
                Simple, transparent <span className="text-blue-600">pricing</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in-delay">
                Free for data scientists forever. Premium talent acquisition for companies looking to hire fast.
              </p>
            </div>
          </section>

          {/* Pricing Cards */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* For Data Scientists */}
                <Card className="bg-white hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-100 relative animate-on-scroll-left card-hover">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <Badge className="bg-green-50 text-green-700 border-green-200 mb-4">
                        ✨ Always Free
                      </Badge>
                      <h3 className="text-3xl font-bold mb-4 text-gray-900">For <span className="text-blue-600">Data Scientists</span></h3>
                      <div className="mb-4">
                        <span className="text-5xl font-bold text-gray-900">$0</span>
                        <span className="text-gray-500 text-lg ml-2">forever</span>
                      </div>
                      <p className="text-gray-600">Build your career with top companies</p>
                    </div>
                    
                    <div className="space-y-4 mb-8 stagger-animation">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 animate-pulse-subtle" />
                        <span className="text-gray-700">AI-powered interview practice</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 animate-pulse-subtle" />
                        <span className="text-gray-700">Instant feedback & coaching</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 animate-pulse-subtle" />
                        <span className="text-gray-700">Real company case studies</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 animate-pulse-subtle" />
                        <span className="text-gray-700">Job opportunity matching</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 animate-pulse-subtle" />
                        <span className="text-gray-700">Career resources & guides</span>
                      </div>
                    </div>
                    
                    {user ? (
                      <Link href="/interview">
                        <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 btn-hover-lift">
                          Start Practicing Free
                        </Button>
                      </Link>
                    ) : (
                      <SignUpButton>
                        <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 btn-hover-lift">
                          Start Practicing Free
                        </Button>
                      </SignUpButton>
                    )}
                  </CardContent>
                </Card>
                
                {/* For Companies */}
                <Card className="bg-white hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-100 relative animate-on-scroll-right card-hover">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 mb-4">
                        ⚡ 48-Hour Placement
                      </Badge>
                      <h3 className="text-3xl font-bold mb-4 text-gray-900">For <span className="text-blue-600">Companies</span></h3>
                      <div className="mb-4">
                        <span className="text-5xl font-bold text-gray-900">25%</span>
                        <span className="text-gray-500 text-lg ml-2">success fee</span>
                      </div>
                      <p className="text-gray-600">No upfront costs • Pay only when you hire or hourly for freelance</p>
                    </div>
                    
                    <div className="space-y-4 mb-8 stagger-animation">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 animate-pulse-subtle" />
                        <span className="text-gray-700">Pre-vetted talent pool</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 animate-pulse-subtle" />
                        <span className="text-gray-700">48-hour placement</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 animate-pulse-subtle" />
                        <span className="text-gray-700">90-day guarantee</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 animate-pulse-subtle" />
                        <span className="text-gray-700">AI-powered matching</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 animate-pulse-subtle" />
                        <span className="text-gray-700">No upfront costs</span>
                      </div>
                    </div>
                    
                    <Link href="/demo">
                      <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 btn-hover-lift">
                        Let's Talk
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              {/* Simple CTA */}
              <div className="mt-16 text-center animate-on-scroll">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Questions about pricing?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Have more questions? Check out our complete FAQ or get in touch.
                  </p>
                  <Link href="/faq">
                    <Button variant="outline" className="mr-4 btn-hover-lift">
                      View FAQ
                    </Button>
                  </Link>
                  <Link href="/demo">
                    <Button variant="outline" className="btn-hover-lift">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 text-gray-800 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
                  Connecting data scientists with their dream careers.
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
                  <li><Link href="/interview" className="hover:text-gray-800">Practice Interviews</Link></li>
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