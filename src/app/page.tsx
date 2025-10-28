import { currentUser } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { CheckCircle, MessageSquare, Users, Target, TrendingUp, BarChart, Brain, Database, Award, Star, ArrowRight, Sparkles, FileText, Bot, UserX, Zap } from "lucide-react";
import HeroLottie from "~/components/hero-lottie";
import Navigation from "~/components/navigation";
import StructuredData from "~/components/seo/StructuredData";
import { generateWebApplicationSchema } from "~/lib/seo/schemas/webapp";

export default async function Home() {
  const user = await currentUser();

  return (
    <HydrateClient>
      <StructuredData data={generateWebApplicationSchema()} />
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <Navigation />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white">
          {/* Animated Code Background */}
          <div className="absolute inset-0 opacity-5 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 animate-pulse duration-3000">
              <div className="font-mono text-sm text-blue-600">
                def interview_prep():<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;return success
              </div>
            </div>
            <div className="absolute top-40 right-20 animate-pulse duration-4000 delay-1000">
              <div className="font-mono text-sm text-green-600">
                SELECT * FROM opportunities<br/>
                WHERE skills_match = 'perfect'
              </div>
            </div>
            <div className="absolute bottom-40 left-20 animate-pulse duration-5000 delay-2000">
              <div className="font-mono text-sm text-purple-600">
                import pandas as pd<br/>
                df.head()
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-6 py-16 sm:py-20 lg:py-24 relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Left Column */}
              <div className="space-y-6 sm:space-y-8 animate-fade-in text-center lg:text-left">
                <div className="space-y-4 sm:space-y-6">
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 w-fit mx-auto lg:mx-0 animate-bounce-in hover:scale-105 transition-transform duration-300">
                    ✨ Free Forever
                  </Badge>
                  
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight animate-slide-up">
                    <span className="text-gray-900">Turn interview prep into </span>
                    <span className="text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">real job offers</span>
                    <span className="text-gray-900">.</span>
                  </h1>
                  
                  <p className="text-lg sm:text-xl text-gray-600 leading-relaxed animate-fade-in-delay max-w-2xl mx-auto lg:mx-0">
                    Practice with realistic, AI-powered interviews tailored to your target company and role — and unlock new job opportunities along the way.
                  </p>


                  <div className="space-y-2 animate-fade-in-delay-2">
                    <div className="flex items-start space-x-3 group hover:translate-x-2 transition-transform duration-300 justify-center lg:justify-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-1 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-gray-700 font-medium"><span className="font-bold">Interactive</span> company-specific cases</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 group hover:translate-x-2 transition-transform duration-300 justify-center lg:justify-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-1 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-gray-700 font-medium"><span className="font-bold">Practical</span> role-tailored questions</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 group hover:translate-x-2 transition-transform duration-300 justify-center lg:justify-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-1 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-gray-700 font-medium"><span className="font-bold">Instant</span> AI feedback</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-delay-3 justify-center lg:justify-start">
                  {user ? (
                    <Link href="/practice">
                      <Button size="lg" className="w-full sm:w-auto min-w-[200px] bg-primary hover:bg-primary/90 text-primary-foreground transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                        Start Practicing Free
                      </Button>
                    </Link>
                  ) : (
                    <SignUpButton>
                      <Button size="lg" className="w-full sm:w-auto min-w-[200px] bg-primary hover:bg-primary/90 text-primary-foreground transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                        Start Practicing Free
                      </Button>
                    </SignUpButton>
                  )}
                  <Button 
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto min-w-[200px] bg-white border border-primary text-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105 hover:shadow-md"
                  >
                    See How It Works
                  </Button>
                </div>
              </div>

              {/* Right Column - Enhanced with floating elements */}
              <div className="relative overflow-visible animate-fade-in-delay-2 mt-8 lg:mt-0 hidden lg:block">
                {/* Background circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] rounded-full blur-lg" style={{backgroundColor: 'rgba(59, 130, 246, 0.25)'}}></div>
                
                
                {/* Main Lottie Animation */}
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

        {/* Social Proof Banner */}
        <section className="py-6 bg-gradient-to-r from-blue-50 to-blue-100 border-y border-blue-200">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-6">
            <div className="text-center">
              <p className="text-sm sm:text-base font-medium text-gray-700">
                Join <span className="font-bold text-blue-600">500+ professionals</span> on early access
                <span className="mx-2 text-gray-400">•</span>
                Backed by <a href="https://web.startx.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">Stanford StartX</a>
              </p>
            </div>
          </div>
        </section>

        {/* Companies section with Smart Social Proof */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Our candidates get amazing jobs at the top tech companies
              </h2>
              
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
              {/* Enhanced Company logos with hover effects and hiring indicators */}
              
              <div className="flex flex-col items-center group">
                <div className="relative flex items-center justify-center w-32 h-12 company-logo transition-all duration-300 group-hover:scale-110">
                  <Image 
                    src="/airbnb.png" 
                    alt="Airbnb" 
                    width={100} 
                    height={32}
                    className="object-contain"
                  />
</div>
              </div>

              <div className="flex flex-col items-center group">
                <div className="relative flex items-center justify-center w-32 h-12 company-logo transition-all duration-300 group-hover:scale-110">
                  <Image 
                    src="/microsoft-small.png" 
                    alt="Microsoft" 
                    width={100} 
                    height={32}
                    className="object-contain"
                  />
</div>
              </div>

              <div className="flex flex-col items-center group">
                <div className="relative flex items-center justify-center w-32 h-12 company-logo transition-all duration-300 group-hover:scale-110">
                  <Image 
                    src="/google-small.png" 
                    alt="Google" 
                    width={100} 
                    height={32}
                    className="object-contain"
                  />
</div>
              </div>

              <div className="flex flex-col items-center group">
                <div className="relative flex items-center justify-center w-32 h-12 company-logo transition-all duration-300 group-hover:scale-110">
                  <Image 
                    src="/Spotify.png" 
                    alt="Spotify" 
                    width={100} 
                    height={32}
                    className="object-contain"
                  />
</div>
              </div>

              <div className="flex flex-col items-center group">
                <div className="relative flex items-center justify-center w-32 h-12 company-logo transition-all duration-300 group-hover:scale-110">
                  <Image 
                    src="/netflix.png" 
                    alt="Netflix" 
                    width={100} 
                    height={32}
                    className="object-contain"
                  />
</div>
              </div>

              <div className="flex flex-col items-center group">
                <div className="relative flex items-center justify-center w-32 h-12 company-logo transition-all duration-300 group-hover:scale-110">
                  <Image 
                    src="/apple-small.png" 
                    alt="Apple" 
                    width={60} 
                    height={24}
                    className="object-contain"
                  />
</div>
              </div>

              <div className="flex flex-col items-center group">
                <div className="relative flex items-center justify-center w-32 h-12 company-logo transition-all duration-300 group-hover:scale-110">
                  <Image 
                    src="/meta-small.png" 
                    alt="Meta" 
                    width={100} 
                    height={32}
                    className="object-contain"
                  />
</div>
              </div>

              <div className="flex flex-col items-center group">
                <div className="relative flex items-center justify-center w-32 h-12 company-logo transition-all duration-300 group-hover:scale-110">
                  <Image 
                    src="/amazon-small.png" 
                    alt="Amazon" 
                    width={100} 
                    height={32}
                    className="object-contain"
                  />
</div>
              </div>
            </div>
            
          </div>
        </section>

        {/* The Broken Hiring Game - Visual Flow */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-6">
            <div className="text-center mb-16 sm:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                The Broken Hiring Game
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Everyone's using AI, but nobody's getting hired. See the vicious cycle.
              </p>
            </div>

            {/* Visual Flow Diagram */}
            <div className="relative max-w-5xl mx-auto">
              {/* The Broken Cycle */}
              <div className="mb-20">
                <h3 className="text-2xl font-bold text-center mb-12 text-gray-900">The Current Reality</h3>
                <div className="relative">
                  {/* Cycle container */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Step 1: AI Resumes */}
                    <div className="relative group">
                      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 h-full hover:shadow-lg transition-all duration-300">
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                          <FileText className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-bold text-lg text-gray-900 text-center mb-2">AI Resumes</h4>
                        <p className="text-sm text-gray-600 text-center">
                          Everyone uses ChatGPT to create "perfect" resumes
                        </p>
                      </div>
                      {/* Arrow to next */}
                      <div className="hidden md:block absolute top-1/2 -right-7 transform -translate-y-1/2 z-10">
                        <ArrowRight className="w-8 h-8 text-red-500 animate-pulse" />
                      </div>
                    </div>

                    {/* Step 2: AI Screening */}
                    <div className="relative group">
                      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 h-full hover:shadow-lg transition-all duration-300">
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                          <Bot className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-bold text-lg text-gray-900 text-center mb-2">AI vs AI Battle</h4>
                        <p className="text-sm text-gray-600 text-center">
                          Companies use AI to filter out AI-generated resumes
                        </p>
                      </div>
                      {/* Arrow to next */}
                      <div className="hidden md:block absolute top-1/2 -right-7 transform -translate-y-1/2 z-10">
                        <ArrowRight className="w-8 h-8 text-red-500 animate-pulse" />
                      </div>
                    </div>

                    {/* Step 3: Nobody Wins */}
                    <div className="relative group">
                      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 h-full hover:shadow-lg transition-all duration-300">
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                          <UserX className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-bold text-lg text-gray-900 text-center mb-2">Real Talent Lost</h4>
                        <p className="text-sm text-gray-600 text-center">
                          Companies struggle to find the best talent. Great candidates don't get seen
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* The Solution */}
              <div>
                <h3 className="text-2xl font-bold text-center mb-12 text-gray-900">
                  SkillVee Breaks the Cycle
                </h3>
                <div className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Step 1: Practice */}
                    <div className="relative group">
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 h-full hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-bold text-lg text-gray-900 text-center mb-2">Prep Interviews</h4>
                        <p className="text-sm text-gray-600 text-center">
                          Become your best through realistic interview simulations
                        </p>
                      </div>
                      {/* Arrow to next */}
                      <div className="hidden md:block absolute top-1/2 -right-7 transform -translate-y-1/2 z-10">
                        <ArrowRight className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>

                    {/* Step 2: Validate */}
                    <div className="relative group">
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 h-full hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                          <Award className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-bold text-lg text-gray-900 text-center mb-2">Get Verified</h4>
                        <p className="text-sm text-gray-600 text-center">
                          Effortlessly build a profile companies trust
                        </p>
                      </div>
                      {/* Arrow to next */}
                      <div className="hidden md:block absolute top-1/2 -right-7 transform -translate-y-1/2 z-10">
                        <ArrowRight className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>

                    {/* Step 3: Get Hired */}
                    <div className="relative group">
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 h-full hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                          <Zap className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-bold text-lg text-gray-900 text-center mb-2">Companies Find You</h4>
                        <p className="text-sm text-gray-600 text-center">
                          Skip the resume pile entirely
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white max-w-3xl mx-auto">
                <h4 className="text-xl sm:text-2xl font-bold mb-4">Ready to escape the AI resume wars?</h4>
                <p className="text-blue-100 mb-6">
                  Join data scientists who are getting hired based on real skills, not keyword games
                </p>
                {user ? (
                  <Link href="/practice">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 font-semibold shadow-lg">
                      Start Practicing Now
                    </Button>
                  </Link>
                ) : (
                  <SignUpButton>
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 font-semibold shadow-lg">
                      Start Practicing Now
                    </Button>
                  </SignUpButton>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works section - Video Featured */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50 overflow-visible">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16 sm:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Land your dream data science role in 3 proven steps
              </p>
            </div>
          </div>

          {/* Step 1 - Practice Like It's Real */}
          <div className="mb-24 lg:mb-32">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-0 lg:pl-6">
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                <div className="w-full lg:w-[40%] space-y-6 px-4 lg:px-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                      1
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Practice Like It's Real</h3>
                  </div>
                  <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                    Experience actual interview scenarios from top tech companies. Our AI interviewer adapts to your responses in real-time, providing instant feedback that helps you improve.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Company-specific questions</p>
                        <p className="text-sm text-gray-600">Real questions from Google, Meta, Netflix & more</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Adaptive AI interviewer</p>
                        <p className="text-sm text-gray-600">Probes deeper based on your answers</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Instant actionable feedback</p>
                        <p className="text-sm text-gray-600">Know exactly what to improve</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-[60%] lg:ml-auto">
                  <div className="relative rounded-l-2xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-900">
                    <video
                      className="w-full h-auto"
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls={false}
                    >
                      <source src="/practice-like-its-real.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 - Stand Out Instantly */}
          <div className="mb-24 lg:mb-32">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-0 lg:pr-6">
              <div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-12">
                <div className="w-full lg:w-[40%] space-y-6 px-4 lg:px-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                      2
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Stand Out Instantly</h3>
                  </div>
                  <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                    Transform your practice sessions into verified credentials. Build a dynamic profile that showcases your actual skills, making recruiters stop scrolling.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Award className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Skill validation badges</p>
                        <p className="text-sm text-gray-600">Earn certifications as you practice</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Performance metrics</p>
                        <p className="text-sm text-gray-600">Track your improvement over time</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Star className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Recruiter-visible profile</p>
                        <p className="text-sm text-gray-600">Companies can see your verified skills</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-[60%] lg:mr-auto">
                  <div className="relative rounded-r-2xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-900">
                    <video
                      className="w-full h-auto"
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls={false}
                    >
                      <source src="/Profile.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 - Jobs Find You */}
          <div className="mb-8">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-0 lg:pl-6">
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                <div className="w-full lg:w-[40%] space-y-6 px-4 lg:px-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                      3
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Jobs Find You</h3>
                  </div>
                  <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                    Stop the endless application cycle. Our AI matches you with perfect-fit roles and companies actively request interviews with top performers.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Target className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Smart job matching</p>
                        <p className="text-sm text-gray-600">AI finds roles that fit your verified skills</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Direct company requests</p>
                        <p className="text-sm text-gray-600">Top companies reach out to you directly</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Skip the resume pile</p>
                        <p className="text-sm text-gray-600">Your skills speak louder than keywords</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-[60%] lg:ml-auto">
                  {/* Interactive Job Matching Visual */}
                  <div className="relative rounded-l-2xl overflow-hidden shadow-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-8 lg:p-12">
                    <div className="space-y-4">
                      {/* Company request notifications matching the image style */}
                      <div className="bg-green-50 rounded-xl p-5 border border-green-200 transform transition-all duration-500 hover:scale-[1.02]">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 animate-pulse"></div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-lg">Google requested your profile</p>
                              <p className="text-gray-600 text-sm">Senior Data Scientist • 2 hours ago</p>
                            </div>
                          </div>
                          <span className="text-green-600 font-bold text-sm whitespace-nowrap">Top 5%</span>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200 transform transition-all duration-500 hover:scale-[1.02]">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 animate-pulse"></div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-lg">Meta invited you to apply</p>
                              <p className="text-gray-600 text-sm">ML Engineer • 5 hours ago</p>
                            </div>
                          </div>
                          <span className="text-blue-600 font-bold text-sm whitespace-nowrap">Fast-track</span>
                        </div>
                      </div>

                      <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-300 transform transition-all duration-500 hover:scale-[1.02]">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1.5 animate-pulse"></div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-lg">Direct interview offer</p>
                              <p className="text-gray-600 text-sm">Netflix • Data Analyst</p>
                            </div>
                          </div>
                          <span className="text-orange-600 font-bold text-sm whitespace-nowrap">Skip resume</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats banner */}
                    <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                      <div className="text-center">
                        <p className="text-2xl font-bold mb-2">Coming Soon</p>
                        <p className="text-sm opacity-90">Live job matching launches after beta</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 relative">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">Free Forever</h3>
                  <p className="text-gray-600 leading-relaxed">Unlimited AI practice sessions, no credit card needed</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">Auto Job Matching</h3>
                  <p className="text-gray-600 leading-relaxed">We apply you to perfect-fit roles automatically</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">Skill Validation</h3>
                  <p className="text-gray-600 leading-relaxed">Employer-trusted certifications from your practice</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 relative">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          </div>
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-6">
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
                      <span className="text-primary font-bold text-sm">Q</span>
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
                      <span className="text-primary font-bold text-sm">Q</span>
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
                      <span className="text-primary font-bold text-sm">Q</span>
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

            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">Have more questions?</p>
              <Link href="/faq" className="text-primary hover:text-blue-700 font-medium">
                View our complete FAQ →
              </Link>
            </div>
          </div>
        </section>



        {/* Comparison Table */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-6">
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
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="text-left p-3 sm:p-6 font-semibold text-sm sm:text-base">Features</th>
                      <th className="text-center p-3 sm:p-6 font-semibold bg-blue-700">
                        <span className="text-lg sm:text-xl font-bold">SkillVee</span>
                      </th>
                      <th className="text-center p-3 sm:p-6 font-semibold text-xs sm:text-base">InterviewQuery</th>
                      <th className="text-center p-3 sm:p-6 font-semibold text-xs sm:text-base">LeetCode</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 sm:p-6 font-medium text-gray-900 text-sm sm:text-base">AI-Powered Interview Practice</td>
                      <td className="p-3 sm:p-6 text-center bg-blue-50">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto" />
                        <div className="text-xs text-blue-700 mt-1">Advanced AI</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Static content</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Code-only</div>
                      </td>
                    </tr>
                    
                    <tr className="border-b border-gray-100">
                      <td className="p-3 sm:p-6 font-medium text-gray-900 text-sm sm:text-base">Free Forever Access</td>
                      <td className="p-3 sm:p-6 text-center bg-blue-50">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto" />
                        <div className="text-xs text-blue-700 mt-1">100% Free</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-red-600 mt-1">$39/month</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-red-600 mt-1">$35/month</div>
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="p-3 sm:p-6 font-medium text-gray-900 text-sm sm:text-base">Automatic Job Applications</td>
                      <td className="p-3 sm:p-6 text-center bg-blue-50">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto" />
                        <div className="text-xs text-blue-700 mt-1">While you sleep</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Manual only</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">No job board</div>
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="p-3 sm:p-6 font-medium text-gray-900 text-sm sm:text-base">Real-time Skill Validation</td>
                      <td className="p-3 sm:p-6 text-center bg-blue-50">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto" />
                        <div className="text-xs text-blue-700 mt-1">AI-certified</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Self-assessment</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Pass/fail only</div>
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="p-3 sm:p-6 font-medium text-gray-900 text-sm sm:text-base">Data Science Focus</td>
                      <td className="p-3 sm:p-6 text-center bg-blue-50">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto" />
                        <div className="text-xs text-blue-700 mt-1">100% DS focused</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto" />
                        <div className="text-xs text-blue-700 mt-1">DS focused</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">General coding</div>
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="p-3 sm:p-6 font-medium text-gray-900 text-sm sm:text-base">Instant Feedback</td>
                      <td className="p-3 sm:p-6 text-center bg-blue-50">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto" />
                        <div className="text-xs text-blue-700 mt-1">AI-powered</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Solutions only</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded mx-auto"></div>
                        <div className="text-xs text-gray-500 mt-1">Pass/fail</div>
                      </td>
                    </tr>

                    <tr>
                      <td className="p-3 sm:p-6 font-medium text-gray-900 text-sm sm:text-base">Available 24/7</td>
                      <td className="p-3 sm:p-6 text-center bg-blue-50">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto" />
                        <div className="text-xs text-blue-700 mt-1">Always on</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto" />
                        <div className="text-xs text-blue-700 mt-1">Self-paced</div>
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto" />
                        <div className="text-xs text-blue-700 mt-1">Self-paced</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </section>


        {/* Final CTA Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 relative overflow-hidden">
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

          <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-6 text-center relative z-10">
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
                <Link href="/practice">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 shadow-xl font-semibold border border-gray-200">
                    <Brain className="w-5 h-5 mr-2" />
                    Start Practicing Free Now
                  </Button>
                </Link>
              ) : (
                <SignUpButton>
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 shadow-xl font-semibold border border-gray-200">
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