import { currentUser } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export default async function Home() {
  const user = await currentUser();

  return (
    <HydrateClient>
      <div className="min-h-screen bg-gray-50">
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
                  <Link href="/admin">
                    <Button variant="outline" size="sm">Admin</Button>
                  </Link>
                  <UserButton />
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <SignInButton>
                    <Button variant="outline">Sign In</Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button>Apply now</Button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <Badge variant="secondary" className="w-fit bg-blue-50 text-blue-700 border-blue-200">
                Free Forever
              </Badge>
              
              <div className="space-y-6">
                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                  Ace Your Data Science Interview—With AI
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Practice real interview questions. Get instant feedback on your answers, 
                  voice, and screen—just like a real hiring panel.
                </p>
                
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-600">•</span>
                    <span>Realistic AI interviewer</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-600">•</span>
                    <span>Actionable feedback, instantly</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-600">•</span>
                    <span>Unlimited, free practice</span>
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
              </div>
            </div>

            {/* Right Column - Interview Preview */}
            <div className="relative">
              <Card className="bg-white shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">AI Interviewer</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                      Live
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>AI:</strong> Can you explain how you would handle a dataset with a significant number of missing values?
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>You:</strong> Assess the pattern of missing data, then choose an imputation method like KNN or regression.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                      <p className="text-sm text-green-800">
                        <strong>✓</strong> Great answer! Consider mentioning specific imputation techniques.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" size="sm">
                      Previous
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Next question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How it works section */}
          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How it works 🔍
            </h2>
            <p className="text-lg text-gray-600 mb-16">
              Get the practice you need with our AI interview coach in three simple steps.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Role</h3>
                <p className="text-gray-600">Select from data science, analytics, or engineering positions</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Practice Interview</h3>
                <p className="text-gray-600">Answer AI-generated questions with voice and screen recording</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Feedback</h3>
                <p className="text-gray-600">Receive detailed analysis and improvement recommendations</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </HydrateClient>
  );
}
