import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GeminiLiveClient, 
  createGeminiLiveClient, 
  type InterviewContext, 
  type GeminiLiveConfig,
  type GeminiLiveEventType 
} from '~/lib/gemini-live';

export interface UseGeminiLiveOptions {
  config?: Partial<GeminiLiveConfig>;
  onError?: (error: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onAudioReceived?: (data: { data: ArrayBuffer }) => void;
  onTextReceived?: (data: { text: string }) => void;
  onSessionRenewed?: (data: { sessionId: string }) => void;
}

export interface UseGeminiLiveState {
  isConnected: boolean;
  isListening: boolean;
  isAISpeaking: boolean;
  isScreenRecording: boolean;
  error: string | null;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
  audioLevel: number;
}

export interface UseGeminiLiveActions {
  connect: (context: InterviewContext, apiKey: string) => Promise<void>;
  disconnect: () => Promise<void>;
  startListening: () => Promise<void>;
  stopListening: () => void;
  startScreenRecording: () => Promise<void>;
  stopScreenRecording: () => void;
  updateContext: (context: Partial<InterviewContext>) => void;
  sendInitialGreeting: () => void;
  clearError: () => void;
  reconnect: () => Promise<void>;
  exportConversation: () => any;
}

export interface UseGeminiLiveReturn extends UseGeminiLiveState, UseGeminiLiveActions {
  client: GeminiLiveClient | null;
}

/**
 * React hook for managing Gemini Live API interactions
 * Simplified version using continuous audio streaming
 */
export function useGeminiLive(options: UseGeminiLiveOptions = {}): UseGeminiLiveReturn {
  const {
    config,
    onError,
    onConnected,
    onDisconnected,
    onAudioReceived,
    onTextReceived,
    onSessionRenewed,
  } = options;

  // State management
  const [state, setState] = useState<UseGeminiLiveState>({
    isConnected: false,
    isListening: false,
    isAISpeaking: false,
    isScreenRecording: false,
    error: null,
    connectionState: 'disconnected',
    audioLevel: 0,
  });

  // Refs for stable references
  const clientRef = useRef<GeminiLiveClient | null>(null);
  const contextRef = useRef<InterviewContext | null>(null);
  const apiKeyRef = useRef<string | null>(null);

  // Setup event handlers
  const setupEventHandlers = useCallback(() => {
    if (!clientRef.current) return;

    const client = clientRef.current;

    // Connection events
    client.on('connected', () => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        connectionState: 'connected',
        error: null,
      }));
      onConnected?.();
    });

    client.on('disconnected', ({ code, reason }) => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        isListening: false,
        isAISpeaking: false,
        connectionState: code === 1000 ? 'disconnected' : 'error',
      }));
      onDisconnected?.();
    });

    // Audio events
    client.on('listening-start', () => {
      setState(prev => ({
        ...prev,
        isListening: true,
      }));
    });

    client.on('listening-stop', () => {
      setState(prev => ({
        ...prev,
        isListening: false,
      }));
    });

    client.on('ai-speaking-start', () => {
      setState(prev => ({
        ...prev,
        isAISpeaking: true,
      }));
    });

    client.on('ai-speaking-stop', () => {
      setState(prev => ({
        ...prev,
        isAISpeaking: false,
      }));
    });

    client.on('audio-received', (data) => {
      onAudioReceived?.(data);
    });

    client.on('text-received', (data) => {
      onTextReceived?.(data);
    });

    // Session events (for compatibility)
    if (onSessionRenewed) {
      // Note: new implementation doesn't have session renewal, but we provide a stub for compatibility
      setTimeout(() => onSessionRenewed({ sessionId: 'session-' + Date.now() }), 1000);
    }

    // Error handling
    client.on('error', ({ error }) => {
      setState(prev => ({
        ...prev,
        error,
        connectionState: 'error',
      }));
      onError?.(error);
    });

  }, [onError, onConnected, onDisconnected, onAudioReceived, onTextReceived, onSessionRenewed]);

  // Actions
  const connect = useCallback(async (context: InterviewContext, apiKey: string) => {
    try {
      setState(prev => ({
        ...prev,
        connectionState: 'connecting',
        error: null,
      }));

      // Create client with API key
      if (clientRef.current) {
        await clientRef.current.endSession();
      }
      
      clientRef.current = createGeminiLiveClient({ 
        ...config, 
        apiKey 
      });
      
      setupEventHandlers();
      
      contextRef.current = context;
      apiKeyRef.current = apiKey;
      
      await clientRef.current.startSession(context);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        connectionState: 'error',
      }));
      throw error;
    }
  }, [config, setupEventHandlers]);

  const disconnect = useCallback(async () => {
    if (!clientRef.current) return;

    try {
      await clientRef.current.endSession();
      contextRef.current = null;
      apiKeyRef.current = null;
      clientRef.current = null;
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!clientRef.current) {
      throw new Error('Gemini Live client not initialized');
    }

    if (!clientRef.current.isConnected) {
      throw new Error('Not connected to Gemini Live');
    }

    try {
      await clientRef.current.startListening();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start listening';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!clientRef.current) return;

    clientRef.current.stopListening();
  }, []);

  const startScreenRecording = useCallback(async () => {
    if (!clientRef.current) {
      throw new Error('Gemini Live client not initialized');
    }

    try {
      await clientRef.current.startScreenRecording();
      setState(prev => ({ ...prev, isScreenRecording: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start screen recording';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  const stopScreenRecording = useCallback(() => {
    if (!clientRef.current) return;

    clientRef.current.stopScreenRecording();
    setState(prev => ({ ...prev, isScreenRecording: false }));
  }, []);

  const updateContext = useCallback((contextUpdate: Partial<InterviewContext>) => {
    if (!clientRef.current) return;

    if (contextRef.current) {
      contextRef.current = { ...contextRef.current, ...contextUpdate };
    }
    
    clientRef.current.updateContext(contextUpdate);
  }, []);

  const sendInitialGreeting = useCallback(() => {
    if (!clientRef.current) return;
    clientRef.current.sendInitialGreeting();
  }, []);

  const sendText = useCallback((text: string, endOfTurn = true) => {
    if (!clientRef.current) {
      console.warn('Cannot send text: client not initialized');
      return;
    }
    clientRef.current.sendText(text, endOfTurn);
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reconnect = useCallback(async () => {
    if (!contextRef.current || !apiKeyRef.current) {
      throw new Error('No context or API key available for reconnection');
    }

    try {
      await connect(contextRef.current, apiKeyRef.current);
    } catch (error) {
      console.error('Reconnection failed:', error);
      throw error;
    }
  }, [connect]);

  const exportConversation = useCallback(() => {
    if (!clientRef.current) return null;
    return clientRef.current.exportConversation();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.endSession().catch(console.error);
        clientRef.current = null;
      }
    };
  }, []);

  return {
    // State
    ...state,

    // Actions
    connect,
    disconnect,
    startListening,
    stopListening,
    startScreenRecording,
    stopScreenRecording,
    updateContext,
    sendInitialGreeting,
    sendText,
    clearError,
    reconnect,
    exportConversation,

    // Client reference (for advanced usage)
    client: clientRef.current,
  };
}

/**
 * Hook for Gemini Live with interview-specific optimizations
 */
export function useGeminiLiveInterview(options: UseGeminiLiveOptions = {}): UseGeminiLiveReturn {
  const interviewOptions: UseGeminiLiveOptions = {
    ...options,
    config: {
      model: 'models/gemini-2.0-flash-exp',
      responseModalities: ['AUDIO'],
      voice: 'Puck',
      systemInstruction: options.config?.systemInstruction || `You are a professional AI interviewer. 
      
      Guidelines:
      - Speak clearly and at a moderate pace
      - Ask follow-up questions to clarify responses
      - Be encouraging but maintain professional standards
      - Keep responses concise (10-30 seconds)
      - Focus on technical accuracy and problem-solving approach
      - Provide constructive feedback when appropriate`,
      ...options.config,
    },
  };

  return useGeminiLive(interviewOptions);
}

/**
 * Custom hook for handling Gemini Live permissions
 */
export function useGeminiLivePermissions() {
  const [permissions, setPermissions] = useState({
    microphone: 'prompt' as PermissionState,
    camera: 'prompt' as PermissionState,
  });

  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);

  const checkPermissions = useCallback(async () => {
    if (!navigator.permissions) {
      return;
    }

    setIsCheckingPermissions(true);

    try {
      const [micPermission, cameraPermission] = await Promise.all([
        navigator.permissions.query({ name: 'microphone' as PermissionName }),
        navigator.permissions.query({ name: 'camera' as PermissionName }),
      ]);

      setPermissions({
        microphone: micPermission.state,
        camera: cameraPermission.state,
      });

      // Listen for permission changes
      micPermission.onchange = () => {
        setPermissions(prev => ({ ...prev, microphone: micPermission.state }));
      };

      cameraPermission.onchange = () => {
        setPermissions(prev => ({ ...prev, camera: cameraPermission.state }));
      };

    } catch (error) {
      console.error('Failed to check permissions:', error);
    } finally {
      setIsCheckingPermissions(false);
    }
  }, []);

  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    void checkPermissions();
  }, [checkPermissions]);

  return {
    permissions,
    isCheckingPermissions,
    checkPermissions,
    requestMicrophonePermission,
    hasMicrophoneAccess: permissions.microphone === 'granted',
    hasCameraAccess: permissions.camera === 'granted',
  };
}