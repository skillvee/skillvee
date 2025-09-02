import { currentUser } from "@clerk/nextjs/server";
import { SignInButton, UserButton } from "@clerk/nextjs";
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

export default async function DemoPage() {
  const user = await currentUser();

  return (
    <HydrateClient>
      <div className="min-h-screen bg-gray-50">
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
                <SignInButton>
                  <Button>Sign In</Button>
                </SignInButton>
              )}
            </div>
          </div>
        </nav>

        <main className="flex-1">
          {/* Hero Section */}
          <div className="bg-white py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  See SkillVee in action
                </h1>
                <p className="text-lg text-gray-600">
                  Get a personalized demo of pre-vetted data science talent
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Left side - Benefits */}
                <div>
                  <h2 className="text-xl font-bold mb-4 text-gray-900">What you'll see:</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Browse pre-vetted candidates with proven portfolios</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Skip technical interviews - they've already proven they can code</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">48-hour placement with 90-day performance guarantee</span>
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-gray-900">15-minute demo</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      We'll respond within 24 hours to schedule a time that works for you.
                    </p>
                  </div>
                </div>

                {/* Right side - Form */}
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-1">Schedule your demo</h3>
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
                        className="w-full font-medium rounded-xl"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Request Demo
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