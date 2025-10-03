"use client";

import { useState, useEffect } from 'react';
import { useGeminiLive } from '~/hooks/useGeminiLive';
import { ConversationExportService } from '~/server/services/conversation-export.service';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';
import { api } from '~/trpc/react';

export function FullTranscriptDemo() {
  const [transcripts, setTranscripts] = useState<Array<{
    speaker: 'user' | 'ai';
    text: string;
    timestamp: string;
  }>>([]);

  const [screenshots, setScreenshots] = useState<number>(0);
  const [sessionData, setSessionData] = useState<any>(null);

  const geminiLive = useGeminiLive({
    config: {
      model: 'models/gemini-2.5-flash-native-audio-preview-09-2025',  // Native audio model with transcription support
      responseModalities: ['AUDIO', 'TEXT'],  // Enable both for transcription
      voice: 'Puck',
      systemInstruction: `You are a professional AI interviewer conducting a technical interview.

Guidelines:
- Speak clearly and at a moderate pace
- Ask follow-up questions to clarify responses
- Be encouraging but maintain professional standards
- Keep responses concise (10-30 seconds)
- Focus on technical accuracy and problem-solving approach
- Provide constructive feedback when appropriate`,
      enableInputTranscription: true,   // Native audio model supports transcription
      enableOutputTranscription: true,  // Enable AI speech-to-text
      enableScreenCapture: true,
    },
    onTextReceived: (data) => {
      console.log('AI Text:', data.text);
    },
    onConnected: () => {
      console.log('✅ Connected to Gemini Live!');
    },
    onDisconnected: () => {
      console.log('❌ Disconnected from Gemini Live');
    },
    onError: (error) => {
      console.error('❌ Gemini Live Error:', error);
    }
  });

  // Get API key from server
  const startConversationMutation = api.ai.startConversation.useMutation();

  // Create demo interview and job description
  const createDemoJobDescriptionMutation = api.jobDescription.create.useMutation();
  const createInterviewMutation = api.interview.create.useMutation();

  // Listen for transcript events
  useEffect(() => {
    if (!geminiLive.client) return;

    const handleUserTranscript = (data: any) => {
      console.log('User transcript:', data);
      setTranscripts(prev => [...prev, {
        speaker: 'user',
        text: data.transcript,
        timestamp: data.timestamp
      }]);
    };

    const handleAITranscript = (data: any) => {
      console.log('AI transcript:', data);
      setTranscripts(prev => [...prev, {
        speaker: 'ai',
        text: data.transcript,
        timestamp: data.timestamp
      }]);
    };

    const handleScreenCapture = () => {
      setScreenshots(prev => prev + 1);
    };

    geminiLive.client.on('user-transcript', handleUserTranscript);
    geminiLive.client.on('ai-transcript', handleAITranscript);
    geminiLive.client.on('screen-capture', handleScreenCapture);

    return () => {
      geminiLive.client?.off?.('user-transcript', handleUserTranscript);
      geminiLive.client?.off?.('ai-transcript', handleAITranscript);
      geminiLive.client?.off?.('screen-capture', handleScreenCapture);
    };
  }, [geminiLive.client]);

  const handleStartSession = async () => {
    try {
      console.log('🚀 Starting demo session...');

      // Step 1: Create demo job description
      console.log('📝 Step 1: Creating job description...');
      const demoJobDescription = await createDemoJobDescriptionMutation.mutateAsync({
        title: "Senior Data Scientist",
        company: "TechCorp AI",
        description: "Join our AI team as a Senior Data Scientist to build cutting-edge machine learning models.",
        requirements: [
          "Masters/PhD in Computer Science or related field",
          "5+ years of experience in data science",
          "Expert in Python, SQL, and ML frameworks"
        ],
        focusAreas: ["Python Programming", "Machine Learning", "Deep Learning", "Statistics", "SQL"],
        isTemplate: false,
      });

      console.log('✅ Job description created:', demoJobDescription.id);

      // Step 2: Create interview
      console.log('📝 Step 2: Creating interview...');
      const interview = await createInterviewMutation.mutateAsync({
        jobDescriptionId: demoJobDescription.id,
        scheduledAt: new Date(),
      });
      console.log('✅ Interview created:', interview.id);

      // Step 3: Get API key from server (secure)
      console.log('🔑 Step 3: Getting API key from server...');
      const conversationResponse = await startConversationMutation.mutateAsync({
        interviewId: interview.id
      });
      console.log('✅ API key received');

      // Step 4: Setup context
      console.log('📋 Step 4: Setting up interview context...');
      const context = {
        interviewId: interview.id,
        jobTitle: 'Senior Data Scientist',
        companyName: 'TechCorp AI',
        focusAreas: ['Python', 'Machine Learning', 'SQL', 'Deep Learning'],
        difficulty: 'SENIOR' as const,
        questions: [
          {
            id: '1',
            questionText: 'Tell me about your experience with machine learning and data science',
            questionType: 'experience',
            difficulty: 'medium'
          }
        ],
        currentQuestionIndex: 0
      };

      // Step 5: Connect with API key from server
      console.log('🔌 Step 5: Connecting to Gemini Live...');
      await geminiLive.connect(context, conversationResponse.config.apiKey);
      console.log('✅ Connected! isConnected:', geminiLive.isConnected);

      // Step 6: Auto-start listening
      console.log('🎤 Step 6: Starting audio listening...');
      await geminiLive.startListening();
      console.log('✅ Listening started! isListening:', geminiLive.isListening);

      // Step 7: Start screen recording
      console.log('📹 Step 7: Starting screen recording...');
      try {
        await geminiLive.startScreenRecording();
        console.log('✅ Screen recording started!');
      } catch (error) {
        console.log('⚠️  Screen recording not started (user may have declined):', error);
      }

      console.log('✅ Session fully started!');

      // Step 8: Send initial greeting to trigger AI response (crucial!)
      console.log('🎬 Step 8: Sending initial greeting in 500ms...');
      setTimeout(() => {
        console.log('📤 Sending initial greeting NOW...');
        geminiLive.sendInitialGreeting();
        console.log('✅ Initial greeting sent - AI should respond now!');
      }, 500);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleEndSession = async () => {
    try {
      const conversation = geminiLive.exportConversation();
      setSessionData(conversation);
      await geminiLive.disconnect();

      if (conversation) {
        // Generate different export formats
        const jsonExport = ConversationExportService.exportAsJSON(conversation);
        const markdownExport = ConversationExportService.exportAsMarkdown(conversation);
        const analysisPrompt = ConversationExportService.createAnalysisPrompt(conversation);

        console.log('=== CONVERSATION JSON EXPORT ===');
        console.log(jsonExport);

        console.log('\n=== CONVERSATION MARKDOWN EXPORT ===');
        console.log(markdownExport);

        console.log('\n=== AI ANALYSIS PROMPT ===');
        console.log(analysisPrompt);
      }
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gemini Live Full Conversation Demo (Native Audio)</CardTitle>
          <CardDescription>
            Using Gemini 2.5 Flash Native Audio model for real-time conversation with bidirectional transcription + screen recording
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={geminiLive.isConnected ? 'default' : 'secondary'}>
              Connected: {geminiLive.isConnected ? 'Yes' : 'No'}
            </Badge>
            <Badge variant={geminiLive.isListening ? 'default' : 'secondary'}>
              Listening: {geminiLive.isListening ? 'Yes' : 'No'}
            </Badge>
            <Badge variant={geminiLive.isScreenRecording ? 'default' : 'secondary'}>
              Screen Recording: {geminiLive.isScreenRecording ? 'Yes' : 'No'}
            </Badge>
            <Badge variant={geminiLive.isAISpeaking ? 'default' : 'secondary'}>
              AI Speaking: {geminiLive.isAISpeaking ? 'Yes' : 'No'}
            </Badge>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleStartSession}
              disabled={
                geminiLive.isConnected ||
                createDemoJobDescriptionMutation.isPending ||
                createInterviewMutation.isPending ||
                startConversationMutation.isPending
              }
            >
              {(createDemoJobDescriptionMutation.isPending ||
                createInterviewMutation.isPending ||
                startConversationMutation.isPending)
                ? 'Setting up...'
                : 'Start Session & Connect'}
            </Button>
            <Button
              onClick={handleEndSession}
              disabled={!geminiLive.isConnected}
              variant="destructive"
            >
              End Session & Export
            </Button>
          </div>

          {geminiLive.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{geminiLive.error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Transcript</CardTitle>
          <CardDescription>
            Real-time transcription of both your speech and AI responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {transcripts.length === 0 ? (
              <p className="text-gray-500 text-sm">No transcripts yet. Start the session and begin speaking!</p>
            ) : (
              transcripts.map((transcript, index) => (
                <div key={index} className="flex gap-3">
                  <Badge variant={transcript.speaker === 'user' ? 'outline' : 'default'}>
                    {transcript.speaker === 'user' ? '🧑 You' : '🤖 AI'}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm">{transcript.text}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transcript.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Analytics</CardTitle>
          <CardDescription>
            Live statistics about your conversation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{transcripts.length}</p>
              <p className="text-sm text-gray-600">Total Exchanges</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{transcripts.filter(t => t.speaker === 'user').length}</p>
              <p className="text-sm text-gray-600">Your Turns</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{transcripts.filter(t => t.speaker === 'ai').length}</p>
              <p className="text-sm text-gray-600">AI Turns</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{screenshots}</p>
              <p className="text-sm text-gray-600">Screenshots</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {sessionData && (
        <Card>
          <CardHeader>
            <CardTitle>Exported Session Data</CardTitle>
            <CardDescription>
              Complete conversation data ready for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Session Info:</h4>
                <ul className="text-sm text-gray-600 mt-1">
                  <li>Session ID: {sessionData.sessionId}</li>
                  <li>Duration: {sessionData.duration} seconds</li>
                  <li>Model: {sessionData.model}</li>
                  <li>Total Turns: {sessionData.turns?.length || 0}</li>
                  <li>Screenshots: {sessionData.screenCaptures?.length || 0}</li>
                </ul>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium">✅ Available for AI Analysis:</p>
                <ul className="text-sm text-gray-600 mt-1 space-y-1">
                  <li>• Complete conversation transcript (both speakers)</li>
                  <li>• Timestamped screenshots of screen activity</li>
                  <li>• Session analytics and metrics</li>
                  <li>• Structured data for prompt engineering</li>
                  <li>• Export formats: JSON, Markdown, Analysis Prompt</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}