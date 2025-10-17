"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import confetti from 'canvas-confetti';
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

// Mock assessment data
const mockAssessment = {
  id: "demo-assessment-123",
  overallScore: 3,
  performanceLabel: "Strong Foundation",
  whatYouDidBest: "You demonstrated strong strategic thinking by immediately structuring your response using the OKR framework. Your ability to connect business problems to measurable data points showed solid analytical skills, particularly when you linked retention drops to specific user behavior patterns.",
  topOpportunitiesForGrowth: "Focus on adding specificity to your success metrics by defining concrete targets and timeframes using the SMART criteria. Strengthen your statistical analysis by incorporating sample size calculations and significance levels in your A/B test proposals.",
  videoUrl: null,
  videoDurationSeconds: 1422,
  questions: [
    {
      id: "q1",
      questionText: "How would you define success for the Commons product?",
      timeRange: "2:15 - 5:30",
      scoreLabel: "Strong Response",
      score: 4,
      whatYouDidBest: "You demonstrated strong structured thinking by immediately organizing your response around the OKR framework and balancing leading/lagging indicators. Your consideration of stakeholder alignment showed mature product sense.",
      topOpportunitiesForGrowth: "Focus on adding quantifiable targets with specific timeframes using SMART criteria. Include counter-metrics to prevent unintended consequences, and consider segment-specific success criteria rather than one-size-fits-all metrics.",
      feedbackItems: [
        {
          feedbackType: 'STRENGTH',
          timestampDisplay: "2:15",
          behaviorTitle: "Structured KPI Framework Approach",
          whatYouDid: "You immediately structured your response using the OKR framework, starting with objectives before diving into key results.",
          whyItWorked: "This systematic approach shows strategic thinking and aligns with how senior PMs organize complex problems.",
          impactStatement: "Demonstrated Level 3/5 Strategic Thinking competency"
        },
        {
          feedbackType: 'STRENGTH',
          timestampDisplay: "3:22",
          behaviorTitle: "Balanced Metric Selection",
          whatYouDid: "You proposed tracking both leading indicators (engagement) and lagging indicators (retention), showing awareness of metric interdependencies.",
          whyItWorked: "This balanced approach prevents optimizing for vanity metrics at the expense of business outcomes.",
          impactStatement: "Demonstrated Level 4/5 Product Sense competency"
        },
        {
          feedbackType: 'STRENGTH',
          timestampDisplay: "4:10",
          behaviorTitle: "Stakeholder Consideration",
          whatYouDid: "You mentioned aligning success metrics with both user value and business objectives, noting the importance of cross-functional buy-in.",
          whyItWorked: "Senior PMs must balance multiple stakeholder perspectives when defining success.",
          impactStatement: "Demonstrated Level 3/5 Strategic Communication competency"
        },
        {
          feedbackType: 'GROWTH_AREA',
          timestampDisplay: "2:45",
          behaviorTitle: "Vague Success Thresholds",
          whatYouDid: "You said 'increase engagement' without defining specific targets or timeframes.",
          whatWasMissing: "Specific, measurable thresholds (e.g., '15% increase in 7-day retention within Q2')",
          actionableNextStep: "Practice the SMART criteria: 'By Q2, increase 7-day retention from 23% to 35% for Commons spaces with 5+ members'",
          impactStatement: "Limited Level 2/5 Strategic Thinking - needs quantification"
        },
        {
          feedbackType: 'GROWTH_AREA',
          timestampDisplay: "4:50",
          behaviorTitle: "Missing Counter-Metrics",
          whatYouDid: "You focused solely on positive metrics without discussing guardrail metrics to prevent unintended consequences.",
          whatWasMissing: "Counter-metrics like spam rate, user complaints, or feature abandonment to ensure quality isn't sacrificed for engagement.",
          actionableNextStep: "For each primary metric, define 1-2 counter-metrics. Example: 'While increasing posts/day, ensure spam reports stay below 2% and user satisfaction remains above 4.2/5'",
          impactStatement: "Limited Level 2/5 Systems Thinking - needs holistic view"
        },
        {
          feedbackType: 'GROWTH_AREA',
          timestampDisplay: "5:15",
          behaviorTitle: "Lack of Segmentation Strategy",
          whatYouDid: "You discussed overall product metrics without considering how success might differ across user segments.",
          whatWasMissing: "Segment-specific success criteria (power users vs. casual users, mobile vs. desktop, etc.)",
          actionableNextStep: "Define success by segment: 'For power users (top 20%), track weekly active spaces. For new users, focus on first-week activation with 3+ visits'",
          impactStatement: "Limited Level 2/5 User Analysis - needs segmentation thinking"
        }
      ]
    },
    {
      id: "q2",
      questionText: "Looking at the data, what patterns do you see in user retention?",
      timeRange: "8:42 - 12:30",
      scoreLabel: "Good Foundation",
      score: 3,
      whatYouDidBest: "You effectively used cohort analysis to identify temporal trends and successfully identified leading indicators like friend invitations that predict retention. Your data-driven hypothesis formation showed strong analytical capability.",
      topOpportunitiesForGrowth: "Strengthen your statistical rigor by including sample sizes and significance levels. Be more careful to distinguish correlation from causation, and avoid survivorship bias by analyzing churned users alongside retained users.",
      feedbackItems: [
        {
          feedbackType: 'STRENGTH',
          timestampDisplay: "8:42",
          behaviorTitle: "Data-Driven Hypothesis Formation",
          whatYouDid: "You connected the retention drop to specific user behavior patterns in the commons_spaces table.",
          whyItWorked: "Shows you can translate business problems into measurable data points and form testable hypotheses.",
          impactStatement: "Demonstrated Level 3/5 Data Analysis competency"
        },
        {
          feedbackType: 'STRENGTH',
          timestampDisplay: "9:30",
          behaviorTitle: "Cohort-Based Analysis Approach",
          whatYouDid: "You segmented users by join date and compared retention curves across cohorts to identify temporal trends.",
          whyItWorked: "Cohort analysis reveals whether retention issues are improving/worsening over time and helps isolate feature impact.",
          impactStatement: "Demonstrated Level 4/5 Analytics Thinking competency"
        },
        {
          feedbackType: 'STRENGTH',
          timestampDisplay: "10:15",
          behaviorTitle: "Identified Leading Indicators",
          whatYouDid: "You noted that users who invite 2+ friends in their first week show 3x higher retention, suggesting virality as a key lever.",
          whyItWorked: "Identifying early behavioral signals that predict long-term retention enables proactive intervention strategies.",
          impactStatement: "Demonstrated Level 4/5 Pattern Recognition competency"
        },
        {
          feedbackType: 'GROWTH_AREA',
          timestampDisplay: "9:05",
          behaviorTitle: "Surface-Level Statistical Analysis",
          whatYouDid: "You mentioned A/B testing but didn't discuss sample size, significance levels, or confidence intervals.",
          whatWasMissing: "Statistical rigor in experimental design and interpretation methodology",
          actionableNextStep: "When proposing A/B tests, specify: sample size calculation, significance level (95%), and minimum detectable effect",
          impactStatement: "Limited Level 2/5 Data Analysis - needs statistical depth"
        },
        {
          feedbackType: 'GROWTH_AREA',
          timestampDisplay: "11:20",
          behaviorTitle: "Correlation vs Causation Confusion",
          whatYouDid: "You stated that 'push notifications cause higher retention' based on observational data showing correlation.",
          whatWasMissing: "Acknowledgment that correlation doesn't prove causation; need for controlled experiments to establish causal relationships.",
          actionableNextStep: "When observing correlations, say: 'Users with notifications enabled show higher retention, suggesting a hypothesis worth testing in a controlled A/B test'",
          impactStatement: "Limited Level 2/5 Scientific Reasoning - needs causal thinking"
        },
        {
          feedbackType: 'GROWTH_AREA',
          timestampDisplay: "12:00",
          behaviorTitle: "Missing Survivorship Bias Check",
          whatYouDid: "You analyzed only active users without considering patterns among users who churned.",
          whatWasMissing: "Analysis of churned user cohorts to understand what they didn't do or what friction points caused drop-off.",
          actionableNextStep: "Always analyze both retained and churned segments: 'Let me compare the last-week activity of churned users vs retained users to identify drop-off signals'",
          impactStatement: "Limited Level 2/5 Critical Thinking - needs balanced analysis"
        }
      ]
    },
    {
      id: "q3",
      questionText: "What features would you prioritize to improve retention?",
      timeRange: "15:20 - 19:45",
      scoreLabel: "Room to Grow",
      score: 3,
      whatYouDidBest: "You demonstrated strong user empathy by grounding your proposals in user research findings and balanced short-term quick wins with long-term strategic bets, showing practical product leadership.",
      topOpportunitiesForGrowth: "Apply a clear prioritization framework (RICE, ICE) to sequence features systematically. Define specific success metrics and kill criteria for each feature before building, and validate technical feasibility with engineering partners early.",
      feedbackItems: [
        {
          feedbackType: 'STRENGTH',
          timestampDisplay: "15:20",
          behaviorTitle: "User-Centric Problem Framing",
          whatYouDid: "You shifted focus from technical features to user motivations: 'Why do users leave after the first week?'",
          whyItWorked: "This reframe shows empathy and understanding that engagement is fundamentally about user value.",
          impactStatement: "Demonstrated Level 3/5 User Empathy competency"
        },
        {
          feedbackType: 'STRENGTH',
          timestampDisplay: "16:45",
          behaviorTitle: "Referenced User Research",
          whatYouDid: "You cited findings from user interviews showing that abandoned spaces feel 'empty and purposeless' after initial excitement fades.",
          whyItWorked: "Grounding feature proposals in qualitative research demonstrates user-driven product thinking.",
          impactStatement: "Demonstrated Level 4/5 User Research Integration competency"
        },
        {
          feedbackType: 'STRENGTH',
          timestampDisplay: "18:30",
          behaviorTitle: "Quick Win + Long-term Strategy",
          whatYouDid: "You proposed both a quick win (better onboarding notifications) and a strategic bet (AI-powered content suggestions).",
          whyItWorked: "Balancing immediate impact with long-term vision shows practical product leadership.",
          impactStatement: "Demonstrated Level 4/5 Product Roadmap Thinking competency"
        },
        {
          feedbackType: 'GROWTH_AREA',
          timestampDisplay: "16:10",
          behaviorTitle: "Missing Prioritization Framework",
          whatYouDid: "You listed 5 feature ideas but didn't explain which to build first or how you'd sequence them.",
          whatWasMissing: "A clear prioritization rationale using frameworks like RICE, effort vs. impact matrix, or ICE scoring.",
          actionableNextStep: "After listing features, apply a framework: 'Using RICE scoring - notifications have high reach (80% of users), medium impact (20% retention lift), high confidence (backed by A/B test), and low effort (2 weeks). This scores 32, making it the top priority'",
          impactStatement: "Limited Level 2/5 Prioritization Skills - needs systematic approach"
        },
        {
          feedbackType: 'GROWTH_AREA',
          timestampDisplay: "17:25",
          behaviorTitle: "Vague Success Criteria for Features",
          whatYouDid: "You proposed an AI recommendation engine but didn't define what success looks like or how you'd measure it.",
          whatWasMissing: "Clear success metrics and kill criteria for each proposed feature before committing resources.",
          actionableNextStep: "For each feature, specify: 'We'll know the AI recommendations succeed if 30% of users engage with suggested content and 7-day retention improves by 10%. If we don't see 15% adoption after 4 weeks, we'll pivot or kill the feature'",
          impactStatement: "Limited Level 2/5 Product Measurement - needs outcome definition"
        },
        {
          feedbackType: 'GROWTH_AREA',
          timestampDisplay: "19:10",
          behaviorTitle: "Ignored Technical Feasibility",
          whatYouDid: "You suggested building a recommendation engine without discussing ML infrastructure, data requirements, or engineering complexity.",
          whatWasMissing: "Consideration of technical constraints, dependencies, and realistic timelines when proposing solutions.",
          actionableNextStep: "Partner with engineering: 'Before committing to ML-based recommendations, I'd validate with the eng team that we have sufficient user interaction data (need 10K+ events/day) and ML platform capabilities. If not, explore rule-based alternatives first'",
          impactStatement: "Limited Level 2/5 Technical Judgment - needs feasibility assessment"
        }
      ]
    }
  ],
  feedbackItems: [
    // Strengths
    {
      feedbackType: 'STRENGTH',
      timestampDisplay: "2:15",
      behaviorTitle: "Structured KPI Framework Approach",
      whatYouDid: "You immediately structured your response using the OKR framework, starting with objectives before diving into key results.",
      whyItWorked: "This systematic approach shows strategic thinking and aligns with how senior PMs organize complex problems.",
      impactStatement: "Demonstrated Level 3/5 Strategic Thinking competency"
    },
    {
      feedbackType: 'STRENGTH',
      timestampDisplay: "8:42",
      behaviorTitle: "Data-Driven Hypothesis Formation",
      whatYouDid: "You connected the retention drop to specific user behavior patterns in the commons_spaces table.",
      whyItWorked: "Shows you can translate business problems into measurable data points and form testable hypotheses.",
      impactStatement: "Demonstrated Level 3/5 Data Analysis competency"
    },
    {
      feedbackType: 'STRENGTH',
      timestampDisplay: "15:20",
      behaviorTitle: "User-Centric Problem Framing",
      whatYouDid: "You shifted focus from technical features to user motivations: 'Why do users leave after the first week?'",
      whyItWorked: "This reframe shows empathy and understanding that engagement is fundamentally about user value.",
      impactStatement: "Demonstrated Level 3/5 User Empathy competency"
    },
    // Growth Areas
    {
      feedbackType: 'GROWTH_AREA',
      timestampDisplay: "4:30",
      behaviorTitle: "Vague Success Thresholds",
      whatYouDid: "You said 'increase engagement' without defining specific targets or timeframes.",
      whatWasMissing: "Specific, measurable thresholds (e.g., '15% increase in 7-day retention within Q2')",
      actionableNextStep: "Practice the SMART criteria: 'By Q2, increase 7-day retention from 23% to 35% for Commons spaces with 5+ members'",
      impactStatement: "Limited Level 2/5 Strategic Thinking - needs quantification"
    },
    {
      feedbackType: 'GROWTH_AREA',
      timestampDisplay: "12:18",
      behaviorTitle: "Surface-Level Statistical Analysis",
      whatYouDid: "You mentioned A/B testing but didn't discuss sample size, significance levels, or confidence intervals.",
      whatWasMissing: "Statistical rigor in experimental design and interpretation methodology",
      actionableNextStep: "When proposing A/B tests, specify: sample size calculation, significance level (95%), and minimum detectable effect",
      impactStatement: "Limited Level 2/5 Data Analysis - needs statistical depth"
    }
  ],
  skillScores: [
    // Statistics and Experimentation
    { categoryName: "Statistics and Experimentation", categoryIcon: "bar-chart", categoryOrder: 1, skillName: "Data Visualization", skillScore: 5, isFocusArea: false, skillOrder: 1 },
    { categoryName: "Statistics and Experimentation", categoryIcon: "bar-chart", categoryOrder: 1, skillName: "Statistics", skillScore: 4, isFocusArea: false, skillOrder: 2 },
    { categoryName: "Statistics and Experimentation", categoryIcon: "bar-chart", categoryOrder: 1, skillName: "Hypothesis Testing", skillScore: 5, isFocusArea: false, skillOrder: 3 },
    { categoryName: "Statistics and Experimentation", categoryIcon: "bar-chart", categoryOrder: 1, skillName: "A/B Testing", skillScore: 3, isFocusArea: true, skillOrder: 4 },
    { categoryName: "Statistics and Experimentation", categoryIcon: "bar-chart", categoryOrder: 1, skillName: "Experimental Design", skillScore: 4, isFocusArea: false, skillOrder: 5 },
    // Product & Business Sense
    { categoryName: "Product & Business Sense", categoryIcon: "target", categoryOrder: 2, skillName: "User Analysis", skillScore: 5, isFocusArea: false, skillOrder: 1 },
    { categoryName: "Product & Business Sense", categoryIcon: "target", categoryOrder: 2, skillName: "Product Analysis", skillScore: 4, isFocusArea: false, skillOrder: 2 },
    { categoryName: "Product & Business Sense", categoryIcon: "target", categoryOrder: 2, skillName: "User Experience", skillScore: 5, isFocusArea: true, skillOrder: 3 },
    { categoryName: "Product & Business Sense", categoryIcon: "target", categoryOrder: 2, skillName: "Business Strategy", skillScore: 3, isFocusArea: true, skillOrder: 4 },
    // System Design & Architecture
    { categoryName: "System Design & Architecture", categoryIcon: "brain", categoryOrder: 3, skillName: "Data Pipeline Design", skillScore: 4, isFocusArea: false, skillOrder: 1 },
    { categoryName: "System Design & Architecture", categoryIcon: "brain", categoryOrder: 3, skillName: "Data Architecture", skillScore: 5, isFocusArea: false, skillOrder: 2 },
    { categoryName: "System Design & Architecture", categoryIcon: "brain", categoryOrder: 3, skillName: "Scalability Design", skillScore: 4, isFocusArea: false, skillOrder: 3 },
    { categoryName: "System Design & Architecture", categoryIcon: "brain", categoryOrder: 3, skillName: "Real-time Processing", skillScore: 3, isFocusArea: true, skillOrder: 4 }
  ],
  case: {
    caseTitle: "Meta Commons PM Interview",
    caseContext: "You are a Senior Product Manager at Meta, focused on evolving the social interaction features within the core Facebook app. The Rooms product currently allows users to create temporary video chat rooms. The new initiative, codenamed Commons, aims to enable users to create personalized, persistent digital spaces.",
    caseData: {
      challenge: "Despite initial excitement about the new features, user retention within these persistent spaces after the first week is lower than anticipated."
    }
  }
};

