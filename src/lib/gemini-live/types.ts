/**
 * Type definitions for Gemini Live API integration
 * All interfaces, types, and enums used across the module
 */

export interface GeminiLiveConfig {
  apiKey: string;
  model: 'models/gemini-2.0-flash-exp' | 'models/gemini-2.5-flash-preview-native-audio-dialog' | 'models/gemini-2.5-flash-native-audio-preview-09-2025';
  responseModalities: ('AUDIO' | 'TEXT')[];
  systemInstruction?: string;
  voice?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede';
  enableInputTranscription?: boolean;
  enableOutputTranscription?: boolean;
  enableScreenCapture?: boolean;
}

export interface InterviewContext {
  interviewId: string;
  jobTitle: string;
  companyName?: string;
  focusAreas: string[];
  difficulty: 'JUNIOR' | 'MEDIUM' | 'SENIOR';
  questions: Question[];
  currentQuestionIndex: number;
}

export interface Question {
  id: string;
  questionText: string;
  questionType: string;
  difficulty: string;
  expectedAnswer?: string;
  evaluationCriteria?: string[];
  timeAllocation?: number;
  followUpQuestions?: string[];
}

export type GeminiLiveEventType =
  | 'connected'
  | 'disconnected'
  | 'audio-received'
  | 'text-received'
  | 'user-transcript'
  | 'ai-transcript'
  | 'screen-capture'
  | 'turn-complete'
  | 'interrupted'
  | 'error'
  | 'listening-start'
  | 'listening-stop'
  | 'ai-speaking-start'
  | 'ai-speaking-stop';

export type GeminiLiveEventHandler<T = any> = (data: T) => void;

export interface ConversationTurn {
  id: string;
  timestamp: string;
  role: 'user' | 'assistant';
  content: {
    audio?: {
      data: string; // base64
      mimeType: string;
      duration?: number;
    };
    text?: string;
    transcript?: string;
  };
  metadata?: {
    turnComplete?: boolean;
    interrupted?: boolean;
  };
}

export interface ScreenCapture {
  id: string;
  timestamp: string;
  data: string; // base64 image
  mimeType: string;
  width: number;
  height: number;
}

export interface ConversationSession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  model: string;
  turns: ConversationTurn[];
  screenCaptures: ScreenCapture[];
  analytics: {
    totalTurns: number;
    userTurns: number;
    assistantTurns: number;
    userSpeakingTime: number;
    aiSpeakingTime: number;
    averageResponseTime: number;
    interruptionCount: number;
  };
}
