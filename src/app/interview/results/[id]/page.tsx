"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";
import { ConversationExportService } from "~/server/services/conversation-export.service";
import { ArrowLeft, Download, FileText, MessageSquare, Camera } from "lucide-react";
import type { ConversationSession } from "~/lib/gemini-live";

export default function InterviewResultsPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  // Fetch conversation data
  const { data: conversationTranscript, isLoading, error } = api.interview.getConversationData.useQuery(
    { interviewId },
    { enabled: !!interviewId }
  );

  if (isLoading) {
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

  if (error || !conversationTranscript) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Error Loading Results</CardTitle>
              <CardDescription className="text-red-700">
                {error?.message || "Failed to load conversation data"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/interview/live")} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Interviews
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Reconstruct ConversationSession from database data
  const conversationSession: ConversationSession = {
    sessionId: conversationTranscript.sessionId,
    startTime: conversationTranscript.createdAt.toISOString(),
    endTime: conversationTranscript.interview.completedAt?.toISOString(),
    duration: conversationTranscript.duration,
    model: conversationTranscript.model,
    turns: conversationTranscript.turns as any[],
    screenCaptures: conversationTranscript.screenshots as any[],
    analytics: conversationTranscript.analytics as any,
  };

  const jobTitle = conversationTranscript.interview.jobDescription.title;
  const companyName = conversationTranscript.interview.jobDescription.companyName ||
                      conversationTranscript.interview.jobDescription.company;

  // Export handlers
  const handleDownloadJSON = () => {
    const json = ConversationExportService.exportAsJSON(conversationSession);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-${interviewId}-transcript.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    const markdown = ConversationExportService.exportAsMarkdown(conversationSession);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-${interviewId}-transcript.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyAnalysisPrompt = () => {
    const prompt = ConversationExportService.createAnalysisPrompt(conversationSession);
    navigator.clipboard.writeText(prompt);
    // You could add a toast notification here
    alert('Analysis prompt copied to clipboard!');
  };

  const analytics = conversationSession.analytics;
  const screenshots = conversationSession.screenCaptures;
  const turns = conversationSession.turns;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interview Results</h1>
            <p className="text-gray-600 mt-1">
              {jobTitle} {companyName && `at ${companyName}`}
            </p>
          </div>
          <Button onClick={() => router.push("/interview/live")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Interviews
          </Button>
        </div>

        {/* Session Info */}
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
            <CardDescription>Interview session details and metadata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Session ID</p>
                <p className="font-mono text-xs">{conversationSession.sessionId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold">{Math.floor((conversationSession.duration || 0) / 60)} minutes</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Model</p>
                <p className="font-semibold text-xs">{conversationSession.model.split('/').pop()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-sm">
                  {new Date(conversationSession.startTime).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Conversation Analytics
            </CardTitle>
            <CardDescription>Statistics about your interview conversation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{analytics?.totalTurns || turns.length}</p>
                <p className="text-sm text-gray-600 mt-1">Total Turns</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {analytics?.userTurns || turns.filter((t: any) => t.role === 'user').length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Your Responses</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {analytics?.assistantTurns || turns.filter((t: any) => t.role === 'assistant').length}
                </p>
                <p className="text-sm text-gray-600 mt-1">AI Questions</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{screenshots.length}</p>
                <p className="text-sm text-gray-600 mt-1">Screenshots</p>
              </div>
            </div>

            {analytics?.averageResponseTime > 0 && (
              <>
                <Separator className="my-4" />
                <div className="text-center">
                  <p className="text-sm text-gray-600">Average Response Time</p>
                  <p className="text-2xl font-semibold mt-1">
                    {analytics.averageResponseTime.toFixed(1)}s
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Full Transcript */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Full Transcript
            </CardTitle>
            <CardDescription>
              Complete conversation between you and the AI interviewer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {turns.map((turn: any, index: number) => (
                <div key={index} className="flex gap-3">
                  <Badge variant={turn.role === 'user' ? 'outline' : 'default'} className="h-fit">
                    {turn.role === 'user' ? '🧑 You' : '🤖 AI'}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm">{turn.content?.transcript || turn.content?.text || '[No text]'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(turn.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Screenshots Gallery */}
        {screenshots.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Screenshots Gallery
              </CardTitle>
              <CardDescription>
                Sample screenshots captured during your interview (showing first 8)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {screenshots.slice(0, 8).map((screenshot: any, index: number) => (
                  <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={`data:${screenshot.mimeType};base64,${screenshot.data}`}
                      alt={`Screenshot ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                      {new Date(screenshot.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
              {screenshots.length > 8 && (
                <p className="text-sm text-gray-600 mt-4 text-center">
                  + {screenshots.length - 8} more screenshots
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Export & Analysis
            </CardTitle>
            <CardDescription>
              Download your interview data or prepare for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleDownloadJSON} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download JSON
              </Button>
              <Button onClick={handleDownloadMarkdown} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Markdown
              </Button>
              <Button onClick={handleCopyAnalysisPrompt} variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Copy AI Analysis Prompt
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Tip: Use the AI Analysis Prompt to get detailed feedback on your interview performance
              from an AI assistant like Claude or ChatGPT.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
