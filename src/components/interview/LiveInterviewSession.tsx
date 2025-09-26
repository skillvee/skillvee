"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  RefreshCw,
  AlertCircle,
  Clock,
  Pause,
  Play,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { useGeminiLiveInterview, useGeminiLivePermissions } from "~/hooks/useGeminiLive";
import type { InterviewContext } from "~/lib/gemini-live";
import { api } from "~/trpc/react";
import { CaseContextDisplay } from "./CaseContextDisplay";
import { InterviewNotepad } from "./InterviewNotepad";

export interface LiveInterviewSessionProps {
  interview: {
    id: string;
    jobDescription: {
      title: string;
      companyName?: string;
      focusAreas: string[];
      difficulty: 'JUNIOR' | 'MEDIUM' | 'SENIOR';
    };
  };
  questions: Array<{
    id: string;
    questionText: string;
    questionType: string;
    difficulty: string;
    expectedAnswer?: string;
    evaluationCriteria?: string[];
    timeAllocation?: number;
    followUpQuestions?: string[];
  }>;
  caseContext?: string; // Add case context prop
  onQuestionComplete?: (questionId: string, answer: string) => void;
  onInterviewComplete?: () => void;
  onError?: (error: string) => void;
}

export function LiveInterviewSession({
  interview,
  questions,
  caseContext,
  onQuestionComplete,
  onInterviewComplete,
  onError
}: LiveInterviewSessionProps) {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSessionPaused, setIsSessionPaused] = useState(false);
  const [interviewNotes, setInterviewNotes] = useState("");

  // Gemini Live integration
  const geminiLive = useGeminiLiveInterview({
    onError: (error) => {
      console.error('Gemini Live error:', error);
      onError?.(error);
    },
    onTextReceived: ({ text }) => {
      console.log('AI text:', text);
    },
    onConnected: () => {
      console.log('AI interviewer connected');
    },
    onDisconnected: () => {
      console.log('AI interviewer disconnected');
    },
    onSessionRenewed: ({ sessionId }) => {
      console.log(`Session renewed: ${sessionId}`);
    },
  });

  // Permissions management
  const permissions = useGeminiLivePermissions();

  // tRPC mutation to start conversation (get API key)
  const startConversationMutation = api.ai.startConversation.useMutation();

  // Timer for elapsed time
  useEffect(() => {
    if (!sessionStarted || !interviewStartTime || isSessionPaused) return;

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - interviewStartTime.getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStarted, interviewStartTime, isSessionPaused]);

  // Start interview session
  const startSession = useCallback(async () => {
    if (!permissions.hasMicrophoneAccess) {
      const granted = await permissions.requestMicrophonePermission();
      if (!granted) {
        onError?.('Microphone access is required for the interview');
        return;
      }
    }

    try {
      // First, start the conversation via tRPC to get the config with API key
      console.log('📞 Starting conversation with tRPC for interview:', interview.id);
      const conversationResult = await startConversationMutation.mutateAsync({
        interviewId: interview.id,
        sessionConfig: {
          voice: 'alloy',
          speed: 1.0,
          temperature: 0.7,
          maxTokens: 2048,
        },
        context: {
          candidateName: 'Candidate',
          position: interview.jobDescription.title,
          company: interview.jobDescription.companyName || 'Company',
        },
      });

      console.log('✅ tRPC conversation started, result:', conversationResult);

      const context: InterviewContext = {
        interviewId: interview.id,
        jobTitle: interview.jobDescription.title,
        companyName: interview.jobDescription.companyName,
        focusAreas: interview.jobDescription.focusAreas,
        difficulty: interview.jobDescription.difficulty,
        questions,
        currentQuestionIndex: 0,
      };

      // Connect with the API key from the server (this now waits for setup completion)
      console.log('🔌 Connecting to Gemini Live with context:', context);
      await geminiLive.connect(context, conversationResult.config.apiKey);
      console.log('✅ Connection and setup completed!');

      console.log('🎤 Starting to listen for audio...');
      await geminiLive.startListening();
      console.log('🎯 StartListening completed, isListening:', geminiLive.isListening);

      setSessionStarted(true);
      setInterviewStartTime(new Date());
      console.log('🎉 Interview session fully started!');

      // Now send the greeting to start the actual interview conversation
      console.log('🎬 Starting interview conversation...');
      setTimeout(() => {
        geminiLive.sendInitialGreeting();
      }, 500); // Brief delay to ensure UI has updated

    } catch (error) {
      console.error('Failed to start session:', error);

      // Provide more specific error messages
      let errorMessage = 'Failed to start interview session';
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'Google AI API key is missing or invalid. Please check your environment configuration.';
        } else if (error.message.includes('Connection timeout')) {
          errorMessage = 'Connection to Gemini Live API timed out. Please check your internet connection and try again.';
        } else if (error.message.includes('Permission denied')) {
          errorMessage = 'Microphone permission is required for the interview. Please allow microphone access and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      onError?.(errorMessage);
    }
  }, [
    permissions.hasMicrophoneAccess,
    permissions.requestMicrophonePermission,
    interview,
    questions,
    geminiLive,
    startConversationMutation,
    onError
  ]);

  // End interview session
  const endSession = useCallback(async () => {
    try {
      await geminiLive.disconnect();
      setSessionStarted(false);
      setIsSessionPaused(false);
      onInterviewComplete?.();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }, [geminiLive, onInterviewComplete]);

  // Pause/Resume session
  const togglePause = useCallback(() => {
    if (isSessionPaused) {
      geminiLive.startListening().catch(console.error);
    } else {
      geminiLive.stopListening();
    }
    setIsSessionPaused(!isSessionPaused);
  }, [isSessionPaused, geminiLive]);

  // Reconnect if needed
  const handleReconnect = useCallback(async () => {
    try {
      await geminiLive.reconnect();
    } catch (error) {
      console.error('Reconnection failed:', error);
    }
  }, [geminiLive]);

  // Format elapsed time
  const formatElapsedTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  // Mock case context for demonstration
  const mockCaseContext = caseContext || `You are working as a Data Scientist at Meta. You're analyzing one of the platform's core features - the **one-on-one video calling** system that connects billions of users worldwide through Facebook Messenger. The feature has been a cornerstone of Meta's communication tools for years, enabling friends and family to have face-to-face conversations regardless of physical distance. To help inform strategic decisions about the feature's evolution, you have access to two comprehensive datasets:

### Table: \`video_calls\`

| Column           | Description                         |
|-----------------|-------------------------------------|
| caller          | User ID initiating the call         |
| recipient       | User ID receiving the call          |
| ds              | Date of the call                    |
| call_id         | Unique call identifier              |
| duration_seconds| Length of the call in seconds       |

Here is some example data:

| caller | recipient | ds         | call_id | duration_seconds |
|--------|-----------|------------|---------|------------------|
| 458921 | 672104    | 2023-01-01 | v8k2p9  | 183             |
| 458921 | 891345    | 2023-01-01 | m4n7v2  | 472             |
| 672104 | 234567    | 2023-01-02 | x9h5j4  | 256             |
| 891345 | 345678    | 2023-01-02 | q2w3e4  | 67              |
| 345678 | 891345    | 2023-01-03 | t7y8u9  | 124             |
| 234567 | 458921    | 2023-01-03 | p3l5k8  | 538             |

### Table: \`daily_active_users\`

| Column           | Description                               |
|-----------------|-------------------------------------------|
| user_id         | Unique identifier for the user            |
| ds              | Date the user was active/logged in        |
| country         | User's country                            |
| daily_active_flag| Indicates if user was active that day (1) |

Below you can see an example data:

| user_id | ds         | country | daily_active_flag |
|---------|-----------|---------|--------------------|
| 458921  | 2023-01-01| France  | 1                 |
| 672104  | 2023-01-01| France  | 1                 |
| 891345  | 2023-01-01| Spain   | 1                 |
| 234567  | 2023-01-02| France  | 1                 |
| 345678  | 2023-01-02| France  | 1                 |
| 458921  | 2023-01-03| France  | 1                 |

The company is considering launching a **group video chat** feature. You'll be using these tables for analysis on user behavior, potential demand, and how to measure success.`;

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header with session status - Full width */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                Live AI Interview: {interview.jobDescription.title}
              </CardTitle>
              {interview.jobDescription.companyName && (
                <p className="text-sm text-muted-foreground mt-1">
                  {interview.jobDescription.companyName}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {sessionStarted && (
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{formatElapsedTime(elapsedTime)}</span>
                </div>
              )}
              <ConnectionStatus
                connectionState={geminiLive.connectionState}
                isListening={geminiLive.isListening}
                isAISpeaking={geminiLive.isAISpeaking}
                audioLevel={geminiLive.audioLevel}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error handling */}
      {geminiLive.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{geminiLive.error}</span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={geminiLive.clearError}
              >
                Dismiss
              </Button>
              {geminiLive.connectionState === 'error' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReconnect}
                  disabled={['reconnecting', 'connecting'].includes(geminiLive.connectionState)}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Reconnect
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Permissions check */}
      {!permissions.hasMicrophoneAccess && (
        <Alert className="mb-6">
          <Mic className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Microphone access is required for voice interaction</span>
            <Button
              variant="outline"
              size="sm"
              onClick={permissions.requestMicrophonePermission}
            >
              Grant Access
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Session controls */}
      {!sessionStarted ? (
        <Card className="mb-6">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Ready to start your AI interview?</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                You&apos;ll be speaking with an AI interviewer who will ask questions about {interview.jobDescription.focusAreas.join(', ')}.
                The session will be recorded and you can interrupt the AI at any time.
              </p>

              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {interview.jobDescription.focusAreas.map((area) => (
                  <Badge key={area} variant="secondary">{area}</Badge>
                ))}
              </div>
            </div>

            <Button
              onClick={startSession}
              size="lg"
              className="w-48"
              disabled={!permissions.hasMicrophoneAccess || geminiLive.connectionState === 'connecting'}
            >
              {geminiLive.connectionState === 'connecting' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Start AI Interview
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Case Context */}
          <div className="lg:col-span-1 h-[calc(100vh-12rem)]">
            <CaseContextDisplay
              caseContent={mockCaseContext}
              title="Case Context"
              isCollapsible={true}
              className="h-full overflow-hidden"
            />
          </div>

          {/* Right Panel: Interview notes and controls */}
          <div className="lg:col-span-1 h-[calc(100vh-12rem)] flex flex-col">
            {/* Interview Notepad - Now in center */}
            <InterviewNotepad
              initialNotes={interviewNotes}
              onChange={setInterviewNotes}
              placeholder="Take notes during the interview...\n\nKey points:\n• \n• \n• "
              className="flex-1"
            />

            {/* Interview controls */}
            <Card className="mt-4 flex-shrink-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={geminiLive.isListening ? "destructive" : "default"}
                      size="sm"
                      onClick={togglePause}
                      disabled={!geminiLive.isConnected}
                    >
                      {isSessionPaused ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={endSession}
                  >
                    <PhoneOff className="w-4 h-4 mr-2" />
                    End Interview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// Connection status indicator component
interface ConnectionStatusProps {
  connectionState: string;
  isListening: boolean;
  isAISpeaking: boolean;
  audioLevel: number;
}

function ConnectionStatus({ connectionState, isListening, isAISpeaking, audioLevel }: ConnectionStatusProps) {
  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected': return 'bg-teal-500';
      case 'connecting': return 'bg-yellow-500';
      case 'reconnecting': return 'bg-orange-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    if (isAISpeaking) return 'AI Speaking';
    if (isListening) return 'Listening';
    return connectionState.charAt(0).toUpperCase() + connectionState.slice(1);
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={cn("w-3 h-3 rounded-full", getStatusColor(), {
        'animate-pulse': connectionState === 'connecting' || connectionState === 'reconnecting'
      })} />
      <span className="text-sm font-medium">{getStatusText()}</span>
      {isListening && audioLevel > 0 && (
        <div className="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-100"
            style={{ width: `${audioLevel * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}