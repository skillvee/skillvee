"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { LiveInterviewSession } from "~/components/interview/LiveInterviewSession";
import { GeminiLiveSettings } from "~/components/interview/GeminiLiveSettings";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { 
  Mic, 
  Settings as SettingsIcon, 
  Phone, 
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import type { GeminiLiveConfig, ConversationSession } from "~/lib/gemini-live";

export default function LiveInterviewPage() {
  const { user: clerkUser, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const caseId = searchParams.get('caseId');
  const [currentInterviewId, setCurrentInterviewId] = useState<string | null>(null);
  const [interviewData, setInterviewData] = useState<{ id: string } | null>(null);
  const [questionsData, setQuestionsData] = useState<Array<{ id: string; questionText: string; questionType: string; difficulty: string; expectedAnswer: string; evaluationCriteria: string[]; timeAllocation: number; followUpQuestions: string[] }>>([]);
  const [pageState, setPageState] = useState<"setup" | "settings" | "active" | "completed">("setup");
  const [caseContext, setCaseContext] = useState<string | null>(null);
  
  // Debug state changes
  useEffect(() => {
    console.log("State changed:", { pageState, currentInterviewId: !!currentInterviewId, interviewData: !!interviewData, questionsDataLength: questionsData.length });
  }, [pageState, currentInterviewId, interviewData, questionsData]);
  const [geminiConfig, setGeminiConfig] = useState<Partial<GeminiLiveConfig>>({
    model: 'models/gemini-2.5-flash-native-audio-preview-09-2025',
    responseModalities: ['AUDIO'],
    voice: 'Puck',
    enableInputTranscription: true,
    enableOutputTranscription: true,
    enableScreenCapture: true,
    systemInstruction: `You are a professional AI interviewer conducting a technical interview.

Guidelines:
- Speak clearly and at a moderate pace
- Ask follow-up questions to clarify responses
- Be encouraging but maintain professional standards
- Keep responses concise (10-30 seconds)
- Focus on technical accuracy and problem-solving approach
- Provide constructive feedback when appropriate`,
  });

  // Get user data via tRPC
  const { data: user, isLoading: userLoading } = api.user.getCurrentUser.useQuery(
    undefined,
    { enabled: !!clerkUser }
  );

  // Get available job descriptions
  const { data: jobDescriptions, isLoading: jobDescriptionsLoading } = api.jobDescription.list.useQuery(
    { limit: 1 },
    { enabled: !!user }
  );

  // Fetch case data if caseId is provided
  const { data: interviewCase, isLoading: caseLoading } = api.practice.getInterviewCase.useQuery(
    { caseId: caseId! },
    { enabled: !!caseId && !!user }
  );

  // Create interview mutation
  const createInterviewMutation = api.interview.create.useMutation({
    onSuccess: (interview) => {
      console.log("Interview created successfully:", interview);
      
      // Generate mock questions for the demo
      const mockQuestions = [
        {
          id: "q1",
          questionText: "Tell me about your experience with Python and data analysis. What projects have you worked on?",
          questionType: "TECHNICAL",
          difficulty: "MEDIUM",
          expectedAnswer: "Candidate should discuss specific Python libraries like pandas, numpy, matplotlib, and describe real projects they've worked on.",
          evaluationCriteria: [
            "Technical depth and accuracy",
            "Real-world application experience", 
            "Communication clarity",
            "Specific examples provided"
          ],
          timeAllocation: 300,
          followUpQuestions: [
            "Which Python libraries do you find most useful for data analysis?",
            "How do you handle missing data in your datasets?",
            "Can you walk me through your typical data analysis workflow?"
          ]
        },
        {
          id: "q2", 
          questionText: "Describe a challenging machine learning problem you've solved. What was your approach?",
          questionType: "TECHNICAL",
          difficulty: "SENIOR",
          expectedAnswer: "Should demonstrate problem-solving methodology, feature engineering, model selection, and evaluation metrics.",
          evaluationCriteria: [
            "Problem-solving methodology",
            "Technical implementation details",
            "Understanding of ML concepts",
            "Results evaluation and interpretation"
          ],
          timeAllocation: 450,
          followUpQuestions: [
            "How did you select your features?",
            "What evaluation metrics did you use and why?",
            "How did you handle overfitting?"
          ]
        },
        {
          id: "q3",
          questionText: "How would you design a recommendation system for an e-commerce platform?",
          questionType: "SYSTEM_DESIGN", 
          difficulty: "SENIOR",
          expectedAnswer: "Should cover collaborative filtering, content-based filtering, hybrid approaches, scalability considerations.",
          evaluationCriteria: [
            "System design thinking",
            "Understanding of recommendation algorithms",
            "Scalability considerations",
            "Trade-off analysis"
          ],
          timeAllocation: 600,
          followUpQuestions: [
            "How would you handle the cold start problem?",
            "What about real-time vs batch processing?",
            "How would you measure recommendation quality?"
          ]
        }
      ];
      
      // Set all state in the correct order
      setCurrentInterviewId(interview.id);
      setInterviewData(interview);
      setQuestionsData(mockQuestions);
      
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        console.log("Transitioning to active state...");
        setPageState("active");
      }, 100);
    },
    onError: (error) => {
      console.error("Failed to create interview:", error);
    },
  });

  // Create demo job description mutation
  const createDemoJobDescriptionMutation = api.jobDescription.create.useMutation();

  // Save conversation data mutation
  const saveConversationMutation = api.interview.saveConversationData.useMutation();

  // Check browser compatibility
  const [browserCompatibility, setBrowserCompatibility] = useState({
    webSocket: false,
    mediaDevices: false,
    audioContext: false,
    overall: false
  });

  // Handle starting interview (defined early so it can be used in useEffect)
  const handleStartInterview = useCallback(async () => {
    try {
      // Use case data if available, otherwise create demo job description
      let jobDescriptionId: string;

      if (interviewCase && interviewCase.practiceSession) {
        // Check if we already have a job description for this practice session
        const existingJobDesc = jobDescriptions?.[0];

        if (existingJobDesc) {
          jobDescriptionId = existingJobDesc.id;
        } else {
          // Create job description from case data
          const demoJobDescription = await createDemoJobDescriptionMutation.mutateAsync({
            title: interviewCase.practiceSession.jobTitle || "Data Professional",
            company: interviewCase.practiceSession.company || undefined,
            description: interviewCase.caseContext,
            requirements: interviewCase.practiceSession.focusAreas || ["Technical Interview Skills"],
            focusAreas: interviewCase.practiceSession.focusAreas || [],
            isTemplate: false,
          });
          jobDescriptionId = demoJobDescription.id;
        }
      } else {
        // Fallback to demo job description
        const demoJobDescription = await createDemoJobDescriptionMutation.mutateAsync({
          title: "Senior Data Scientist",
          company: "TechCorp AI",
          description: "Join our AI team as a Senior Data Scientist to build cutting-edge machine learning models and drive data-driven insights across the organization.",
          requirements: [
            "Masters/PhD in Computer Science, Statistics, or related field",
            "5+ years of experience in data science and machine learning",
            "Expert proficiency in Python, SQL, and ML frameworks",
            "Experience with deep learning, NLP, and computer vision",
            "Strong communication and leadership skills"
          ],
          focusAreas: ["Python Programming", "Machine Learning", "Deep Learning", "Statistics", "SQL", "Data Engineering"],
          isTemplate: false,
        });
        jobDescriptionId = demoJobDescription.id;
      }

      await createInterviewMutation.mutateAsync({
        jobDescriptionId,
        scheduledAt: new Date(),
      });
    } catch (error) {
      console.error("Failed to create interview:", error);
    }
  }, [interviewCase, jobDescriptions, createDemoJobDescriptionMutation, createInterviewMutation]);

  useEffect(() => {
    if (isLoaded && !clerkUser) {
      redirect("/sign-in");
    }
  }, [isLoaded, clerkUser]);

  // Process case data when loaded
  useEffect(() => {
    if (interviewCase && caseId) {
      console.log('Case data loaded:', interviewCase);

      // Set case context
      setCaseContext(interviewCase.caseContext);

      // Convert case questions to the format expected by LiveInterviewSession
      const formattedQuestions = interviewCase.caseQuestions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        questionType: "TECHNICAL",
        difficulty: "MEDIUM",
        expectedAnswer: q.questionContext || "",
        evaluationCriteria: q.skillsToEvaluate,
        timeAllocation: 300, // 5 minutes per question
        followUpQuestions: Array.isArray(q.followUpQuestions) ? q.followUpQuestions as string[] : []
      }));

      setQuestionsData(formattedQuestions);
    }
  }, [interviewCase, caseId]);

  // Auto-start interview when caseId is present and case data is loaded
  useEffect(() => {
    if (
      interviewCase &&
      caseId &&
      !currentInterviewId &&
      !createInterviewMutation.isPending &&
      !createDemoJobDescriptionMutation.isPending &&
      pageState === "setup" // Only auto-start if we're still in setup state
    ) {
      console.log('🚀 Auto-starting interview for case:', caseId);
      handleStartInterview();
    }
  }, [
    interviewCase,
    caseId,
    currentInterviewId,
    createInterviewMutation.isPending,
    createDemoJobDescriptionMutation.isPending,
    pageState,
    handleStartInterview
  ]);

  useEffect(() => {
    // Check browser compatibility
    const compatibility = {
      webSocket: typeof WebSocket !== 'undefined',
      mediaDevices: !!(navigator.mediaDevices?.getUserMedia),
      audioContext: !!(window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext),
      overall: false
    };
    
    compatibility.overall = compatibility.webSocket && compatibility.mediaDevices && compatibility.audioContext;
    setBrowserCompatibility(compatibility);
  }, []);

  if (!isLoaded || userLoading || jobDescriptionsLoading || (caseId && caseLoading)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Authentication Error</CardTitle>
              <CardDescription className="text-red-700">
                Unable to load user data. Please try signing out and signing back in.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const handleQuestionComplete = (questionId: string, answer: string) => {
    console.log(`Question ${questionId} completed with answer:`, answer);
  };

  const handleInterviewComplete = async (conversationData?: ConversationSession | null) => {
    if (!currentInterviewId || !conversationData) {
      console.log('No conversation data to save, showing completed state');
      setPageState("completed");
      return;
    }

    try {
      console.log('💾 Saving conversation data:', conversationData);

      await saveConversationMutation.mutateAsync({
        interviewId: currentInterviewId,
        conversationData: {
          sessionId: conversationData.sessionId,
          model: conversationData.model,
          duration: conversationData.duration,
          turns: conversationData.turns,
          screenCaptures: conversationData.screenCaptures,
          analytics: conversationData.analytics,
        },
      });

      console.log('✅ Conversation data saved successfully');

      // Redirect to results page
      router.push(`/interview/results/${currentInterviewId}`);
    } catch (error) {
      console.error('Failed to save conversation data:', error);
      // Still show completed state even if save fails
      setPageState("completed");
    }
  };

  const handleError = (error: string) => {
    console.error("Interview error:", error);
    // You could show a toast notification here
  };

  // Setup page
  if (pageState === "setup") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🎤 Gemini Live AI Interview
            </h1>
            <p className="text-lg text-gray-600">
              Real-time conversation with AI interviewer using Gemini Live API
            </p>
          </div>

          {/* Browser Compatibility Check */}
          <Card className={cn(
            browserCompatibility.overall 
              ? "border-teal-200 bg-teal-50" 
              : "border-yellow-200 bg-yellow-50"
          )}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {browserCompatibility.overall ? (
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                )}
                <span>Browser Compatibility</span>
              </CardTitle>
              <CardDescription>
                {browserCompatibility.overall 
                  ? "Your browser supports all required features for Gemini Live"
                  : "Some features may not work properly in your browser"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  {browserCompatibility.webSocket ? (
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">WebSocket Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  {browserCompatibility.mediaDevices ? (
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">Microphone Access</span>
                </div>
                <div className="flex items-center space-x-2">
                  {browserCompatibility.audioContext ? (
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">Audio Processing</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Start Interview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="w-5 h-5" />
                  <span>Start Live AI Interview</span>
                </CardTitle>
                <CardDescription>
                  Begin a real-time conversation with an AI interviewer powered by Gemini Live
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Role</label>
                  <Badge variant="outline" className="block w-fit">
                    {user.role}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">AI Model</label>
                  <Badge variant="outline" className="block w-fit">
                    {geminiConfig.model ?? 'models/gemini-2.0-flash-exp'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Voice</label>
                  <Badge variant="outline" className="block w-fit">
                    {geminiConfig.voice ?? 'Puck'}
                  </Badge>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    onClick={() => setPageState("settings")}
                    variant="outline"
                    className="w-full"
                  >
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Configure Settings
                  </Button>
                  
                  <Button
                    onClick={handleStartInterview}
                    disabled={
                      !browserCompatibility.overall ||
                      createInterviewMutation.isPending || 
                      createDemoJobDescriptionMutation.isPending
                    }
                    size="lg"
                    className="w-full"
                  >
                    {(createInterviewMutation.isPending || createDemoJobDescriptionMutation.isPending) ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Creating Interview...
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Start Live Interview
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* How it Works Card */}
            <Card>
              <CardHeader>
                <CardTitle>How Gemini Live Works</CardTitle>
                <CardDescription>
                  Real-time AI conversation with natural speech interaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li>AI establishes WebSocket connection to Gemini Live API</li>
                  <li>Real-time audio streaming (16-bit PCM at 16kHz)</li>
                  <li>Natural conversation with interruption support</li>
                  <li>Automatic session renewal every 25 minutes</li>
                  <li>Context preservation across question progression</li>
                  <li>Professional interview guidance and feedback</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Features Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Gemini Live Features</CardTitle>
              <CardDescription>
                Advanced AI conversation capabilities for professional interviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <Mic className="w-4 h-4 mr-2" />
                    Real-time Audio
                  </h4>
                  <p className="text-gray-600">
                    Bidirectional audio streaming with natural conversation flow and interruption support
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Session Management
                  </h4>
                  <p className="text-gray-600">
                    Automatic session renewal, context preservation, and graceful error recovery
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Customizable AI
                  </h4>
                  <p className="text-gray-600">
                    Multiple voices, models, and custom system instructions for personalized interviews
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Settings page
  if (pageState === "settings") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gemini Live Configuration</h1>
              <p className="text-gray-600">Customize your AI interviewer settings</p>
            </div>
            <Button
              onClick={() => setPageState("setup")}
              variant="outline"
            >
              Back to Setup
            </Button>
          </div>

          <GeminiLiveSettings
            config={geminiConfig}
            onConfigChange={setGeminiConfig}
            onSave={() => {
              console.log("Configuration saved:", geminiConfig);
              setPageState("setup");
            }}
            onReset={() => {
              console.log("Configuration reset");
            }}
          />
        </div>
      </div>
    );
  }

  // Active interview
  if (pageState === "active" && currentInterviewId && interviewData) {
    console.log("Rendering active interview:", { pageState, currentInterviewId, interviewData });

    // Use case data if available, otherwise use demo data
    const jobTitle = interviewCase?.practiceSession?.jobTitle || "Senior Data Scientist";
    const companyName = interviewCase?.practiceSession?.company || "TechCorp AI";
    const focusAreas = interviewCase?.practiceSession?.focusAreas || ["Python Programming", "Machine Learning", "Deep Learning", "Statistics", "SQL", "Data Engineering"];

    return (
      <div className="min-h-screen bg-gray-50">
        <LiveInterviewSession
          interview={{
            id: interviewData?.id ?? '',
            jobDescription: {
              title: jobTitle,
              companyName: companyName,
              focusAreas: focusAreas,
              difficulty: "SENIOR" as const,
            },
          }}
          questions={questionsData}
          geminiConfig={geminiConfig}
          caseContext={caseContext || undefined}
          onQuestionComplete={handleQuestionComplete}
          onInterviewComplete={handleInterviewComplete}
          onError={handleError}
        />
      </div>
    );
  }

  // Completed interview
  if (pageState === "completed") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Live Interview Completed! 🎉
            </h1>
            <p className="text-lg text-gray-600">
              Your conversation with the AI interviewer has been completed.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Session Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-600">AI Model Used</label>
                  <p>{geminiConfig.model}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Voice</label>
                  <p>{geminiConfig.voice}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Questions Covered</label>
                  <p>{questionsData.length} technical questions</p>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Session Type</label>
                  <p>Live Conversation</p>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  onClick={() => {
                    setPageState("setup");
                    setCurrentInterviewId(null);
                    setInterviewData(null);
                    setQuestionsData([]);
                  }}
                  className="w-full"
                >
                  Start Another Live Interview
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = "/interview"}
                >
                  Try Regular Interview Mode
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = "/dashboard"}
                >
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}