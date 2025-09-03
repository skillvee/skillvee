import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import Image from "next/image";
import { HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { 
  Calendar,
  Clock,
  Users,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import Navigation from "~/components/navigation";

export default async function DemoPage() {
  const user = await currentUser();

  return (
    <HydrateClient>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <Navigation />

        <main className="flex-1">
          {/* Hero Section */}
          <div className="bg-white py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8 animate-fade-in">
                <h1 className="text-3xl md:text-4xl font-bold mb-3 animate-slide-up">
                  Let's talk about your hiring needs
                </h1>
                <p className="text-lg text-gray-600 animate-fade-in-delay">
                  Get a personalized walkthrough of how SkillVee can help you find top data science talent
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Left side - Benefits */}
                <div className="animate-slide-right">
                  <h2 className="text-xl font-bold mb-4 text-gray-900">What we'll discuss:</h2>
                  <div className="space-y-3 mb-6 stagger-animation">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 animate-pulse-subtle" />
                      <span className="text-gray-700">Your current hiring challenges and requirements</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 animate-pulse-subtle" />
                      <span className="text-gray-700">How our pre-vetted talent pool can help you</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 animate-pulse-subtle" />
                      <span className="text-gray-700">Our 48-hour placement process and guarantees</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 animate-bounce-in">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600 animate-float" />
                      <h3 className="font-semibold text-gray-900">15-minute conversation</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      We'll respond within 24 hours to schedule a time that works for you.
                    </p>
                  </div>
                </div>

                {/* Right side - Form */}
                <Card className="bg-white shadow-lg animate-slide-left card-hover">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-1">Get in touch</h3>
                      <p className="text-sm text-gray-600">Just need a few details to get started</p>
                    </div>

                    <form className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full name</Label>
                        <Input 
                          id="name" 
                          name="name"
                          type="text" 
                          placeholder="John Smith"
                          required
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Work email</Label>
                        <Input 
                          id="email" 
                          name="email"
                          type="email" 
                          placeholder="john@company.com"
                          required
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input 
                          id="company" 
                          name="company"
                          type="text" 
                          placeholder="Your company name"
                          required
                          className="mt-1"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full font-medium bg-blue-600 hover:bg-blue-700 btn-hover-lift"
                      >
                        <Calendar className="w-4 h-4 mr-2 animate-bounce-subtle" />
                        Let's Talk
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        We'll reach out within 24 hours
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
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