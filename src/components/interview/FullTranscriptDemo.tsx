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
    onTextReceived: (data) => {
      console.log('AI Text:', data.text);
    },
    onError: (error) => {
      console.error('Gemini Live Error:', error);
    }
  });

  // Get API key from server
  const startConversationMutation = api.ai.startConversation.useMutation();

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
      // Get API key from server (secure)
      const conversationResponse = await startConversationMutation.mutateAsync({
        interviewId: 'demo-' + Date.now()
      });

      const context = {
        interviewId: 'demo-' + Date.now(),
        jobTitle: 'Senior Data Scientist',
        companyName: 'Tech Company',
        focusAreas: ['Python', 'Machine Learning', 'SQL'],
        difficulty: 'SENIOR' as const,
        questions: [
          {
            id: '1',
            questionText: 'Tell me about your experience with machine learning',
            questionType: 'experience',
            difficulty: 'medium'
          }
        ],
        currentQuestionIndex: 0
      };

      // Connect with API key from server
      await geminiLive.connect(context, conversationResponse.config.apiKey);

      console.log('Session connected! Now starting listening and screen recording...');

      // Auto-start listening
      await geminiLive.startListening();

      // Start screen recording
      try {
        await geminiLive.startScreenRecording();
      } catch (error) {
        console.log('Screen recording not started (user may have declined):', error);
      }

      console.log('Session fully started with transcription and screen recording!');
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
          <CardTitle>Full Conversation Transcription Demo</CardTitle>
          <CardDescription>
            This demo shows the new Gemini Live capabilities: full bidirectional transcription + screen recording
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
              disabled={geminiLive.isConnected || startConversationMutation.isPending}
            >
              {startConversationMutation.isPending ? 'Starting...' : 'Start Session & Connect'}
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