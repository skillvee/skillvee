"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Volume2, 
  VolumeX, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  Pause,
  Play,
  SkipForward,
  Settings
} from "lucide-react";
import { cn } from "~/lib/utils";
import { useGeminiLiveInterview, useGeminiLivePermissions } from "~/hooks/useGeminiLive";
import type { InterviewContext } from "~/lib/gemini-live";
import { api } from "~/trpc/react";

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
  onQuestionComplete?: (questionId: string, answer: string) => void;
  onInterviewComplete?: () => void;
  onError?: (error: string) => void;
}

export function LiveInterviewSession({ 
  interview, 
  questions, 
  onQuestionComplete,
  onInterviewComplete,
  onError 
}: LiveInterviewSessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSessionPaused, setIsSessionPaused] = useState(false);
  const [conversationLog, setConversationLog] = useState<Array<{
    id: string;
    timestamp: Date;
    type: 'user' | 'ai' | 'system';
    content: string;
  }>>([]);
  // Gemini Live integration
  const geminiLive = useGeminiLiveInterview({
    onError: (error) => {
      console.error('Gemini Live error:', error);
      onError?.(error);
    },
    onTextReceived: ({ text }) => {
      addToConversationLog('ai', text);
    },
    onConnected: () => {
      addToConversationLog('system', 'AI interviewer connected and ready');
    },
    onDisconnected: () => {
      addToConversationLog('system', 'AI interviewer disconnected');
    },
    onSessionRenewed: ({ sessionId }) => {
      addToConversationLog('system', `Session renewed (${sessionId})`);
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

  // Add entry to conversation log
  const addToConversationLog = useCallback((type: 'user' | 'ai' | 'system', content: string) => {
    setConversationLog(prev => [...prev, {
      id: `${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      type,
      content,
    }]);
  }, []);

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
        currentQuestionIndex,
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
      addToConversationLog('system', 'Interview session started');
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
    currentQuestionIndex,
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
      addToConversationLog('system', 'Interview session ended');
      onInterviewComplete?.();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }, [geminiLive, onInterviewComplete]);

  // Pause/Resume session
  const togglePause = useCallback(() => {
    if (isSessionPaused) {
      geminiLive.startListening().catch(console.error);
      addToConversationLog('system', 'Interview resumed');
    } else {
      geminiLive.stopListening();
      addToConversationLog('system', 'Interview paused');
    }
    setIsSessionPaused(!isSessionPaused);
  }, [isSessionPaused, geminiLive]);

  // Move to next question
  const moveToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      
      // Update Gemini Live context
      geminiLive.updateContext({ 
        currentQuestionIndex: newIndex 
      });

      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion) {
        onQuestionComplete?.(currentQuestion.id, 'Question completed via voice interaction');
      }

      addToConversationLog('system', `Moving to question ${newIndex + 1} of ${questions.length}`);
    } else {
      // Interview complete
      endSession();
    }
  }, [currentQuestionIndex, questions, geminiLive, onQuestionComplete, endSession]);

  // Move to previous question
  const moveToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      
      // Update Gemini Live context
      geminiLive.updateContext({ 
        currentQuestionIndex: newIndex 
      });

      addToConversationLog('system', `Moving back to question ${newIndex + 1} of ${questions.length}`);
    }
  }, [currentQuestionIndex, geminiLive]);

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

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Header with session status */}
      <Card>
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
        
        {/* Progress bar */}
        {sessionStarted && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Error handling */}
      {geminiLive.error && (
        <Alert variant="destructive">
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
        <Alert>
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
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Ready to start your AI interview?</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                You'll be speaking with an AI interviewer who will ask questions about {interview.jobDescription.focusAreas.join(', ')}. 
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main interview area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current question */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Question {currentQuestionIndex + 1}</span>
                  <Badge variant="outline">
                    {currentQuestion?.difficulty || interview.jobDescription.difficulty}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg leading-relaxed">
                  {currentQuestion?.questionText}
                </p>
                
                {currentQuestion?.evaluationCriteria && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Evaluation Focus:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {currentQuestion.evaluationCriteria.map((criteria, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{criteria}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interview controls */}
            <Card>
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
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={moveToPreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      Previous
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={moveToNextQuestion}
                    >
                      {currentQuestionIndex === questions.length - 1 ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete Interview
                        </>
                      ) : (
                        <>
                          <SkipForward className="w-4 h-4 mr-2" />
                          Next Question
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

          {/* Sidebar with live indicators and conversation log */}
          <div className="space-y-4">
            {/* Live conversation indicator */}
            <LiveConversationIndicator 
              isAISpeaking={geminiLive.isAISpeaking}
              isListening={geminiLive.isListening}
              audioLevel={geminiLive.audioLevel}
              isPaused={isSessionPaused}
            />

            {/* Conversation log */}
            <ConversationLog 
              messages={conversationLog}
              maxHeight="400px"
            />
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
      case 'connected': return 'bg-green-500';
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

// Live conversation indicator component
interface LiveConversationIndicatorProps {
  isAISpeaking: boolean;
  isListening: boolean;
  audioLevel: number;
  isPaused: boolean;
}

function LiveConversationIndicator({ isAISpeaking, isListening, audioLevel, isPaused }: LiveConversationIndicatorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center">
          <MessageSquare className="w-4 h-4 mr-2" />
          Live Conversation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI speaking indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Volume2 className={cn("w-4 h-4", {
              'text-blue-500': isAISpeaking,
              'text-gray-400': !isAISpeaking
            })} />
            <span className="text-sm">AI Interviewer</span>
          </div>
          {isAISpeaking && (
            <div className="flex space-x-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-4 bg-blue-500 rounded animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* User listening indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isListening && !isPaused ? (
              <Mic className="w-4 h-4 text-green-500" />
            ) : (
              <MicOff className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-sm">You</span>
          </div>
          {isListening && !isPaused && (
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-100"
                style={{ width: `${audioLevel * 100}%` }}
              />
            </div>
          )}
        </div>

        {isPaused && (
          <div className="text-center py-2">
            <Badge variant="secondary">
              <Pause className="w-3 h-3 mr-1" />
              Session Paused
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Conversation log component
interface ConversationLogProps {
  messages: Array<{
    id: string;
    timestamp: Date;
    type: 'user' | 'ai' | 'system';
    content: string;
  }>;
  maxHeight?: string;
}

function ConversationLog({ messages, maxHeight = "300px" }: ConversationLogProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Conversation Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="space-y-2 overflow-y-auto pr-2"
          style={{ maxHeight }}
        >
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No conversation yet...
            </p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={
                      message.type === 'ai' ? 'default' : 
                      message.type === 'user' ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {message.type === 'ai' ? 'AI' : 
                     message.type === 'user' ? 'You' : 'System'}
                  </Badge>
                  <span className="text-muted-foreground">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm leading-relaxed pl-2 border-l-2 border-gray-200">
                  {message.content}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}