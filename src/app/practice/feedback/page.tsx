"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
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

export default function PracticeFeedbackPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [selectedTab, setSelectedTab] = useState('ai-feedback');
  const [showCelebrationAlert, setShowCelebrationAlert] = useState(true);

  // Redirect to sign-in if not authenticated
  if (isLoaded && !user) {
    router.push('/sign-in?redirect_url=%2Fpractice%2Ffeedback');
    return null;
  }

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Actionable feedback with video timestamps and AI reasoning
  const actionableFeedback = {
    strengths: [{
      timestamp: "2:15",
      behavior: "Structured KPI Framework Approach",
      whatYouDid: "You immediately structured your response using the OKR framework, starting with objectives before diving into key results.",
      whyItWorked: "This systematic approach shows strategic thinking and aligns with how senior PMs organize complex problems.",
      impact: "Demonstrated Level 1/5 Strategic Thinking competency"
    }, {
      timestamp: "8:42",
      behavior: "Data-Driven Hypothesis Formation",
      whatYouDid: "You connected the retention drop to specific user behavior patterns in the commons_spaces table.",
      whyItWorked: "Shows you can translate business problems into measurable data points and form testable hypotheses.",
      impact: "Demonstrated Level 1/5 Data Analysis competency"
    }, {
      timestamp: "15:20",
      behavior: "User-Centric Problem Framing",
      whatYouDid: "You shifted focus from technical features to user motivations: 'Why do users leave after the first week?'",
      whyItWorked: "This reframe shows empathy and understanding that engagement is fundamentally about user value.",
      impact: "Demonstrated Level 1/5 User Empathy competency"
    }],
    improvements: [{
      timestamp: "4:30",
      behavior: "Vague Success Thresholds",
      whatYouDid: "You said 'increase engagement' without defining specific targets or timeframes.",
      whatWasMissing: "Specific, measurable thresholds (e.g., '15% increase in 7-day retention within Q2')",
      actionableNext: "Practice the SMART criteria: 'By Q2, increase 7-day retention from 23% to 35% for Commons spaces with 5+ members'",
      impact: "Limited Level 1/5 Strategic Thinking - needs quantification"
    }, {
      timestamp: "12:18",
      behavior: "Surface-Level Statistical Analysis",
      whatYouDid: "You mentioned A/B testing but didn't discuss sample size, significance levels, or confidence intervals.",
      whatWasMissing: "Statistical rigor in experimental design and interpretation methodology",
      actionableNext: "When proposing A/B tests, specify: sample size calculation, significance level (95%), and minimum detectable effect",
      impact: "Limited Level 1/5 Data Analysis - needs statistical depth"
    }, {
      timestamp: "18:45",
      behavior: "Incomplete Trade-off Analysis",
      whatYouDid: "You proposed AI features but didn't weigh development cost vs. user impact vs. technical complexity.",
      whatWasMissing: "Systematic evaluation of opportunity cost and resource allocation",
      actionableNext: "Use frameworks like ICE scoring (Impact/Confidence/Ease) to justify feature prioritization decisions",
      impact: "Limited Level 1/5 Technical Communication - needs structured decision reasoning"
    }]
  };

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ai-feedback">Feedback</TabsTrigger>
            <TabsTrigger value="skills">Skills Assessment</TabsTrigger>
            <TabsTrigger value="video-recording">Video Recording</TabsTrigger>
            <TabsTrigger value="interview-context">Interview Context</TabsTrigger>
          </TabsList>

          <TabsContent value="ai-feedback" className="mt-6">
            <Card>
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
                              star <= 3 
                                ? 'fill-primary text-primary' 
                                : 'fill-muted text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold text-muted-foreground">Solid Foundation</span>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        What You Did Best
                      </h5>
                      <p className="text-sm leading-relaxed">
                        You demonstrated strong strategic thinking by immediately structuring your response using the OKR framework. 
                        Your ability to connect business problems to measurable data points showed solid analytical skills, particularly 
                        when you linked retention drops to specific user behavior patterns. The way you reframed technical features 
                        around user motivations displayed excellent user empathy.
                      </p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Top Opportunities for Growth
                      </h5>
                      <p className="text-sm leading-relaxed">
                        Focus on adding specificity to your success metrics by defining concrete targets and timeframes using the SMART criteria. 
                        Strengthen your statistical analysis by incorporating sample size calculations and significance levels in your A/B test proposals. 
                        When proposing features, include systematic trade-off analysis using frameworks like ICE scoring to demonstrate 
                        structured decision-making.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Key Strengths */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Key Strengths
                    </h4>
                    <div className="space-y-3">
                      {actionableFeedback.strengths.map((strength, index) => (
                        <Collapsible key={index}>
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 text-left space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-muted-foreground">
                                    {strength.timestamp}
                                  </span>
                                  <ChevronRight className="w-3 h-3 text-muted-foreground group-data-[state=open]:rotate-90 transition-transform" />
                                </div>
                                <span className="text-sm font-medium">{strength.behavior}</span>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="ml-7 mt-2 space-y-2 p-3 bg-muted/30 rounded-lg">
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">What You Did</p>
                                <p className="text-sm">{strength.whatYouDid}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Why It Worked</p>
                                <p className="text-sm">{strength.whyItWorked}</p>
                              </div>
                              <div className="text-xs text-muted-foreground pt-1 border-t">
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
                      <Lightbulb className="w-4 h-4 text-muted-foreground" />
                      Growth Areas
                    </h4>
                    <div className="space-y-3">
                      {actionableFeedback.improvements.map((improvement, index) => (
                        <Collapsible key={index}>
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group">
                              <Lightbulb className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 text-left space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-muted-foreground">
                                    {improvement.timestamp}
                                  </span>
                                  <ChevronRight className="w-3 h-3 text-muted-foreground group-data-[state=open]:rotate-90 transition-transform" />
                                </div>
                                <span className="text-sm font-medium">{improvement.behavior}</span>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="ml-7 mt-2 space-y-2 p-3 bg-muted/30 rounded-lg">
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">What You Did</p>
                                <p className="text-sm">{improvement.whatYouDid}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">What Was Missing</p>
                                <p className="text-sm">{improvement.whatWasMissing}</p>
                              </div>
                              <div className="space-y-1 p-2 bg-primary/5 rounded">
                                <p className="text-xs font-medium text-primary">Actionable Next Step</p>
                                <p className="text-sm font-medium">{improvement.actionableNext}</p>
                              </div>
                              <div className="text-xs text-muted-foreground pt-1 border-t">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Skills Assessment
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of your demonstrated competencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Statistics and Experimentation */}
                  <div className="p-5 rounded-lg border">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium text-sm">Statistics and Experimentation</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium flex items-center gap-1">
                          Data Visualization
                          <div className="flex gap-0.5 ml-1">
                            {[1, 2, 3, 4].map(star => (
                              <Star key={star} className="w-3 h-3 fill-primary text-primary" />
                            ))}
                          </div>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium flex items-center gap-1">
                          Statistics
                          <div className="flex gap-0.5 ml-1">
                            {[1, 2, 3].map(star => (
                              <Star key={star} className="w-3 h-3 fill-primary text-primary" />
                            ))}
                          </div>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium flex items-center gap-1">
                          Hypothesis Testing
                          <div className="flex gap-0.5 ml-1">
                            {[1, 2, 3].map(star => (
                              <Star key={star} className="w-3 h-3 fill-muted-foreground text-muted-foreground" />
                            ))}
                            <Star className="w-3 h-3 text-muted-foreground/30" />
                          </div>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium flex items-center gap-1">
                          A/B Testing
                          <div className="flex gap-0.5 ml-1">
                            {[1, 2, 3].map(star => (
                              <Star key={star} className="w-3 h-3 fill-primary text-primary" />
                            ))}
                          </div>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium flex items-center gap-1">
                          Experimental Design
                          <div className="flex gap-0.5 ml-1">
                            {[1, 2, 3].map(star => (
                              <Star key={star} className="w-3 h-3 fill-muted-foreground text-muted-foreground" />
                            ))}
                            <Star className="w-3 h-3 text-muted-foreground/30" />
                          </div>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Product & Business Sense */}
                  <div className="p-5 rounded-lg border">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium text-sm">Product & Business Sense</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium flex items-center gap-1">
                          User Analysis
                          <div className="flex gap-0.5 ml-1">
                            {[1, 2, 3].map(star => (
                              <Star key={star} className="w-3 h-3 fill-primary text-primary" />
                            ))}
                          </div>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium flex items-center gap-1">
                          Product Analysis
                          <div className="flex gap-0.5 ml-1">
                            {[1, 2].map(star => (
                              <Star key={star} className="w-3 h-3 fill-muted-foreground text-muted-foreground" />
                            ))}
                            <Star className="w-3 h-3 text-muted-foreground/30" />
                          </div>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium flex items-center gap-1">
                          User Experience
                          <div className="flex gap-0.5 ml-1">
                            {[1, 2].map(star => (
                              <Star key={star} className="w-3 h-3 fill-muted-foreground text-muted-foreground" />
                            ))}
                            {[3].map(star => (
                              <Star key={star} className="w-3 h-3 text-muted-foreground/30" />
                            ))}
                          </div>
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">↑ Focus</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium flex items-center gap-1">
                          Business Strategy
                          <div className="flex gap-0.5 ml-1">
                            {[1, 2].map(star => (
                              <Star key={star} className="w-3 h-3 fill-muted-foreground text-muted-foreground" />
                            ))}
                            {[3].map(star => (
                              <Star key={star} className="w-3 h-3 text-muted-foreground/30" />
                            ))}
                          </div>
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">↑ Focus</span>
                      </div>
                    </div>
                  </div>

                  {/* System Design & Architecture */}
                  <div className="p-5 rounded-lg border">
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium text-sm">System Design & Architecture</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium flex items-center gap-1">
                          Data Pipeline Design
                          <div className="flex gap-0.5 ml-1">
                            {[1, 2, 3].map(star => (
                              <Star key={star} className="w-3 h-3 fill-muted-foreground text-muted-foreground" />
                            ))}
                            <Star className="w-3 h-3 text-muted-foreground/30" />
                          </div>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium flex items-center gap-1">
                          Data Architecture
                          <div className="flex gap-0.5 ml-1">
                            {[1, 2, 3].map(star => (
                              <Star key={star} className="w-3 h-3 fill-muted-foreground text-muted-foreground" />
                            ))}
                            <Star className="w-3 h-3 text-muted-foreground/30" />
                          </div>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium flex items-center gap-1">
                          Scalability Design
                          <div className="flex gap-0.5 ml-1">
                            {[1, 2, 3].map(star => (
                              <Star key={star} className="w-3 h-3 fill-muted-foreground text-muted-foreground" />
                            ))}
                            <Star className="w-3 h-3 text-muted-foreground/30" />
                          </div>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium flex items-center gap-1">
                          Real-time Processing
                          <div className="flex gap-0.5 ml-1">
                            {[1, 2].map(star => (
                              <Star key={star} className="w-3 h-3 fill-muted-foreground text-muted-foreground" />
                            ))}
                            {[3, 4].map(star => (
                              <Star key={star} className="w-3 h-3 text-muted-foreground/30" />
                            ))}
                          </div>
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">↑ Focus</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="mt-6 flex gap-4 justify-center text-xs border-t pt-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <span className="text-muted-foreground">Met or exceeded expectations</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-muted-foreground text-muted-foreground" />
                    <span className="text-muted-foreground">Developing</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-muted-foreground/30" />
                    <span className="text-muted-foreground">Gap to target</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video-recording" className="mt-6">
            <Card>
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
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <MessageSquare className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-lg mb-2">Interview Video Player</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Duration: 23:42 | Case: Meta Commons PM Interview
                      </p>
                      <Button variant="outline" className="gap-2">
                        <Play className="w-4 h-4" />
                        Play Recording
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interview-context" className="mt-6">
            <Card>
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
                <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border">
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
                  <div className="border rounded-lg p-4 bg-card">
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
                  <div className="border rounded-lg p-4 bg-card">
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