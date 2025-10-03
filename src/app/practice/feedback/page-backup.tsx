"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Lightbulb, 
  MessageSquare, 
  Brain, 
  BarChart3, 
  Users, 
  Star, 
  Rocket, 
  FileText, 
  Zap, 
  ChevronRight, 
  X, 
  Sparkles,
  Play 
} from 'lucide-react';

function PracticeFeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const [selectedTab, setSelectedTab] = useState('ai-feedback');
  const [showCelebrationAlert, setShowCelebrationAlert] = useState(true);

  // Get params from URL
  const assessmentId = searchParams.get('assessmentId');
  const interviewId = searchParams.get('interviewId');

  // Fetch assessment data
  const { data: assessment, isLoading, error } = api.assessment.getById.useQuery(
    { assessmentId: assessmentId! },
    {
      enabled: !!assessmentId,
      retry: false
    }
  );

  // Alternative: fetch by interview ID if no assessment ID
  const { data: assessmentByInterview, isLoading: interviewLoading, error: interviewError } = api.assessment.getByInterviewId.useQuery(
    { interviewId: interviewId! },
    {
      enabled: !assessmentId && !!interviewId,
      retry: false
    }
  );

  // Use whichever assessment we got
  const currentAssessment = assessment || assessmentByInterview;
  const isLoadingData = isLoading || interviewLoading;
  const hasError = error || interviewError;

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in?redirect_url=%2Fpractice%2Ffeedback');
    }
  }, [isLoaded, user, router]);

  // Redirect if no params provided
  useEffect(() => {
    if (!assessmentId && !interviewId) {
      router.push('/practice');
    }
  }, [assessmentId, interviewId, router]);

  // Show loading state while checking auth or loading data
  if (!isLoaded || isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Show error state if assessment not found
  if (hasError || !currentAssessment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Assessment Not Found</h1>
          <p className="text-gray-600 mb-6">
            {hasError?.message || "This assessment doesn't exist or you don't have access to it."}
          </p>
          <Button onClick={() => router.push('/practice')} className="bg-blue-600 hover:bg-blue-700">
            Back to Practice
          </Button>
        </div>
      </div>
    );
  }

  // Transform assessment data for display
  const actionableFeedback = {
    strengths: currentAssessment.feedbackItems
      ?.filter(item => item.feedbackType === 'STRENGTH')
      .map(item => ({
        timestamp: item.timestampDisplay,
        behavior: item.behaviorTitle,
        whatYouDid: item.whatYouDid,
        whyItWorked: item.whyItWorked || '',
        impact: item.impactStatement
      })) || [],
    improvements: currentAssessment.feedbackItems
      ?.filter(item => item.feedbackType === 'GROWTH_AREA')
      .map(item => ({
        timestamp: item.timestampDisplay,
        behavior: item.behaviorTitle,
        whatYouDid: item.whatYouDid,
        whatWasMissing: item.whatWasMissing || '',
        actionableNext: item.actionableNextStep || '',
        impact: item.impactStatement
      })) || []
  };

  // Transform skill scores for display
  const skillsByCategory = currentAssessment.skillScores?.reduce((acc, skill) => {
    if (!acc[skill.categoryName]) {
      acc[skill.categoryName] = {
        name: skill.categoryName,
        icon: skill.categoryIcon,
        order: skill.categoryOrder,
        skills: []
      };
    }
    acc[skill.categoryName].skills.push({
      name: skill.skillName,
      score: skill.skillScore,
      isFocusArea: skill.isFocusArea,
      order: skill.skillOrder
    });
    return acc;
  }, {} as Record<string, any>) || {};

  const categoriesArray = Object.values(skillsByCategory).sort((a: any, b: any) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Celebration Alert */}
        {showCelebrationAlert && (
          <div className="animate-fade-in">
            <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-lg p-3 md:p-4">
              <button 
                onClick={() => setShowCelebrationAlert(false)} 
                className="absolute right-2 top-2 p-1 rounded-md hover:bg-muted/50 transition-colors" 
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
              
              <div className="flex items-start gap-3 md:gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-sm md:text-base font-semibold">
                      Great job completing your mock interview!
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      While you were focused on performing, we were busy certifying your skills. Now, if you'd like, we can put those skills to work—by applying you to high-fit job opportunities while you sleep. And yes, it's completely free.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Complete Profile & Get Matched
                    </Button>
                    <Button size="sm" variant="ghost">
                      Try Another Interview
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="animate-fade-in">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="ai-feedback" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-500">Feedback</TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-500">Skills Assessment</TabsTrigger>
            <TabsTrigger value="video-recording" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-500">Video Recording</TabsTrigger>
            <TabsTrigger value="interview-context" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-500">Interview Context</TabsTrigger>
          </TabsList>

          <TabsContent value="ai-feedback" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Performance Rating */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      Overall Performance
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= currentAssessment.overallScore
                                ? 'fill-primary text-primary'
                                : 'fill-gray-300 text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold text-gray-400">{currentAssessment.performanceLabel}</span>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-green-600" />
                        What You Did Best
                      </h5>
                      <p className="text-sm leading-relaxed">
                        {currentAssessment.whatYouDidBest}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-1">
                        <Target className="w-4 h-4 text-orange-600" />
                        Top Opportunities for Growth
                      </h5>
                      <p className="text-sm leading-relaxed">
                        {currentAssessment.topOpportunitiesForGrowth}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Key Strengths */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-500" />
                      Key Strengths
                    </h4>
                    <div className="space-y-3">
                      {actionableFeedback.strengths.map((strength, index) => (
                        <Collapsible key={index}>
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 text-left space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-gray-500">
                                    {strength.timestamp}
                                  </span>
                                  <ChevronRight className="w-3 h-3 text-gray-400 group-data-[state=open]:rotate-90 transition-transform" />
                                </div>
                                <span className="text-sm font-medium">{strength.behavior}</span>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="ml-7 mt-2 space-y-2 p-3 bg-gray-50/50 rounded-lg">
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500">What You Did</p>
                                <p className="text-sm">{strength.whatYouDid}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500">Why It Worked</p>
                                <p className="text-sm">{strength.whyItWorked}</p>
                              </div>
                              <div className="text-xs text-gray-500 pt-1 border-t border-gray-200">
                                {strength.impact}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </div>

                  {/* Growth Areas */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-gray-500" />
                      Growth Areas
                    </h4>
                    <div className="space-y-3">
                      {actionableFeedback.improvements.map((improvement, index) => (
                        <Collapsible key={index}>
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                              <Lightbulb className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 text-left space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-gray-500">
                                    {improvement.timestamp}
                                  </span>
                                  <ChevronRight className="w-3 h-3 text-gray-400 group-data-[state=open]:rotate-90 transition-transform" />
                                </div>
                                <span className="text-sm font-medium">{improvement.behavior}</span>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="ml-7 mt-2 space-y-2 p-3 bg-gray-50/50 rounded-lg">
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500">What You Did</p>
                                <p className="text-sm">{improvement.whatYouDid}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500">What Was Missing</p>
                                <p className="text-sm">{improvement.whatWasMissing}</p>
                              </div>
                              <div className="space-y-1 p-2 bg-primary/5 rounded">
                                <p className="text-xs font-medium text-primary">Actionable Next Step</p>
                                <p className="text-sm font-medium">{improvement.actionableNext}</p>
                              </div>
                              <div className="text-xs text-gray-500 pt-1 border-t border-gray-200">
                                {improvement.impact}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  Skills Assessment
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of your demonstrated competencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Dynamic skill categories */}
                  {categoriesArray.length > 0 ? (
                    categoriesArray.map((category: any) => (
                      <div key={category.name} className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          {category.icon === 'bar-chart' && <BarChart3 className="w-4 h-4 text-gray-600" />}
                          {category.icon === 'target' && <Target className="w-4 h-4 text-gray-600" />}
                          {category.icon === 'brain' && <Brain className="w-4 h-4 text-gray-600" />}
                          <span className="font-medium text-sm">{category.name}</span>
                        </div>
                        <div className="space-y-2">
                          {category.skills.sort((a: any, b: any) => a.order - b.order).map((skill: any) => (
                            <div key={skill.name} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-sm">{skill.name}</span>
                                {skill.isFocusArea && (
                                  <span className="text-xs text-orange-600 font-medium">↑ Focus</span>
                                )}
                              </div>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star
                                    key={star}
                                    className={`w-3 h-3 ${
                                      star <= skill.score
                                        ? 'fill-blue-500 text-blue-500'
                                        : 'fill-gray-200 text-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center text-gray-500">
                      No skills assessment data available
                    </div>
                  )}
                </div>

                {/* Legend */}
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                          {[4, 5].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                        <span className="text-sm flex-1">Hypothesis Testing</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                          {[4, 5].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                        <span className="text-sm flex-1">A/B Testing</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                          {[4, 5].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                        <span className="text-sm flex-1">Experimental Design</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                          {[4, 5].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                        </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-sm">Product & Business Sense</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                        <span className="text-sm flex-1">User Analysis</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                          {[4, 5].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                        <span className="text-sm flex-1">Product Analysis</span>
                        <div className="flex gap-0.5">
                          {[1, 2].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                          {[3, 4, 5].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-sm">User Experience</span>
                          <span className="text-xs text-orange-600 font-medium">↑ Focus</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                          {[3, 4, 5].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-sm">Business Strategy</span>
                          <span className="text-xs text-orange-600 font-medium">↑ Focus</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                          {[3, 4, 5].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Design & Architecture */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-sm">System Design & Architecture</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                        <span className="text-sm flex-1">Data Pipeline Design</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                          {[4, 5].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                        <span className="text-sm flex-1">Data Architecture</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                          {[4, 5].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                        <span className="text-sm flex-1">Scalability Design</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                          {[4, 5].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-sm">Real-time Processing</span>
                          <span className="text-xs text-orange-600 font-medium">↑ Focus</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                          {[3, 4, 5].map(star => (
                            <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="mt-6 flex gap-6 justify-center text-xs pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className="w-3 h-3 fill-blue-500 text-blue-500" />
                      ))}
                    </div>
                    <span className="text-gray-600">Skill proficiency level</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video-recording" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Interview Recording
                </CardTitle>
                <CardDescription>
                  Your 23-minute Product Manager interview session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <MessageSquare className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-lg mb-2">Interview Video Player</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Duration: 23:42 | Case: Meta Commons PM Interview
                      </p>
                      <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 rounded-md shadow-sm transition-colors">
                        <Play className="w-4 h-4" />
                        Play Recording
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interview-context" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Interview Case Study
                </CardTitle>
                <CardDescription>
                  The complete case context you were assessed on
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-bold text-primary mb-4">Product Manager</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Review and understand the assessment case and questions.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Role & Context</h4>
                      <p className="text-sm leading-relaxed">
                        You are a Senior Product Manager at Meta, focused on evolving the social interaction features within 
                        the core Facebook app, specifically enhancing the "Rooms" product to incorporate elements of persistent 
                        community spaces leveraging emerging technologies like AI and enhanced spatial audio. Your goal 
                        is to increase sustained user engagement and build thriving communities within these spaces.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Product Overview</h4>
                      <p className="text-sm leading-relaxed">
                        The "Rooms" product currently allows users to create temporary video chat rooms. The new initiative, 
                        codenamed "Commons," aims to enable users to create personalized, persistent digital spaces where 
                        communities can gather asynchronously and synchronously, utilizing new interactive features powered by AI 
                        (e.g., AI companions, generative content) and spatial audio for a more immersive experience.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Challenge</h4>
                      <p className="text-sm leading-relaxed text-orange-600">
                        Despite initial excitement about the new features, user retention within these persistent spaces after the first 
                        week is lower than anticipated. You have access to various data sources to understand user behavior.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Database Schema */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Available Data Sources</h4>
                  
                  {/* Commons Spaces Table */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-card">
                    <h5 className="font-medium mb-3 text-primary">Table: commons_spaces</h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 font-medium">Column</th>
                            <th className="text-left py-2 px-3 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr className="border-b">
                            <td className="py-2 px-3 font-mono text-xs">space_id</td>
                            <td className="py-2 px-3">Unique identifier for the space</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 px-3 font-mono text-xs">creator_user_id</td>
                            <td className="py-2 px-3">User ID who created the space</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 px-3 font-mono text-xs">creation_date</td>
                            <td className="py-2 px-3">Date the space was created</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 px-3 font-mono text-xs">space_type</td>
                            <td className="py-2 px-3">Type of space (e.g., 'private', 'public', 'group')</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 px-3 font-mono text-xs">theme</td>
                            <td className="py-2 px-3">Custom theme/template applied</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-mono text-xs">capacity</td>
                            <td className="py-2 px-3">Maximum number of concurrent users</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Space Sessions Table */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-card">
                    <h5 className="font-medium mb-3 text-primary">Table: space_sessions</h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 font-medium">Column</th>
                            <th className="text-left py-2 px-3 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr className="border-b">
                            <td className="py-2 px-3 font-mono text-xs">session_id</td>
                            <td className="py-2 px-3">Unique identifier for the user session in a space</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 px-3 font-mono text-xs">space_id</td>
                            <td className="py-2 px-3">Identifier of the space visited</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 px-3 font-mono text-xs">user_id</td>
                            <td className="py-2 px-3">User ID who visited</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 px-3 font-mono text-xs">start_time</td>
                            <td className="py-2 px-3">Timestamp when the session started</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 px-3 font-mono text-xs">end_time</td>
                            <td className="py-2 px-3">Timestamp when the session ended (NULL if ongoing)</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-mono text-xs">duration_seconds</td>
                            <td className="py-2 px-3">Length of the session in seconds (calculated)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}