export default function FeedbackDemoPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('ai-feedback');
  const [showCelebrationAlert, setShowCelebrationAlert] = useState(true);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

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

  // Transform assessment data for display
  const actionableFeedback = {
    strengths: mockAssessment.feedbackItems
      .filter(item => item.feedbackType === 'STRENGTH')
      .map(item => ({
        timestamp: item.timestampDisplay,
        behavior: item.behaviorTitle,
        whatYouDid: item.whatYouDid,
        whyItWorked: item.whyItWorked || '',
        impact: item.impactStatement
      })),
    improvements: mockAssessment.feedbackItems
      .filter(item => item.feedbackType === 'GROWTH_AREA')
      .map(item => ({
        timestamp: item.timestampDisplay,
        behavior: item.behaviorTitle,
        whatYouDid: item.whatYouDid,
        whatWasMissing: item.whatWasMissing || '',
        actionableNext: item.actionableNextStep || '',
        impact: item.impactStatement
      }))
  };

  // Transform skill scores for display
  const skillsByCategory = mockAssessment.skillScores.reduce((acc, skill) => {
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
  }, {} as Record<string, any>);

  const categoriesArray = Object.values(skillsByCategory).sort((a: any, b: any) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Demo Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Demo Mode</h3>
                <p className="text-sm text-blue-700">This is a preview of the feedback page with sample data</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push('/practice')}>
              Go to Practice
            </Button>
          </div>
        </div>

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
                            star <= mockAssessment.overallScore
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-300 text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xl font-semibold text-gray-700">{mockAssessment.performanceLabel}</span>
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
                          {mockAssessment.whatYouDidBest}
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
                          {mockAssessment.topOpportunitiesForGrowth}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question-by-Question Breakdown */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-gray-500" />
                    Question-by-Question Breakdown
                  </h4>
                  <div className="space-y-4">
                    {mockAssessment.questions.map((question, index) => (
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
                                  Detailed Strengths ({question.feedbackItems.filter((item: any) => item.feedbackType === 'STRENGTH').length})
                                </h5>
                                <div className="space-y-2">
                                  {question.feedbackItems
                                    .filter((item: any) => item.feedbackType === 'STRENGTH')
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
                                  Detailed Areas to Improve ({question.feedbackItems.filter((item: any) => item.feedbackType === 'GROWTH_AREA').length})
                                </h5>
                                <div className="space-y-2">
                                  {question.feedbackItems
                                    .filter((item: any) => item.feedbackType === 'GROWTH_AREA')
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
                  Total Duration: {Math.floor((mockAssessment.videoDurationSeconds || 0) / 60)}:{((mockAssessment.videoDurationSeconds || 0) % 60).toString().padStart(2, '0')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question Selector Tabs */}
                <div className="flex gap-2 border-b border-gray-200">
                  {mockAssessment.questions.map((question, index) => (
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
                          {mockAssessment.questions[selectedQuestionIndex].questionText}
                        </h4>
                        <p className="text-sm text-gray-500">
                          <span className="font-mono">{mockAssessment.questions[selectedQuestionIndex].timeRange}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Video Player */}
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <MessageSquare className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-lg mb-2">Video Player</p>
                        <p className="text-sm text-gray-500">
                          No recording available in demo mode
                        </p>
                      </div>
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
                  <h3 className="text-xl font-bold text-primary mb-4">{mockAssessment.case.caseTitle}</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Case Context</h4>
                      <p className="text-sm leading-relaxed">
                        {mockAssessment.case.caseContext}
                      </p>
                    </div>

                    {mockAssessment.case.caseData && (
                      <div>
                        <h4 className="font-semibold mb-2">Challenge</h4>
                        <p className="text-sm leading-relaxed">
                          {mockAssessment.case.caseData.challenge}
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
