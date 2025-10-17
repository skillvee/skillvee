"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import confetti from 'canvas-confetti';
import { api } from "~/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
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
  Star,
  FileText,
  ChevronRight,
  X,
  Sparkles
} from 'lucide-react';

function PracticeFeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const [selectedTab, setSelectedTab] = useState('ai-feedback');
  const [showCelebrationAlert, setShowCelebrationAlert] = useState(true);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

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

  // Confetti effect on page load
  useEffect(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Left side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });

      // Right side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

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

  // Get questions from assessment
  const questions = currentAssessment.questions || [];

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
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg h-auto">
            <TabsTrigger value="ai-feedback" className="text-sm md:text-base text-center data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-500 px-2 py-2 h-auto whitespace-nowrap">Feedback</TabsTrigger>
            <TabsTrigger value="skills" className="text-sm md:text-base text-center data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-500 px-2 py-2 h-auto whitespace-nowrap">Skills</TabsTrigger>
            <TabsTrigger value="video-recording" className="text-sm md:text-base text-center data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-500 px-2 py-2 h-auto whitespace-nowrap">Video</TabsTrigger>
            <TabsTrigger value="interview-context" className="text-sm md:text-base text-center data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-500 px-2 py-2 h-auto whitespace-nowrap">Context</TabsTrigger>
          </TabsList>

          <TabsContent value="ai-feedback" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Overall Performance */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-gray-500" />
                    Overall Performance
                  </h4>

                  {/* Stars and Label - Single Row Left Aligned */}
                  <div className="flex items-center gap-4 py-2">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-8 h-8 ${
                            star <= currentAssessment.overallScore
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-300 text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xl font-semibold text-gray-700">{currentAssessment.performanceLabel}</span>
                  </div>

                  {/* What You Did Best / Top Opportunities */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative bg-gradient-to-br from-green-50 to-emerald-50/30 border border-green-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="absolute top-3 right-3 opacity-10">
                        <Sparkles className="w-16 h-16 text-green-600" />
                      </div>
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Sparkles className="w-5 h-5 text-green-600" />
                          </div>
                          <h5 className="text-lg font-bold text-gray-900">What You Did Best</h5>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-700">
                          {currentAssessment.whatYouDidBest}
                        </p>
                      </div>
                    </div>
                    <div className="relative bg-gradient-to-br from-orange-50 to-amber-50/30 border border-orange-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="absolute top-3 right-3 opacity-10">
                        <Target className="w-16 h-16 text-orange-600" />
                      </div>
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Target className="w-5 h-5 text-orange-600" />
                          </div>
                          <h5 className="text-lg font-bold text-gray-900">Top Opportunities for Growth</h5>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-700">
                          {currentAssessment.topOpportunitiesForGrowth}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question-by-Question Breakdown */}
                {questions.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-gray-500" />
                      Question-by-Question Breakdown
                    </h4>
                    <div className="space-y-4">
                      {questions.map((question: any, index: number) => (
                        <Collapsible key={question.id}>
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-start gap-4 p-5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-base font-semibold text-blue-700">Q{index + 1}</span>
                              </div>
                              <div className="flex-1 text-left space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                  <span className="text-base font-semibold text-gray-900">{question.questionText}</span>
                                  <ChevronRight className="w-5 h-5 text-gray-400 group-data-[state=open]:rotate-90 transition-transform flex-shrink-0 mt-0.5" />
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="font-mono">{question.timeRange}</span>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-3.5 h-3.5 ${
                                          star <= question.score
                                            ? 'fill-blue-500 text-blue-500'
                                            : 'fill-gray-300 text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-gray-600 font-medium">{question.scoreLabel}</span>
                                </div>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-4 p-6 bg-gray-50/50 rounded-lg space-y-6">
                              {/* Question summaries - styled differently from interview-level */}
                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <h5 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                      Key Strengths
                                    </h5>
                                  </div>
                                  <p className="text-sm leading-relaxed text-gray-700 pl-6">
                                    {question.whatYouDidBest}
                                  </p>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Lightbulb className="w-4 h-4 text-orange-600" />
                                    <h5 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                      Areas to Improve
                                    </h5>
                                  </div>
                                  <p className="text-sm leading-relaxed text-gray-700 pl-6">
                                    {question.topOpportunitiesForGrowth}
                                  </p>
                                </div>
                              </div>

                              {/* Collapsible strengths and growth areas */}
                              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                                {/* Strengths column */}
                                <div className="space-y-3">
                                  <h5 className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    Detailed Strengths ({question.feedbackItems?.filter((item: any) => item.feedbackType === 'STRENGTH').length || 0})
                                  </h5>
                                  <div className="space-y-2">
                                    {question.feedbackItems
                                      ?.filter((item: any) => item.feedbackType === 'STRENGTH')
                                      .map((strength: any, idx: number) => (
                                        <Collapsible key={idx}>
                                          <CollapsibleTrigger className="w-full">
                                            <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer group text-left">
                                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <span className="text-xs font-mono text-gray-400 flex-shrink-0">{strength.timestampDisplay}</span>
                                                <span className="text-sm font-medium text-gray-900 truncate">{strength.behaviorTitle}</span>
                                              </div>
                                              <ChevronRight className="w-4 h-4 text-gray-400 group-data-[state=open]:rotate-90 transition-transform flex-shrink-0" />
                                            </div>
                                          </CollapsibleTrigger>
                                          <CollapsibleContent>
                                            <div className="mt-2 p-4 bg-white rounded-lg border border-gray-200 space-y-3 text-sm">
                                              <div>
                                                <p className="font-semibold text-gray-600 mb-1.5 text-xs uppercase tracking-wide">What You Did</p>
                                                <p className="text-gray-700 leading-relaxed">{strength.whatYouDid}</p>
                                              </div>
                                              <div>
                                                <p className="font-semibold text-gray-600 mb-1.5 text-xs uppercase tracking-wide">Why It Worked</p>
                                                <p className="text-gray-700 leading-relaxed">{strength.whyItWorked}</p>
                                              </div>
                                            </div>
                                          </CollapsibleContent>
                                        </Collapsible>
                                      ))}
                                  </div>
                                </div>

                                {/* Growth Areas column */}
                                <div className="space-y-3">
                                  <h5 className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                                    <Lightbulb className="w-4 h-4 text-orange-600" />
                                    Detailed Areas to Improve ({question.feedbackItems?.filter((item: any) => item.feedbackType === 'GROWTH_AREA').length || 0})
                                  </h5>
                                  <div className="space-y-2">
                                    {question.feedbackItems
                                      ?.filter((item: any) => item.feedbackType === 'GROWTH_AREA')
                                      .map((improvement: any, idx: number) => (
                                        <Collapsible key={idx}>
                                          <CollapsibleTrigger className="w-full">
                                            <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer group text-left">
                                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <span className="text-xs font-mono text-gray-400 flex-shrink-0">{improvement.timestampDisplay}</span>
                                                <span className="text-sm font-medium text-gray-900 truncate">{improvement.behaviorTitle}</span>
                                              </div>
                                              <ChevronRight className="w-4 h-4 text-gray-400 group-data-[state=open]:rotate-90 transition-transform flex-shrink-0" />
                                            </div>
                                          </CollapsibleTrigger>
                                          <CollapsibleContent>
                                            <div className="mt-2 p-4 bg-white rounded-lg border border-gray-200 space-y-3 text-sm">
                                              <div>
                                                <p className="font-semibold text-gray-600 mb-1.5 text-xs uppercase tracking-wide">What You Did</p>
                                                <p className="text-gray-700 leading-relaxed">{improvement.whatYouDid}</p>
                                              </div>
                                              <div>
                                                <p className="font-semibold text-gray-600 mb-1.5 text-xs uppercase tracking-wide">What Was Missing</p>
                                                <p className="text-gray-700 leading-relaxed">{improvement.whatWasMissing}</p>
                                              </div>
                                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                <p className="font-semibold text-blue-900 mb-1.5 text-xs uppercase tracking-wide">Actionable Next Step</p>
                                                <p className="text-gray-900 leading-relaxed">{improvement.actionableNextStep}</p>
                                              </div>
                                            </div>
                                          </CollapsibleContent>
                                        </Collapsible>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </div>
                )}
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
                  {categoriesArray.map((category: any) => (
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
                  ))}
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
                  Total Duration: {Math.floor((currentAssessment.videoDurationSeconds || 0) / 60)}:{((currentAssessment.videoDurationSeconds || 0) % 60).toString().padStart(2, '0')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.length > 0 ? (
                  <>
                    {/* Question Selector Tabs */}
                    <div className="flex gap-2 border-b border-gray-200">
                      {questions.map((question: any, index: number) => (
                        <button
                          key={question.id}
                          onClick={() => setSelectedQuestionIndex(index)}
                          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            index === selectedQuestionIndex
                              ? 'border-blue-600 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Question {index + 1}
                        </button>
                      ))}
                    </div>

                    {/* Video Player Area */}
                    <div className="space-y-4">
                      {/* Current Question Info */}
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-700">Q{selectedQuestionIndex + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-gray-900 mb-1">
                              {questions[selectedQuestionIndex].questionText}
                            </h4>
                            <p className="text-sm text-gray-500">
                              <span className="font-mono">{questions[selectedQuestionIndex].timeRange}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Video Player */}
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        {currentAssessment.videoUrl ? (
                          <video
                            src={currentAssessment.videoUrl}
                            controls
                            className="w-full h-full rounded-lg"
                          />
                        ) : (
                          <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                              <MessageSquare className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-lg mb-2">Video Player</p>
                              <p className="text-sm text-gray-500">
                                No recording available
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <MessageSquare className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-lg mb-2">Video Player</p>
                        <p className="text-sm text-gray-500">
                          No recording available
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                  <h3 className="text-xl font-bold text-primary mb-4">{currentAssessment.case?.caseTitle || "Interview Case"}</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Case Context</h4>
                      <p className="text-sm leading-relaxed">
                        {currentAssessment.case?.caseContext || "No context available"}
                      </p>
                    </div>

                    {currentAssessment.case?.caseData && (
                      <div>
                        <h4 className="font-semibold mb-2">Challenge</h4>
                        <p className="text-sm leading-relaxed">
                          {currentAssessment.case.caseData.challenge || JSON.stringify(currentAssessment.case.caseData, null, 2)}
                        </p>
                      </div>
                    )}
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

export default function PracticeFeedbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <PracticeFeedbackContent />
    </Suspense>
  );
}
