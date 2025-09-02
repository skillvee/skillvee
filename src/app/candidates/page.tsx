import { currentUser } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { 
  CheckCircle, 
  MessageSquare, 
  Users, 
  Target, 
  TrendingUp, 
  BarChart, 
  Brain, 
  Database, 
  Award, 
  Star, 
  ArrowRight, 
  Sparkles, 
  Briefcase, 
  Zap, 
  Clock, 
  FileSearch, 
  ChartBar 
} from "lucide-react";

export default async function CandidatesPage() {
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
                    <Button>Apply now</Button>
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
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">One application.</span><br />
                    Many data science opportunities.
                  </h1>
                  <p className="text-lg text-gray-700 mb-4">
                    Stop sending countless job applications. Apply once with SkillVee, validate your data science skills, and get matched with leading companies looking for talent like you.
                  </p>
                  <div className="bg-blue-100/50 rounded-lg p-4 mb-6 border-l-4 border-primary">
                    <p className="font-semibold text-gray-800">Get hired 5x faster 🚀</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {user ? (
                      <Link href="/job-description">
                        <Button size="lg" className="font-medium px-8 rounded-xl">
                          Apply now
                        </Button>
                      </Link>
                    ) : (
                      <SignUpButton>
                        <Button size="lg" className="font-medium px-8 rounded-xl">
                          Apply now
                        </Button>
                      </SignUpButton>
                    )}
                    <Link href="/interview">
                      <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors rounded-xl">
                        Practice with AI
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="md:w-1/2 flex justify-center">
                  <div className="bg-white shadow-xl rounded-xl p-6 border border-blue-100 max-w-md w-full hover:shadow-2xl transition-shadow">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <p className="font-medium">Senior Data Scientist</p>
                          <p className="text-sm text-gray-500">Tech Innovators Inc.</p>
                        </div>
                        <div className="ml-auto">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Matched</span>
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <p className="font-medium">ML Engineer</p>
                          <p className="text-sm text-gray-500">Data Analytics Corp.</p>
                        </div>
                        <div className="ml-auto">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Matched</span>
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <p className="font-medium">Data Analyst</p>
                          <p className="text-sm text-gray-500">Future Finance Inc.</p>
                        </div>
                        <div className="ml-auto">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Reviewing</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Why data scientists choose us 🚀</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  We help talented data scientists like you stand out and connect with the best opportunities.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-white hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary mb-4 w-fit">
                      <CheckCircle size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Apply just once</h3>
                    <p className="text-gray-600">Submit one application and get considered by hundreds of companies looking for data science talent.</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary mb-4 w-fit">
                      <Clock size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Save precious time</h3>
                    <p className="text-gray-600">No more endless job board searches and repetitive applications. We bring the opportunities to you.</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary mb-4 w-fit">
                      <Zap size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Skill validation</h3>
                    <p className="text-gray-600">Demonstrate your abilities and get a validated skills profile that helps you stand out to employers.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works ✨</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Three simple steps to find your ideal data science role.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="relative">
                  <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
                  <Card className="ml-4 bg-white hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">Select jobs & create profile</h3>
                      <p className="text-gray-600">Upload your resume, select jobs you're interested in, and create your skill profile to match with the right opportunities.</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</div>
                  <Card className="ml-4 bg-white hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">Validate your skills</h3>
                      <p className="text-gray-600">Complete assessments that showcase your data science abilities to potential employers.</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</div>
                  <Card className="ml-4 bg-white hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">Get matched</h3>
                      <p className="text-gray-600">Receive interview requests from companies that match your skills and preferences.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="mt-12 text-center">
                {user ? (
                  <Link href="/job-description">
                    <Button size="lg" className="font-medium px-8 rounded-xl">
                      Apply now
                    </Button>
                  </Link>
                ) : (
                  <SignUpButton>
                    <Button size="lg" className="font-medium px-8 rounded-xl">
                      Apply now
                    </Button>
                  </SignUpButton>
                )}
              </div>
            </div>
          </section>

          {/* AI Interview Practice */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="md:flex md:items-center md:justify-between gap-12">
                <div className="md:w-1/2 mb-10 md:mb-0">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Practice with our AI interviewer 🤖</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Prepare for your data science interviews with our interactive AI coach. Get realistic questions and immediate feedback on:
                  </p>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <div className="mr-4 mt-1 text-primary">
                        <CheckCircle size={20} />
                      </div>
                      <span className="text-gray-700">Machine learning fundamentals and algorithms</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-4 mt-1 text-primary">
                        <CheckCircle size={20} />
                      </div>
                      <span className="text-gray-700">Statistical analysis and hypothesis testing</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-4 mt-1 text-primary">
                        <CheckCircle size={20} />
                      </div>
                      <span className="text-gray-700">SQL queries and database concepts</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-4 mt-1 text-primary">
                        <CheckCircle size={20} />
                      </div>
                      <span className="text-gray-700">Python coding challenges and data manipulation</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-4 mt-1 text-primary">
                        <CheckCircle size={20} />
                      </div>
                      <span className="text-gray-700">Real-world data science case studies</span>
                    </li>
                  </ul>
                  <Link href="/interview">
                    <Button size="lg" className="font-medium px-8 rounded-xl">
                      Start practicing now
                    </Button>
                  </Link>
                </div>
                <div className="md:w-1/2">
                  <Card className="bg-white shadow-xl hover:shadow-2xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4 text-primary">
                        <MessageSquare className="h-5 w-5" />
                        <span className="font-medium">AI Interviewer</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-gray-800">
                          Explain the difference between L1 and L2 regularization in machine learning models. When would you prefer one over the other?
                        </p>
                      </div>
                      <div className="border-l-4 border-primary pl-4 py-1 mb-4">
                        <p className="text-gray-600 italic">Practice answering these kinds of questions and get immediate feedback to improve your skills...</p>
                      </div>
                      <div className="flex justify-between">
                        <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white transition-colors rounded-xl">Previous</Button>
                        <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white transition-colors rounded-xl">Next question</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Success stories 🌟</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Data scientists who found their dream jobs through SkillVee.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-8">
                      <Image 
                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80" 
                        alt="Alex M." 
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-xl font-semibold">Alex M.</h3>
                        <p className="text-gray-600">Senior Data Scientist</p>
                        <div className="flex items-center mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 italic mb-4">
                      "After months of sending applications with no response, I tried SkillVee. Within two weeks I had three interview requests from top companies, and landed my dream job as a Senior Data Scientist."
                    </p>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-700">Results:</p>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-gray-500">Time to hire</span>
                        <span className="text-sm font-medium">14 days (vs. industry avg. 90 days)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-8">
                      <Image 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80" 
                        alt="Priya S." 
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-xl font-semibold">Priya S.</h3>
                        <p className="text-gray-600">Machine Learning Engineer</p>
                        <div className="flex items-center mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 italic mb-4">
                      "The AI interview practice was a game-changer. It helped me identify my weak areas in ML concepts and SQL, and I was able to improve before my actual interviews. Landed a job with a 40% higher salary!"
                    </p>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-700">Results:</p>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-gray-500">Salary increase</span>
                        <span className="text-sm font-medium">40% higher than previous role</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-12 text-center">
                {user ? (
                  <Link href="/job-description">
                    <Button size="lg" className="font-medium px-8 rounded-xl">
                      Join them today
                    </Button>
                  </Link>
                ) : (
                  <SignUpButton>
                    <Button size="lg" className="font-medium px-8 rounded-xl">
                      Join them today
                    </Button>
                  </SignUpButton>
                )}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-primary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to accelerate your data science career? 🚀</h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                One application. Countless opportunities. Get started today for free.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link href="/job-description">
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-medium px-8 rounded-xl">
                      Apply now
                    </Button>
                  </Link>
                ) : (
                  <SignUpButton>
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-medium px-8 rounded-xl">
                      Apply now
                    </Button>
                  </SignUpButton>
                )}
                <Link href="/interview">
                  <Button size="lg" className="bg-primary text-white border-2 border-white hover:bg-white hover:text-primary transition-colors font-medium px-8 rounded-xl">
                    Practice with AI
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
                  <li><Link href="/job-description" className="hover:text-gray-900">Apply Now</Link></li>
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