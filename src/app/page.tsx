import { currentUser } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { CheckCircle, MessageSquare, Users, Target, TrendingUp, BarChart, Brain, Database, Award, Star, ArrowRight, Sparkles } from "lucide-react";
import HeroLottie from "~/components/hero-lottie";
import Navigation from "~/components/navigation";

export default async function Home() {
  const user = await currentUser();

  return (
    <HydrateClient>
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <Navigation />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Left Column */}
              <div className="space-y-6 sm:space-y-8 animate-fade-in text-center lg:text-left">
                <div className="space-y-4 sm:space-y-6">
                  <Badge className="bg-teal-50 text-teal-700 border-teal-200 w-fit mx-auto lg:mx-0 animate-bounce-in hover:scale-105 transition-transform duration-300">
                    ✨ Free Forever
                  </Badge>
                  
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight animate-slide-up">
                    <span className="text-gray-900">Turn interview prep into </span>
                    <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">real job offers</span>
                    <span className="text-gray-900">.</span>
                  </h1>
                  
                  <p className="text-lg sm:text-xl text-gray-600 leading-relaxed animate-fade-in-delay max-w-2xl mx-auto lg:mx-0">
                    Practice with realistic, AI-powered interviews tailored to your target company and role — and unlock new job opportunities along the way.
                  </p>

                  <div className="space-y-2 animate-fade-in-delay-2">
                    <div className="flex items-start space-x-3 group hover:translate-x-2 transition-transform duration-300 justify-center lg:justify-start">
                      <CheckCircle className="w-5 h-5 text-teal-600 mt-1 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-gray-700 font-medium"><span className="font-bold">Interactive</span> company-specific cases</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 group hover:translate-x-2 transition-transform duration-300 justify-center lg:justify-start">
                      <CheckCircle className="w-5 h-5 text-teal-600 mt-1 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-gray-700 font-medium"><span className="font-bold">Practical</span> role-tailored questions</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 group hover:translate-x-2 transition-transform duration-300 justify-center lg:justify-start">
                      <CheckCircle className="w-5 h-5 text-teal-600 mt-1 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-gray-700 font-medium"><span className="font-bold">Instant</span> AI feedback</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-delay-3 justify-center lg:justify-start">
                  {user ? (
                    <Link href="/interview">
                      <Button size="lg" className="w-full sm:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                        Start Practicing Free
                      </Button>
                    </Link>
                  ) : (
                    <SignUpButton>
                      <Button size="lg" className="w-full sm:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                        Start Practicing Free
                      </Button>
                    </SignUpButton>
                  )}
                  <Button 
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto min-w-[200px] bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:scale-105 hover:shadow-md"
                  >
                    See How It Works
                  </Button>
                </div>
              </div>

              {/* Right Column - Interview Illustration */}
              <div className="relative overflow-visible animate-fade-in-delay-2 mt-8 lg:mt-0 hidden lg:block">
                {/* Blueish background circle - smaller on mobile */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[580px] lg:h-[580px] rounded-full blur-lg" style={{backgroundColor: 'rgba(59, 130, 246, 0.25)'}}></div>
                
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

        {/* Companies section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12 animate-fade-in">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 animate-slide-up">
                Our candidates get amazing jobs at the top tech companies
              </h2>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 opacity-80">
              {/* Company logos using actual logo files */}
              
              <div className="flex items-center justify-center w-32 h-12 company-logo">
                <Image 
                  src="/airbnb.png" 
                  alt="Airbnb" 
                  width={100} 
                  height={32}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12 company-logo">
                <Image 
                  src="/microsoft-small.png" 
                  alt="Microsoft" 
                  width={100} 
                  height={32}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12 company-logo">
                <Image 
                  src="/google-small.png" 
                  alt="Google" 
                  width={100} 
                  height={32}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12 company-logo">
                <Image 
                  src="/Twitch_logo.png" 
                  alt="Twitch" 
                  width={100} 
                  height={32}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12 company-logo">
                <Image 
                  src="/Uber_logo_2018.png" 
                  alt="Uber" 
                  width={100} 
                  height={32}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12 company-logo">
                <Image 
                  src="/Spotify.png" 
                  alt="Spotify" 
                  width={100} 
                  height={32}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12 company-logo">
                <Image 
                  src="/netflix.png" 
                  alt="Netflix" 
                  width={100} 
                  height={32}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12 company-logo">
                <Image 
                  src="/apple-small.png" 
                  alt="Apple" 
                  width={60} 
                  height={24}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12 company-logo">
                <Image 
                  src="/meta-small.png" 
                  alt="Meta" 
                  width={100} 
                  height={32}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12 company-logo">
                <Image 
                  src="/amazon-small.png" 
                  alt="Amazon" 
                  width={100} 
                  height={32}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center w-32 h-12 company-logo">
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

        {/* How It Works section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16 animate-fade-in">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 animate-slide-up">
                How It Works
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-delay">
                Land your dream data science role in 3 proven steps
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 relative">
              <Card className="bg-white hover:shadow-xl transition-all duration-500 border-2 border-transparent hover:border-blue-100 relative transform hover:-translate-y-2 animate-slide-up-delay-1 group">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                    <Brain className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center justify-center gap-3">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform duration-300">1</span>
                    Practice Like It's Real
                  </h3>
                  <p className="text-gray-600">
                    Face actual interview questions from Google, Meta, and more. Get instant AI feedback that actually helps.
                  </p>
                  {/* Arrow to next step */}
                  <div className="hidden md:block absolute top-[50%] -right-[28px] -translate-y-1/2 text-gray-300 z-10 animate-bounce-x">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white hover:shadow-xl transition-all duration-500 border-2 border-transparent hover:border-yellow-100 relative transform hover:-translate-y-2 animate-slide-up-delay-2 group">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3" style={{backgroundColor: '#fef3c7'}}>
                    <Award className="w-7 h-7" style={{color: '#facc15'}} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center justify-center gap-3">
                    <span className="w-8 h-8 text-white rounded-full flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform duration-300" style={{backgroundColor: '#facc15'}}>2</span>
                    Stand Out Instantly
                  </h3>
                  <p className="text-gray-600">
                    Turn practice into verified credentials. Build a profile that makes recruiters stop scrolling.
                  </p>
                  {/* Arrow to next step */}
                  <div className="hidden md:block absolute top-[50%] -right-[28px] -translate-y-1/2 text-gray-300 z-10 animate-bounce-x">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white hover:shadow-xl transition-all duration-500 border-2 border-transparent hover:border-teal-100 transform hover:-translate-y-2 animate-slide-up-delay-3 group">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                    <Target className="w-7 h-7 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center justify-center gap-3">
                    <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform duration-300">3</span>
                    Jobs Find You
                  </h3>
                  <p className="text-gray-600">
                    Stop applying everywhere. We match you with companies that need your exact skills.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-16 text-center animate-fade-in-delay-3">
              <Link href="/interview">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 transform hover:scale-110 transition-all duration-300 hover:shadow-xl">
                  <span className="text-lg mr-2">⚡</span>
                  Start Practicing Free
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-blue-600 to-blue-700 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-white">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <CheckCircle className="w-8 h-8 text-teal-400 drop-shadow-md" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Free Forever</h3>
                <p className="text-white/90 text-sm">Unlimited AI practice sessions, no credit card needed</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <Target className="w-8 h-8 text-orange-400 drop-shadow-md" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Auto Job Matching</h3>
                <p className="text-white/90 text-sm">We apply you to perfect-fit roles automatically</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <Award className="w-8 h-8 text-orange-300 drop-shadow-md" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Skill Validation</h3>
                <p className="text-white/90 text-sm">Employer-trusted certifications from your practice</p>
              </div>
            </div>
          </div>
        </section>

        {/* Unique Value Props - 3 Pillars */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Why SkillVee is Different
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                The only platform that combines free AI interview practice with automatic job applications
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <Card className="bg-white hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-100">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    🤖 AI Interview Coach
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Practice with our realistic AI interviewer covering Python, SQL, machine learning, statistics, and behavioral questions. Get instant feedback and improve your confidence.
                  </p>
                  <div className="flex justify-center">
                    <Badge className="bg-teal-50 text-teal-700 border-teal-200">
                      Always Free
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white hover:shadow-lg transition-shadow border-2 border-transparent hover:border-teal-100">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <Award className="w-7 h-7 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    ✅ Skill Validation
                  </h3>
                  <p className="text-gray-600 mb-4">
                    As you practice, we validate and certify your skills. Build a verified profile that employers trust, backed by your actual interview performance.
                  </p>
                  <div className="flex justify-center">
                    <Badge className="bg-teal-50 text-teal-700 border-teal-200">
                      Employer Trusted
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white hover:shadow-lg transition-shadow border-2 border-transparent hover:border-yellow-100">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-6" style={{backgroundColor: '#fef3c7'}}>
                    <Target className="w-7 h-7" style={{color: '#facc15'}} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    😴 Autopilot Job Applications
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Based on your validated skills, we automatically apply you to relevant data science jobs. Wake up to new interview opportunities.
                  </p>
                  <div className="flex justify-center">
                    <Badge style={{backgroundColor: '#fef3c7', color: '#ca8a04', borderColor: '#fde047'}}>
                      While You Sleep
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>


        {/* FAQ Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 relative">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                Everything you need to know to get started
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
                        Is SkillVee really completely free?
                      </h3>
                      <p className="text-gray-600">
                        Yes! Our AI interview practice is 100% free, forever. No hidden fees, no credit card required. We believe everyone should have access to quality interview preparation. We only earn revenue when we successfully help you land a job - companies pay us placement fees for qualified candidates.
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
                        How does the AI interviewer work?
                      </h3>
                      <p className="text-gray-600">
                        Our AI conducts realistic interviews tailored to specific companies and roles. It asks relevant questions covering Python, SQL, machine learning, statistics, and behavioral scenarios, then provides instant feedback on your answers.
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
                        Will companies actually contact me through SkillVee?
                      </h3>
                      <p className="text-gray-600">
                        Yes. As you practice and validate your skills, we connect you with companies in our partner network who are actively hiring for roles that match your demonstrated abilities.
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
                        What types of questions does it cover?
                      </h3>
                      <p className="text-gray-600">
                        We cover technical questions (Python, SQL, machine learning algorithms, statistics), case studies, behavioral questions, and company-specific scenarios based on actual interview patterns from top tech companies.
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
                        How long does it take to see results?
                      </h3>
                      <p className="text-gray-600">
                        Most users see improved confidence within their first few practice sessions. For job matching, it typically takes 2-4 weeks of consistent practice to build a strong enough profile for companies to reach out.
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
                        Do I need any experience to start?
                      </h3>
                      <p className="text-gray-600">
                        No! Whether you're a complete beginner or experienced professional, our AI adapts to your level. Start wherever you are, and we'll help you improve and showcase your growing skills to employers.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">Have more questions?</p>
              <Link href="/faq" className="text-blue-600 hover:text-blue-700 font-medium">
                View our complete FAQ →
              </Link>
            </div>
          </div>
        </section>


        {/* University Trust Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-50/50 via-white to-orange-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <Badge className="bg-gradient-to-r from-blue-100 to-orange-100 text-blue-700 border-blue-200 mb-6">
                🎓 Trusted by Students
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Trusted by Data Science Students at
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Students from the world's top universities choose SkillVee to prepare for their data science careers
              </p>
            </div>
            
            {/* University Logos Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-center mb-8">
              
              {/* MIT */}
              <div className="flex items-center justify-center h-24 px-4 rounded-lg hover:bg-white/60 transition-all duration-300 group">
                <Image 
                  src="/mit-logo.png" 
                  alt="MIT" 
                  width={140} 
                  height={70}
                  className="object-contain opacity-60 group-hover:opacity-100 transition-all duration-300"
                />
              </div>

              {/* Stanford */}
              <div className="flex items-center justify-center h-24 px-4 rounded-lg hover:bg-white/60 transition-all duration-300 group">
                <Image 
                  src="/stanford-logo.png" 
                  alt="Stanford University" 
                  width={120} 
                  height={60}
                  className="object-contain opacity-60 group-hover:opacity-100 transition-all duration-300"
                />
              </div>

              {/* UC Berkeley */}
              <div className="flex items-center justify-center h-24 px-4 rounded-lg hover:bg-white/60 transition-all duration-300 group">
                <Image 
                  src="/Berkeley-logo.png" 
                  alt="UC Berkeley" 
                  width={140} 
                  height={70}
                  className="object-contain opacity-60 group-hover:opacity-100 transition-all duration-300"
                />
              </div>

              {/* Carnegie Mellon */}
              <div className="flex items-center justify-center h-24 px-4 rounded-lg hover:bg-white/60 transition-all duration-300 group">
                <Image 
                  src="/carnegie-mellon-png.png" 
                  alt="Carnegie Mellon University" 
                  width={120} 
                  height={60}
                  className="object-contain opacity-60 group-hover:opacity-100 transition-all duration-300"
                />
              </div>

              {/* Harvard */}
              <div className="flex items-center justify-center h-24 px-4 rounded-lg hover:bg-white/60 transition-all duration-300 group">
                <Image 
                  src="/harvard-logo.svg" 
                  alt="Harvard University" 
                  width={140} 
                  height={70}
                  className="object-contain opacity-60 group-hover:opacity-100 transition-all duration-300"
                />
              </div>

              {/* University of Washington */}
              <div className="flex items-center justify-center h-24 px-4 rounded-lg hover:bg-white/60 transition-all duration-300 group">
                <Image 
                  src="/washington-logo.png" 
                  alt="University of Washington" 
                  width={90} 
                  height={45}
                  className="object-contain opacity-60 group-hover:opacity-100 transition-all duration-300"
                />
              </div>

              {/* Georgia Tech */}
              <div className="flex items-center justify-center h-24 px-4 rounded-lg hover:bg-white/60 transition-all duration-300 group">
                <Image 
                  src="/georgiatech-logo.png" 
                  alt="Georgia Institute of Technology" 
                  width={140} 
                  height={70}
                  className="object-contain opacity-60 group-hover:opacity-100 transition-all duration-300"
                />
              </div>

              {/* NYU */}
              <div className="flex items-center justify-center h-24 px-4 rounded-lg hover:bg-white/60 transition-all duration-300 group">
                <Image 
                  src="/nyu-logo.png" 
                  alt="New York University" 
                  width={120} 
                  height={60}
                  className="object-contain opacity-60 group-hover:opacity-100 transition-all duration-300"
                />
              </div>

            </div>


          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Why Choose SkillVee? 🤔
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                See how we stack up against other interview prep platforms
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="text-left p-3 sm:p-6 font-semibold text-sm sm:text-base">Features</th>
                      <th className="text-center p-3 sm:p-6 font-semibold bg-blue-700">
                        <div className="flex flex-col items-center">
                          <span className="text-lg sm:text-xl font-bold">SkillVee</span>
                          <Badge className="bg-yellow-500 text-yellow-900 mt-1 text-xs">
                            RECOMMENDED
                          </Badge>
                        </div>
                      </th>
                      <th className="text-center p-3 sm:p-6 font-semibold text-xs sm:text-base">InterviewQuery</th>
                      <th className="text-center p-3 sm:p-6 font-semibold text-xs sm:text-base">Pramp</th>
                      <th className="text-center p-3 sm:p-6 font-semibold text-xs sm:text-base">LeetCode</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 sm:p-6 font-medium text-gray-900 text-sm sm:text-base">AI-Powered Interview Practice</td>
                      <td className="p-3 sm:p-6 text-center bg-blue-50">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 mx-auto" />
                        <div className="text-xs text-teal-700 mt-1">Advanced AI</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Static content</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Human-only</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Code-only</div>
                      </td>
                    </tr>
                    
                    <tr className="border-b border-gray-100">
                      <td className="p-3 sm:p-6 font-medium text-gray-900 text-sm sm:text-base">Free Forever Access</td>
                      <td className="p-3 sm:p-6 text-center bg-blue-50">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 mx-auto" />
                        <div className="text-xs text-teal-700 mt-1">100% Free</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-red-600 mt-1">$39/month</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 mx-auto" />
                        <div className="text-xs text-teal-700 mt-1">Limited free</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-red-600 mt-1">$35/month</div>
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="p-3 sm:p-6 font-medium text-gray-900 text-sm sm:text-base">Automatic Job Applications</td>
                      <td className="p-3 sm:p-6 text-center bg-blue-50">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 mx-auto" />
                        <div className="text-xs text-teal-700 mt-1">While you sleep</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Manual only</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">No job board</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">No job board</div>
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="p-3 sm:p-6 font-medium text-gray-900 text-sm sm:text-base">Real-time Skill Validation</td>
                      <td className="p-3 sm:p-6 text-center bg-blue-50">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 mx-auto" />
                        <div className="text-xs text-teal-700 mt-1">AI-certified</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Self-assessment</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Peer feedback</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Pass/fail only</div>
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="p-3 sm:p-6 font-medium text-gray-900 text-sm sm:text-base">Data Science Focus</td>
                      <td className="p-3 sm:p-6 text-center bg-blue-50">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 mx-auto" />
                        <div className="text-xs text-teal-700 mt-1">100% DS focused</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 mx-auto" />
                        <div className="text-xs text-teal-700 mt-1">DS focused</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">General tech</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">General coding</div>
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="p-3 sm:p-6 font-medium text-gray-900 text-sm sm:text-base">Instant Feedback</td>
                      <td className="p-3 sm:p-6 text-center bg-blue-50">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 mx-auto" />
                        <div className="text-xs text-teal-700 mt-1">AI-powered</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Solutions only</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 mx-auto" />
                        <div className="text-xs text-teal-700 mt-1">From peers</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Pass/fail</div>
                      </td>
                    </tr>

                    <tr>
                      <td className="p-3 sm:p-6 font-medium text-gray-900 text-sm sm:text-base">Available 24/7</td>
                      <td className="p-3 sm:p-6 text-center bg-blue-50">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 mx-auto" />
                        <div className="text-xs text-teal-700 mt-1">Always on</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 mx-auto" />
                        <div className="text-xs text-teal-700 mt-1">Self-paced</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Scheduled</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 mx-auto" />
                        <div className="text-xs text-teal-700 mt-1">Self-paced</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </section>


        {/* Final CTA Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-teal-500 via-blue-600 to-blue-800 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full"></div>
            <div className="absolute bottom-20 left-1/4 w-12 h-12 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 border border-white rounded-full"></div>
          </div>
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full"></div>
            <div className="absolute bottom-20 left-1/4 w-12 h-12 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 border border-white rounded-full"></div>
          </div>
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <Badge className="bg-yellow-400 text-yellow-900 mb-6 sm:mb-8 text-sm font-semibold">
              🚀 Join 12,000+ Data Scientists
            </Badge>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Stop Applying. Start <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Practicing.</span>
            </h2>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed">
              Your dream data science job is waiting. Our AI will help you ace the interview, validate your skills, and apply you to jobs while you sleep. <strong className="text-white">Completely free, forever.</strong>
            </p>

            <div className="flex justify-center mb-8 sm:mb-12">
              {user ? (
                <Link href="/interview">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl">
                    <Brain className="w-5 h-5 mr-2" />
                    Start Practicing Free Now
                  </Button>
                </Link>
              ) : (
                <SignUpButton>
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl">
                    <Brain className="w-5 h-5 mr-2" />
                    Start Practicing Free Now
                  </Button>
                </SignUpButton>
              )}
            </div>


          </div>
        </section>

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
                  <li><Link href="/demo" className="hover:text-gray-800">Get in Touch</Link></li>
                  <li><Link href="/pricing" className="hover:text-gray-800">Pricing</Link></li>
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