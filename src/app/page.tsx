import { currentUser } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { CheckCircle, MessageSquare, Users, Target, TrendingUp, BarChart, Brain, Database, Award, Star, ArrowRight, Sparkles } from "lucide-react";
import HeroLottie from "~/components/hero-lottie";

export default async function Home() {
  const user = await currentUser();

  return (
    <HydrateClient>
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SV</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">SkillVee</span>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/candidates" className="text-gray-600 hover:text-gray-900">
                  Candidates
                </Link>
                <Link href="/companies" className="text-gray-600 hover:text-gray-900">
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
                    <Button className="bg-blue-600 hover:bg-blue-700">Apply now</Button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Column */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <Badge className="bg-green-50 text-green-700 border-green-200 w-fit">
                    ✨ Free Forever
                  </Badge>
                  
                  <h1 className="text-5xl font-bold leading-tight">
                    <span className="text-gray-900">Ace Your </span>
                    <span className="text-blue-600">Data Science Interviews</span>
                    <span className="text-gray-900"> with AI</span>
                  </h1>
                  
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Practice with realistic, interactive AI interviews tailored to specific companies and roles. Get instant feedback, master the skills that matter, and walk into any data science interview with confidence.
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="text-gray-700 font-medium">Interactive company-specific cases from Google, Meta, Netflix, and more</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="text-gray-700 font-medium">Role-tailored questions for ML Engineer, Data Scientist, Analytics roles</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="text-gray-700 font-medium">Instant AI feedback on technical accuracy and communication skills</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {user ? (
                    <Link href="/interview">
                      <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                        Start Practicing Free
                      </Button>
                    </Link>
                  ) : (
                    <SignUpButton>
                      <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                        Start Practicing Free
                      </Button>
                    </SignUpButton>
                  )}
                  <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    See How It Works
                  </Button>
                </div>
              </div>

              {/* Right Column - Interview Illustration */}
              <div className="relative overflow-visible">
                {/* Blueish background circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] rounded-full opacity-80" style={{backgroundColor: '#E8EDF5'}}></div>
                
                {/* Interview illustration - Lottie animation */}
                <div className="relative flex justify-center items-center overflow-visible">
                  <div className="relative z-10 overflow-visible">
                    <HeroLottie
                      animationUrl="https://lottie.host/225df633-5148-4342-932f-b56ce4bc7177/QLCr5Cr7eC.lottie"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Unique Value Props - 3 Pillars */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why SkillVee is Different
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The only platform that combines free AI interview practice with automatic job applications
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-white hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-100">
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                    <Brain className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    🤖 AI Interview Coach
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Practice with our realistic AI interviewer covering Python, SQL, machine learning, statistics, and behavioral questions. Get instant feedback and improve your confidence.
                  </p>
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    Always Free
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-white hover:shadow-lg transition-shadow border-2 border-transparent hover:border-purple-100">
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                    <Award className="w-7 h-7 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    ✅ Skill Validation
                  </h3>
                  <p className="text-gray-600 mb-4">
                    As you practice, we validate and certify your skills. Build a verified profile that employers trust, backed by your actual interview performance.
                  </p>
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                    Employer Trusted
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-white hover:shadow-lg transition-shadow border-2 border-transparent hover:border-orange-100">
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                    <Target className="w-7 h-7 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    😴 Autopilot Job Applications
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Based on your validated skills, we automatically apply you to relevant data science jobs. Wake up to new interview opportunities.
                  </p>
                  <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                    While You Sleep
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Companies section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our members get amazing jobs at the top tech companies
              </h2>
              <p className="text-lg text-gray-600">
                Join thousands of data scientists who've landed their dream roles
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 mb-16 opacity-80">
              {/* Company logos using actual logo files */}
              
              <div className="flex items-center justify-center w-32 h-12">
                <Image 
                  src="/airbnb.png" 
                  alt="Airbnb" 
                  width={100} 
                  height={32}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12">
                <Image 
                  src="/microsoft-small.png" 
                  alt="Microsoft" 
                  width={100} 
                  height={32}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12">
                <Image 
                  src="/google-small.png" 
                  alt="Google" 
                  width={100} 
                  height={32}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12">
                <Image 
                  src="/Twitch_logo.png" 
                  alt="Twitch" 
                  width={100} 
                  height={32}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12">
                <Image 
                  src="/Uber_logo_2018.png" 
                  alt="Uber" 
                  width={100} 
                  height={32}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12">
                <Image 
                  src="/Spotify.png" 
                  alt="Spotify" 
                  width={100} 
                  height={32}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12">
                <Image 
                  src="/netflix.png" 
                  alt="Netflix" 
                  width={100} 
                  height={32}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12">
                <Image 
                  src="/apple-small.png" 
                  alt="Apple" 
                  width={60} 
                  height={24}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12">
                <Image 
                  src="/meta-small.png" 
                  alt="Meta" 
                  width={100} 
                  height={32}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12">
                <Image 
                  src="/amazon-small.png" 
                  alt="Amazon" 
                  width={100} 
                  height={32}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12">
                <Image 
                  src="/doordash.png" 
                  alt="DoorDash" 
                  width={100} 
                  height={32}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-gray-600">Data Scientists</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-gray-600">Partner Companies</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">85%</div>
                <div className="text-gray-600">Interview Success Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">48hrs</div>
                <div className="text-gray-600">Average Match Time</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How SkillVee Works 🚀
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From interview anxiety to job offers in four simple steps
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Practice with AI</h3>
                <p className="text-gray-600">
                  Start with our free AI interviewer. Practice Python, SQL, ML, statistics, and behavioral questions unlimited times.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Skills Get Validated</h3>
                <p className="text-gray-600">
                  As you practice, our AI validates your skills in real-time. Build a certified profile that employers trust.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Profile Gets Enhanced</h3>
                <p className="text-gray-600">
                  Your validated skills create a powerful profile that stands out to employers seeking your exact expertise.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  4
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Jobs Come to You</h3>
                <p className="text-gray-600">
                  We automatically apply you to relevant positions. Wake up to interview invitations from companies seeking your skills.
                </p>
              </div>
            </div>
            
            <div className="mt-16 text-center">
              <Link href="/interview">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 mr-4">
                  Start Your Journey Free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Interactive AI Demo Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <Badge className="bg-blue-600 text-white mb-6">
                <Sparkles className="w-4 h-4 mr-1" />
                Try Our AI Interviewer
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Experience the Future of Interview Practice
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See how our AI interviewer works with a live sample question. No signup required - just click and try!
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Card className="bg-white shadow-2xl border-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gray-900 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-300">SkillVee AI Interview • Live Demo</span>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                          <p className="font-medium text-blue-900 mb-2">AI Interviewer:</p>
                          <p className="text-gray-800">
                            "Great! Let's start with a fundamental question. You have a dataset with 100,000 rows and you notice about 15% of the values in your target variable are missing. Walk me through the different strategies you would consider for handling this missing data, and explain when you would use each approach."
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 mb-6">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-600">You</span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                          <p className="text-gray-500 italic mb-2">Your answer would appear here...</p>
                          <p className="text-sm text-gray-400">
                            💡 The AI will provide instant feedback on your technical accuracy, completeness, and communication clarity
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">What happens next:</h4>
                          <ul className="space-y-1 text-gray-700">
                            <li>• <strong>Instant Analysis:</strong> AI evaluates your technical depth and approach</li>
                            <li>• <strong>Follow-up Questions:</strong> Adaptive questioning based on your response</li>
                            <li>• <strong>Skill Validation:</strong> Your competencies get validated in real-time</li>
                            <li>• <strong>Detailed Feedback:</strong> Specific suggestions to improve your answers</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      {user ? (
                        <Link href="/interview">
                          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                            <MessageSquare className="w-5 h-5 mr-2" />
                            Try Full Interview Now
                          </Button>
                        </Link>
                      ) : (
                        <SignUpButton>
                          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                            <MessageSquare className="w-5 h-5 mr-2" />
                            Try Full Interview Now
                          </Button>
                        </SignUpButton>
                      )}
                      <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 w-full sm:w-auto">
                        <BarChart className="w-5 h-5 mr-2" />
                        See Sample Questions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Database className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Technical Questions</h3>
                  <p className="text-gray-600 text-sm">Python, SQL, ML algorithms, statistics, and data manipulation</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Behavioral Questions</h3>
                  <p className="text-gray-600 text-sm">Leadership, teamwork, problem-solving, and communication scenarios</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Case Studies</h3>
                  <p className="text-gray-600 text-sm">Real business problems from top companies and startups</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Success Stories & Social Proof */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <Badge className="bg-green-100 text-green-700 border-green-200 mb-6">
                💼 Success Stories
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Real Results From Real Data Scientists
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our AI interview coach doesn't just help you practice - it helps you land jobs at top companies
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 mb-16">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 font-bold text-lg">
                      ML
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Marcus L.</h3>
                      <p className="text-blue-600 font-medium">Senior ML Engineer → Google</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                    "After 6 months of failed interviews, I used SkillVee's AI coach for 3 weeks. The feedback was incredible - it caught gaps in my ML knowledge I didn't even know I had. <strong>Landed my dream role at Google with a 40% salary increase.</strong>"
                  </blockquote>
                  <div className="bg-white rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">3 weeks</div>
                        <div className="text-sm text-gray-600">Practice time</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">+40%</div>
                        <div className="text-sm text-gray-600">Salary increase</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mr-4 font-bold text-lg">
                      AJ
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Ananya J.</h3>
                      <p className="text-purple-600 font-medium">Career Switcher → Meta</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                    "Switching from finance to data science seemed impossible. SkillVee's automatic job matching connected me with Meta's team lead, and the AI prep got me through all 5 rounds. <strong>Now building ML models for 2 billion users!</strong>"
                  </blockquote>
                  <div className="bg-white rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">5/5</div>
                        <div className="text-sm text-gray-600">Interview rounds passed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">Career</div>
                        <div className="text-sm text-gray-600">Pivot success</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="bg-white hover:shadow-lg transition-shadow border-2 border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center font-bold text-gray-600">
                      DC
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">David C.</h3>
                      <p className="text-sm text-blue-600">Netflix • Senior DS</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600">
                    "Free AI practice + automatic applications = genius. Got 4 interviews in 2 weeks without manually applying anywhere."
                  </p>
                  <Badge className="mt-3 bg-orange-50 text-orange-700 border-orange-200 text-xs">
                    4 interviews • 2 weeks
                  </Badge>
                </CardContent>
              </Card>
              
              <Card className="bg-white hover:shadow-lg transition-shadow border-2 border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center font-bold text-gray-600">
                      PM
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Priya M.</h3>
                      <p className="text-sm text-blue-600">Microsoft • DS Manager</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600">
                    "The AI identified exactly where my explanations were unclear. Improved my interview communication dramatically."
                  </p>
                  <Badge className="mt-3 bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    Communication improved 10x
                  </Badge>
                </CardContent>
              </Card>
              
              <Card className="bg-white hover:shadow-lg transition-shadow border-2 border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center font-bold text-gray-600">
                      KT
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Kevin T.</h3>
                      <p className="text-sm text-blue-600">Airbnb • Staff DS</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600">
                    "Practiced 50+ questions with the AI. When I interviewed at Airbnb, I'd already seen similar questions. Felt prepared, not nervous."
                  </p>
                  <Badge className="mt-3 bg-green-50 text-green-700 border-green-200 text-xs">
                    50+ questions practiced
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">Join 12,000+ Data Scientists</div>
                <p className="text-gray-600">Who've transformed their careers with AI-powered interview prep</p>
              </div>
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div>
                  <div className="text-2xl font-bold text-blue-600">94%</div>
                  <div className="text-sm text-gray-600">Interview success rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">$180k</div>
                  <div className="text-sm text-gray-600">Average salary increase</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">18 days</div>
                  <div className="text-sm text-gray-600">Average time to offer</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">4.9/5</div>
                  <div className="text-sm text-gray-600">User satisfaction</div>
                </div>
              </div>
              {user ? (
                <Link href="/interview">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Start Your Success Story
                  </Button>
                </Link>
              ) : (
                <SignUpButton>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Start Your Success Story
                  </Button>
                </SignUpButton>
              )}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose SkillVee? 🤔
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See how we stack up against other interview prep platforms
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="text-left p-6 font-semibold">Features</th>
                      <th className="text-center p-6 font-semibold bg-blue-700">
                        <div className="flex flex-col items-center">
                          <span className="text-xl font-bold">SkillVee</span>
                          <Badge className="bg-yellow-500 text-yellow-900 mt-1 text-xs">
                            RECOMMENDED
                          </Badge>
                        </div>
                      </th>
                      <th className="text-center p-6 font-semibold">InterviewQuery</th>
                      <th className="text-center p-6 font-semibold">Pramp</th>
                      <th className="text-center p-6 font-semibold">LeetCode</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-6 font-medium text-gray-900">AI-Powered Interview Practice</td>
                      <td className="p-6 text-center bg-blue-50">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                        <div className="text-xs text-green-700 mt-1">Advanced AI</div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Static content</div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Human-only</div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Code-only</div>
                      </td>
                    </tr>
                    
                    <tr className="border-b border-gray-100">
                      <td className="p-6 font-medium text-gray-900">Free Forever Access</td>
                      <td className="p-6 text-center bg-blue-50">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                        <div className="text-xs text-green-700 mt-1">100% Free</div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-red-600 mt-1">$39/month</div>
                      </td>
                      <td className="p-6 text-center">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                        <div className="text-xs text-green-700 mt-1">Limited free</div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-red-600 mt-1">$35/month</div>
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="p-6 font-medium text-gray-900">Automatic Job Applications</td>
                      <td className="p-6 text-center bg-blue-50">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                        <div className="text-xs text-green-700 mt-1">While you sleep</div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Manual only</div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">No job board</div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">No job board</div>
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="p-6 font-medium text-gray-900">Real-time Skill Validation</td>
                      <td className="p-6 text-center bg-blue-50">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                        <div className="text-xs text-green-700 mt-1">AI-certified</div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Self-assessment</div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Peer feedback</div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Pass/fail only</div>
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="p-6 font-medium text-gray-900">Data Science Focus</td>
                      <td className="p-6 text-center bg-blue-50">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                        <div className="text-xs text-green-700 mt-1">100% DS focused</div>
                      </td>
                      <td className="p-6 text-center">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                        <div className="text-xs text-green-700 mt-1">DS focused</div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">General tech</div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">General coding</div>
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="p-6 font-medium text-gray-900">Instant Feedback</td>
                      <td className="p-6 text-center bg-blue-50">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                        <div className="text-xs text-green-700 mt-1">AI-powered</div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Solutions only</div>
                      </td>
                      <td className="p-6 text-center">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                        <div className="text-xs text-green-700 mt-1">From peers</div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Pass/fail</div>
                      </td>
                    </tr>

                    <tr>
                      <td className="p-6 font-medium text-gray-900">Available 24/7</td>
                      <td className="p-6 text-center bg-blue-50">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                        <div className="text-xs text-green-700 mt-1">Always on</div>
                      </td>
                      <td className="p-6 text-center">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                        <div className="text-xs text-green-700 mt-1">Self-paced</div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Scheduled</div>
                      </td>
                      <td className="p-6 text-center">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                        <div className="text-xs text-green-700 mt-1">Self-paced</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-12 text-center">
              <div className="bg-white rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Experience the Difference?
                </h3>
                <p className="text-gray-600 mb-6">
                  Join thousands who chose the smarter way to prepare for data science interviews
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {user ? (
                    <Link href="/interview">
                      <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                        Start Free Practice
                      </Button>
                    </Link>
                  ) : (
                    <SignUpButton>
                      <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                        Start Free Practice
                      </Button>
                    </SignUpButton>
                  )}
                  <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 w-full sm:w-auto">
                    Compare All Features
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions ❓
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about SkillVee's AI interview prep
              </p>
            </div>

            <div className="space-y-6">
              <Card className="border-2 border-gray-100 hover:border-blue-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">Q</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Is the AI interview practice really free forever?
                      </h3>
                      <p className="text-gray-600">
                        Yes! Our AI interview coach is completely free with no limits. Practice unlimited questions, get instant feedback, and validate your skills without ever paying. We make money when you get hired through our job matching service, so your success is our success.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-100 hover:border-blue-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">Q</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        How does the automatic job application work?
                      </h3>
                      <p className="text-gray-600">
                        After you practice with our AI and your skills are validated, we create a comprehensive profile highlighting your strengths. Our system then automatically matches and applies you to relevant data science roles with our partner companies. You maintain full control - we only apply to jobs that match your preferences and criteria.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-100 hover:border-blue-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">Q</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        What types of questions does the AI ask?
                      </h3>
                      <p className="text-gray-600">
                        Our AI covers the full spectrum of data science interviews: Python programming, SQL queries, machine learning algorithms, statistics concepts, data manipulation with pandas, model evaluation, A/B testing, and behavioral questions. Questions are sourced from real interviews at top tech companies.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-100 hover:border-blue-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">Q</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        How accurate is the AI feedback?
                      </h3>
                      <p className="text-gray-600">
                        Our AI is trained on thousands of successful interview responses and continuously learns from user interactions. It evaluates technical accuracy, problem-solving approach, communication clarity, and completeness. Many users report that our feedback helped them identify blind spots they weren't aware of.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-100 hover:border-blue-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">Q</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Do employers really trust SkillVee's skill validation?
                      </h3>
                      <p className="text-gray-600">
                        Absolutely. Our AI-powered skill validation is backed by actual interview performance data, not just test scores. Companies see candidates who've practiced extensively and can demonstrate their skills under pressure. This leads to higher interview success rates and better job matches for both sides.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-100 hover:border-blue-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">Q</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        What if I'm just starting out in data science?
                      </h3>
                      <p className="text-gray-600">
                        Perfect! Our AI adapts to your experience level and identifies areas for improvement. Start with basics and work your way up. Many career changers have successfully used SkillVee to transition into data science roles. The AI helps you build confidence and identify exactly what to study.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-100 hover:border-blue-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">Q</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        How is this different from other interview prep platforms?
                      </h3>
                      <p className="text-gray-600">
                        Unlike static platforms that just show you questions and answers, our AI provides personalized, interactive coaching. Plus, we're the only platform that combines free practice with automatic job applications. You practice, get validated, and opportunities come to you - all in one seamless experience.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Still have questions?
                </h3>
                <p className="text-gray-600 mb-6">
                  Our team is here to help you succeed. Get in touch and we'll answer any questions about your data science career journey.
                </p>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full"></div>
            <div className="absolute bottom-20 left-1/4 w-12 h-12 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 border border-white rounded-full"></div>
          </div>
          
          <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <Badge className="bg-yellow-400 text-yellow-900 mb-8 text-sm font-semibold">
              🚀 Join 12,000+ Data Scientists
            </Badge>
            
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              Stop Applying. Start <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Practicing.</span>
            </h2>
            
            <p className="text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              Your dream data science job is waiting. Our AI will help you ace the interview, validate your skills, and apply you to jobs while you sleep. <strong className="text-white">Completely free, forever.</strong>
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
              {user ? (
                <Link href="/interview">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl px-8 py-4 text-lg font-semibold">
                    <Brain className="w-6 h-6 mr-2" />
                    Start Practicing Free Now
                  </Button>
                </Link>
              ) : (
                <SignUpButton>
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl px-8 py-4 text-lg font-semibold">
                    <Brain className="w-6 h-6 mr-2" />
                    Start Practicing Free Now
                  </Button>
                </SignUpButton>
              )}
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold">
                <MessageSquare className="w-6 h-6 mr-2" />
                See How It Works
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-white">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Free Forever</h3>
                <p className="text-blue-100 text-sm">Unlimited AI practice sessions, no credit card needed</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Auto Job Matching</h3>
                <p className="text-blue-100 text-sm">We apply you to perfect-fit roles automatically</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Skill Validation</h3>
                <p className="text-blue-100 text-sm">Employer-trusted certifications from your practice</p>
              </div>
            </div>

            <div className="mt-16 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <p className="text-white/90 text-lg mb-4">
                <span className="font-semibold">⚡ Quick Start:</span> Create your free account in 30 seconds. No setup, no waiting - start practicing with our AI interviewer immediately.
              </p>
              <div className="flex items-center justify-center space-x-6 text-white/70">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  No spam, ever
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Cancel anytime
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Your data is secure
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">SV</span>
                  </div>
                  <span className="text-xl font-semibold">SkillVee</span>
                </div>
                <p className="text-gray-400">
                  Connecting data scientists with their dream careers.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">For Candidates</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/apply" className="hover:text-white">Apply Now</Link></li>
                  <li><Link href="/interview" className="hover:text-white">Practice Interviews</Link></li>
                  <li><Link href="/resources" className="hover:text-white">Resources</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">For Companies</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/companies" className="hover:text-white">Post Jobs</Link></li>
                  <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                  <li><Link href="/enterprise" className="hover:text-white">Enterprise</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                  <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                  <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                  <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                © 2024 SkillVee. All rights reserved.
              </p>
              <div className="flex space-x-6 text-gray-400">
                <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-white">Terms of Service</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </HydrateClient>
  );
}