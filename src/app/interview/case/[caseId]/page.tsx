"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowLeft, Clock, CheckCircle } from "lucide-react";

export default function InterviewCasePage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;

  // Fetch case data
  const { data: interviewCase, isLoading, error } = api.practice.getInterviewCase.useQuery(
    { caseId },
    { enabled: !!caseId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interview case...</p>
        </div>
      </div>
    );
  }

  if (error || !interviewCase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Case Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error?.message || "This interview case doesn't exist."}
          </p>
          <Button onClick={() => router.push('/practice')} className="bg-blue-600 hover:bg-blue-700">
            Back to Practice
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl font-bold text-gray-900">{interviewCase.caseTitle}</h1>
          <div className="flex items-center gap-4 mt-2 text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {interviewCase.totalDuration} minutes
            </span>
          </div>
        </div>

        {/* Case Context */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Business Scenario</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{interviewCase.caseContext}</p>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Interview Questions</h2>

          {interviewCase.caseQuestions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                  <div className="flex gap-2">
                    {question.skillsToEvaluate.map((skillId) => (
                      <span
                        key={skillId}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {skillId}
                      </span>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900">{question.questionText}</p>
                  {question.questionContext && (
                    <p className="text-sm text-gray-600 mt-2">{question.questionContext}</p>
                  )}
                </div>

                {question.followUpQuestions && Array.isArray(question.followUpQuestions) && question.followUpQuestions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Follow-up Questions:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {(question.followUpQuestions as string[]).map((followUp, i) => (
                        <li key={i} className="text-sm text-gray-600">{followUp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => {
              // TODO: Start interview with Gemini Live
              console.log('Starting interview with case:', caseId);
            }}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Start Live Interview
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/practice/results?sessionId=' + interviewCase.practiceSessionId)}
          >
            Back to Session
          </Button>
        </div>
      </div>
    </div>
  );
}