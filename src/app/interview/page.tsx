"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { InterviewRecorder } from "~/components/ui/interview-recorder";
import { api } from "~/trpc/react";

export default function InterviewPage() {
  const { user: clerkUser, isLoaded } = useUser();
  const [currentInterviewId, setCurrentInterviewId] = useState<string | null>(null);
  const [interviewStatus, setInterviewStatus] = useState<"setup" | "active" | "completed">("setup");
  
  // Get user data via tRPC
  const { data: user, isLoading: userLoading } = api.user.getCurrentUser.useQuery(
    undefined,
    { enabled: !!clerkUser }
  );

  // Get available job descriptions (templates or user's own)
  const { data: jobDescriptions, isLoading: jobDescriptionsLoading } = api.jobDescription.list.useQuery(
    { limit: 1 },
    { enabled: !!user }
  );

  // Create interview mutation
  const createInterviewMutation = api.interview.create.useMutation({
    onSuccess: (interview) => {
      setCurrentInterviewId(interview.id);
      setInterviewStatus("active");
    },
  });

  // Create a demo job description if none exist
  const createDemoJobDescriptionMutation = api.jobDescription.create.useMutation();

  useEffect(() => {
    if (isLoaded && !clerkUser) {
      redirect("/sign-in");
    }
  }, [isLoaded, clerkUser]);

  if (!isLoaded || userLoading || jobDescriptionsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
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

  const handleStartInterview = async () => {
    try {
      let jobDescriptionId: string;

      // Check if we have any job descriptions
      if (jobDescriptions && jobDescriptions.items.length > 0) {
        jobDescriptionId = jobDescriptions.items[0]!.id;
      } else {
        // Create a demo job description
        const demoJobDescription = await createDemoJobDescriptionMutation.mutateAsync({
          title: "Data Scientist",
          company: "Demo Company",
          description: "Join our team as a Data Scientist to analyze complex datasets and build machine learning models.",
          requirements: [
            "Bachelor's degree in Computer Science, Statistics, or related field",
            "3+ years of experience in data science or machine learning",
            "Proficiency in Python and SQL",
            "Experience with pandas, scikit-learn, and other ML libraries",
            "Strong analytical and problem-solving skills"
          ],
          focusAreas: ["Python", "Machine Learning", "Statistics", "SQL"],
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
  };

  const handleRecordingComplete = (recordingId: string) => {
    console.log("Recording completed:", recordingId);
    // Here you could trigger assessment generation, etc.
  };

  const handleCompleteInterview = () => {
    setInterviewStatus("completed");
    setCurrentInterviewId(null);
  };

  if (interviewStatus === "setup") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Interview Platform
            </h1>
            <p className="text-lg text-gray-600">
              Welcome, {user.firstName ?? user.email}. Ready to start your mock interview?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Start New Interview</CardTitle>
                <CardDescription>
                  Begin a new mock interview session with AI-powered feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Role</label>
                  <Badge variant="outline" className="block w-fit">
                    {user.role}
                  </Badge>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleStartInterview}
                    disabled={createInterviewMutation.isPending || createDemoJobDescriptionMutation.isPending}
                    size="lg"
                    className="w-full"
                  >
                    {(createInterviewMutation.isPending || createDemoJobDescriptionMutation.isPending) 
                      ? "Creating..." 
                      : "Start Interview"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How it works</CardTitle>
                <CardDescription>
                  Your interview will be recorded and analyzed for feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li>Start your interview session</li>
                  <li>Begin screen and audio recording</li>
                  <li>Answer AI-generated questions</li>
                  <li>Receive detailed performance assessment</li>
                  <li>Review feedback and improvement areas</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recording Requirements</CardTitle>
              <CardDescription>
                Make sure your browser supports the following features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Screen Capture</h4>
                  <p className="text-gray-600">
                    We&apos;ll record your screen to analyze your problem-solving approach
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Audio Recording</h4>
                  <p className="text-gray-600">
                    Your voice will be captured to evaluate communication skills
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Secure Upload</h4>
                  <p className="text-gray-600">
                    Recordings are securely uploaded and processed by AI
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (interviewStatus === "active" && currentInterviewId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Active Interview Session
            </h1>
            <p className="text-gray-600">
              Record your interview responses. The session will be analyzed for feedback.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <InterviewRecorder
                interviewId={currentInterviewId}
                onRecordingComplete={handleRecordingComplete}
                defaultRecordingType="screen_and_audio"
                maxDuration={1800} // 30 minutes
                autoUpload={true}
              />
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interview Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium">Think Aloud</h4>
                    <p className="text-gray-600">
                      Verbalize your thought process as you work through problems
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Take Your Time</h4>
                    <p className="text-gray-600">
                      It&apos;s better to think through the problem than rush to a solution
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Ask Questions</h4>
                    <p className="text-gray-600">
                      Clarify requirements and constraints before diving in
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Session Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleCompleteInterview}
                    variant="outline"
                    className="w-full"
                  >
                    End Interview Session
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (interviewStatus === "completed") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Interview Completed!
            </h1>
            <p className="text-lg text-gray-600">
              Your recording has been uploaded and will be processed for feedback.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>What&apos;s Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">AI Analysis</h4>
                    <p className="text-sm text-gray-600">
                      Your recording will be analyzed for technical skills, communication, and problem-solving approach
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Detailed Feedback</h4>
                    <p className="text-sm text-gray-600">
                      Receive personalized feedback on strengths and areas for improvement
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Improvement Plan</h4>
                    <p className="text-sm text-gray-600">
                      Get recommended resources and practice areas based on your performance
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  onClick={() => {
                    setInterviewStatus("setup");
                    setCurrentInterviewId(null);
                  }}
                  className="w-full"
                >
                  Start Another Interview
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