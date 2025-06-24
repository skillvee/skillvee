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
  autoConnect?: boolean;
  onError?: (error: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onAudioReceived?: (data: { duration: number }) => void;
  onTextReceived?: (data: { text: string }) => void;
  onSessionRenewed?: (data: { sessionId: string }) => void;
}

export interface UseGeminiLiveState {
  isConnected: boolean;
  isListening: boolean;
  isAISpeaking: boolean;
  isSetupComplete: boolean;
  sessionId: string | null;
  error: string | null;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting';
  audioLevel: number;
  lastInteraction: Date | null;
}

export interface UseGeminiLiveActions {
  connect: (context: InterviewContext, apiKey: string) => Promise<void>;
  disconnect: () => Promise<void>;
  startListening: () => Promise<void>;
  stopListening: () => void;
  updateContext: (context: Partial<InterviewContext>) => void;
  sendInitialGreeting: () => void;
  clearError: () => void;
  reconnect: () => Promise<void>;
}

export interface UseGeminiLiveReturn extends UseGeminiLiveState, UseGeminiLiveActions {
  client: GeminiLiveClient | null;
}

/**
 * React hook for managing Gemini Live API interactions
 * Provides state management, lifecycle handling, and event management
 */
export function useGeminiLive(options: UseGeminiLiveOptions = {}): UseGeminiLiveReturn {
  const {
    config,
    autoConnect = false,
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
    isSetupComplete: false,
    sessionId: null,
    error: null,
    connectionState: 'disconnected',
    audioLevel: 0,
    lastInteraction: null,
  });

  // Refs for stable references
  const clientRef = useRef<GeminiLiveClient | null>(null);
  const contextRef = useRef<InterviewContext | null>(null);
  const apiKeyRef = useRef<string | null>(null);
  const audioLevelTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Setup event handlers
  const setupEventHandlers = useCallback(() => {
    if (!clientRef.current) return;

    const client = clientRef.current;

    // Connection events
    client.on('connected', ({ sessionId }) => {
      console.log('useGeminiLive: Connected event received, updating state to connected');
      setState(prev => {
        const newState = {
          ...prev,
          isConnected: true,
          sessionId,
          connectionState: 'connected' as const,
          isSetupComplete: true,
          error: null,
          lastInteraction: new Date(),
        };
        console.log('useGeminiLive: State updated, isConnected:', newState.isConnected);
        return newState;
      });
      reconnectAttemptsRef.current = 0;
      onConnected?.();
    });

    client.on('disconnected', ({ sessionId, code, reason }) => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        isListening: false,
        isAISpeaking: false,
        isSetupComplete: false,
        sessionId: null,
        connectionState: code === 1000 ? 'disconnected' : 'reconnecting',
        audioLevel: 0,
      }));
      onDisconnected?.();
    });

    client.on('setup-complete', () => {
      setState(prev => ({
        ...prev,
        isSetupComplete: true,
        lastInteraction: new Date(),
      }));
    });

    // Audio events
    client.on('listening-start', () => {
      setState(prev => ({
        ...prev,
        isListening: true,
        lastInteraction: new Date(),
      }));
      startAudioLevelMonitoring();
    });

    client.on('listening-stop', () => {
      setState(prev => ({
        ...prev,
        isListening: false,
        audioLevel: 0,
      }));
      stopAudioLevelMonitoring();
    });

    client.on('ai-speaking-start', () => {
      setState(prev => ({
        ...prev,
        isAISpeaking: true,
        lastInteraction: new Date(),
      }));
    });

    client.on('ai-speaking-stop', () => {
      setState(prev => ({
        ...prev,
        isAISpeaking: false,
      }));
    });

    client.on('audio-received', (data) => {
      setState(prev => ({
        ...prev,
        lastInteraction: new Date(),
      }));
      onAudioReceived?.(data);
    });

    client.on('text-received', (data) => {
      setState(prev => ({
        ...prev,
        lastInteraction: new Date(),
      }));
      onTextReceived?.(data);
    });

    // Session events
    client.on('session-renewed', ({ sessionId }) => {
      setState(prev => ({
        ...prev,
        sessionId,
        lastInteraction: new Date(),
      }));
      onSessionRenewed?.({ sessionId });
    });

    client.on('turn-complete', () => {
      setState(prev => ({
        ...prev,
        lastInteraction: new Date(),
      }));
    });

    client.on('interrupted', () => {
      setState(prev => ({
        ...prev,
        isAISpeaking: false,
        lastInteraction: new Date(),
      }));
    });

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

  // Audio level monitoring
  const startAudioLevelMonitoring = useCallback(() => {
    if (audioLevelTimerRef.current) return;

    audioLevelTimerRef.current = setInterval(() => {
      // Simulate audio level monitoring
      // In a real implementation, you'd capture actual audio levels
      const randomLevel = Math.random() * 0.3 + (Math.sin(Date.now() / 1000) * 0.2);
      setState(prev => ({
        ...prev,
        audioLevel: Math.max(0, Math.min(1, randomLevel)),
      }));
    }, 100);
  }, []);

  const stopAudioLevelMonitoring = useCallback(() => {
    if (audioLevelTimerRef.current) {
      clearInterval(audioLevelTimerRef.current);
      audioLevelTimerRef.current = null;
    }
    setState(prev => ({ ...prev, audioLevel: 0 }));
  }, []);

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
  }, [config]);

  const disconnect = useCallback(async () => {
    if (!clientRef.current) return;

    try {
      await clientRef.current.endSession();
      contextRef.current = null;
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!clientRef.current || !state.isConnected) {
      throw new Error('Not connected to Gemini Live');
    }

    try {
      await clientRef.current.startListening();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start listening';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [state.isConnected]);

  const stopListening = useCallback(() => {
    if (!clientRef.current) return;
    
    clientRef.current.stopListening();
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

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reconnect = useCallback(async () => {
    if (!contextRef.current || !apiKeyRef.current || reconnectAttemptsRef.current >= maxReconnectAttempts) {
      return;
    }

    try {
      reconnectAttemptsRef.current++;
      setState(prev => ({ ...prev, connectionState: 'reconnecting' }));
      
      // Wait a bit before reconnecting
      await new Promise(resolve => setTimeout(resolve, 1000 * reconnectAttemptsRef.current));
      
      await connect(contextRef.current, apiKeyRef.current);
      
      // Restore listening state if it was active
      if (state.isListening) {
        await startListening();
      }
      
    } catch (error) {
      console.error('Reconnection failed:', error);
      
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        setState(prev => ({
          ...prev,
          connectionState: 'error',
          error: 'Max reconnection attempts reached',
        }));
      }
    }
  }, [connect, startListening, state.isListening]);

  // Auto-connect effect (disabled - requires API key)
  // useEffect(() => {
  //   if (autoConnect && contextRef.current && apiKeyRef.current && !state.isConnected && state.connectionState === 'disconnected') {
  //     connect(contextRef.current, apiKeyRef.current).catch(console.error);
  //   }
  // }, [autoConnect, connect, state.isConnected, state.connectionState]);

  // Cleanup
  const cleanup = useCallback(() => {
    stopAudioLevelMonitoring();
    
    if (clientRef.current) {
      clientRef.current.endSession().catch(console.error);
      clientRef.current = null;
    }
    
    contextRef.current = null;
    apiKeyRef.current = null;
    reconnectAttemptsRef.current = 0;
  }, [stopAudioLevelMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // State
    ...state,
    
    // Actions
    connect,
    disconnect,
    startListening,
    stopListening,
    updateContext,
    sendInitialGreeting,
    clearError,
    reconnect,
    
    // Client reference (for advanced usage)
    client: clientRef.current,
  };
}

/**
 * Hook for managing multiple Gemini Live sessions
 * Useful for comparison interviews or multi-interviewer scenarios
 */
export function useMultipleGeminiLive(count: number = 2): UseGeminiLiveReturn[] {
  const sessions = Array.from({ length: count }, () => useGeminiLive());
  return sessions;
}

/**
 * Hook for Gemini Live with interview-specific optimizations
 */
export function useGeminiLiveInterview(options: UseGeminiLiveOptions = {}): UseGeminiLiveReturn {
  const interviewOptions: UseGeminiLiveOptions = {
    ...options,
    config: {
      model: 'models/gemini-2.0-flash-exp', // Correct model for Gemini Live API
      responseModalities: ['AUDIO'],
      voice: 'Puck', // Professional, clear voice
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
    checkPermissions();
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