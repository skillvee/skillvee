/**
 * Comprehensive error handling for Gemini Live API integration
 * Provides error classification, recovery strategies, and user-friendly messages
 */

import { useState, useCallback } from 'react';

export enum GeminiLiveErrorType {
  // Connection errors
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  WEBSOCKET_ERROR = 'WEBSOCKET_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Authentication errors
  API_KEY_INVALID = 'API_KEY_INVALID',
  API_KEY_EXPIRED = 'API_KEY_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // Audio errors
  MICROPHONE_ACCESS_DENIED = 'MICROPHONE_ACCESS_DENIED',
  AUDIO_DEVICE_ERROR = 'AUDIO_DEVICE_ERROR',
  AUDIO_PROCESSING_ERROR = 'AUDIO_PROCESSING_ERROR',
  AUDIO_FORMAT_ERROR = 'AUDIO_FORMAT_ERROR',
  
  // Session errors
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_INVALID = 'SESSION_INVALID',
  SESSION_LIMIT_REACHED = 'SESSION_LIMIT_REACHED',
  SESSION_RENEWAL_FAILED = 'SESSION_RENEWAL_FAILED',
  
  // API errors
  MODEL_UNAVAILABLE = 'MODEL_UNAVAILABLE',
  RATE_LIMITED = 'RATE_LIMITED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  INVALID_REQUEST = 'INVALID_REQUEST',
  
  // Browser compatibility
  BROWSER_NOT_SUPPORTED = 'BROWSER_NOT_SUPPORTED',
  WEBRTC_NOT_SUPPORTED = 'WEBRTC_NOT_SUPPORTED',
  
  // Unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface GeminiLiveError {
  type: GeminiLiveErrorType;
  message: string;
  userMessage: string;
  retryable: boolean;
  recoveryAction?: string;
  originalError?: Error;
  context?: Record<string, any>;
  timestamp: Date;
}

export class GeminiLiveErrorHandler {
  /**
   * Classify and handle errors from various sources
   */
  static handleError(error: any, context?: Record<string, any>): GeminiLiveError {
    const timestamp = new Date();
    
    // WebSocket errors
    if (error instanceof Event && error.type === 'error') {
      return {
        type: GeminiLiveErrorType.WEBSOCKET_ERROR,
        message: 'WebSocket connection error',
        userMessage: 'Connection to AI service failed. Please check your internet connection and try again.',
        retryable: true,
        recoveryAction: 'reconnect',
        originalError: error as any,
        context,
        timestamp,
      };
    }

    // Network/Connection errors
    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      return {
        type: GeminiLiveErrorType.NETWORK_ERROR,
        message: error.message || 'Network connection failed',
        userMessage: 'Network connection lost. Please check your internet connection.',
        retryable: true,
        recoveryAction: 'check_connection',
        originalError: error,
        context,
        timestamp,
      };
    }

    // Timeout errors
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return {
        type: GeminiLiveErrorType.TIMEOUT_ERROR,
        message: error.message || 'Request timed out',
        userMessage: 'The request took too long to complete. Please try again.',
        retryable: true,
        recoveryAction: 'retry',
        originalError: error,
        context,
        timestamp,
      };
    }

    // Authentication errors
    if (error.status === 401 || error.message?.includes('unauthorized')) {
      return {
        type: GeminiLiveErrorType.UNAUTHORIZED,
        message: 'Unauthorized access to Gemini Live API',
        userMessage: 'Authentication failed. Please refresh the page and try again.',
        retryable: false,
        recoveryAction: 'refresh_auth',
        originalError: error,
        context,
        timestamp,
      };
    }

    // API key errors
    if (error.status === 403 || error.message?.includes('API key')) {
      return {
        type: GeminiLiveErrorType.API_KEY_INVALID,
        message: 'Invalid API key for Gemini Live',
        userMessage: 'There\'s an issue with the AI service configuration. Please contact support.',
        retryable: false,
        recoveryAction: 'contact_support',
        originalError: error,
        context,
        timestamp,
      };
    }

    // Quota exceeded
    if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return {
        type: GeminiLiveErrorType.QUOTA_EXCEEDED,
        message: 'API quota exceeded',
        userMessage: 'The AI service is currently at capacity. Please wait a few minutes and try again.',
        retryable: true,
        recoveryAction: 'wait_and_retry',
        originalError: error,
        context,
        timestamp,
      };
    }

    // Microphone access
    if (error.name === 'NotAllowedError' || error.message?.includes('microphone')) {
      return {
        type: GeminiLiveErrorType.MICROPHONE_ACCESS_DENIED,
        message: 'Microphone access denied',
        userMessage: 'Microphone access is required for voice interaction. Please allow access and try again.',
        retryable: false,
        recoveryAction: 'grant_microphone_permission',
        originalError: error,
        context,
        timestamp,
      };
    }

    // Audio device errors
    if (error.name === 'NotFoundError' && error.message?.includes('audio')) {
      return {
        type: GeminiLiveErrorType.AUDIO_DEVICE_ERROR,
        message: 'Audio device not found',
        userMessage: 'No microphone found. Please connect a microphone and try again.',
        retryable: false,
        recoveryAction: 'check_audio_device',
        originalError: error,
        context,
        timestamp,
      };
    }

    // Session expired
    if (error.message?.includes('session') && error.message?.includes('expired')) {
      return {
        type: GeminiLiveErrorType.SESSION_EXPIRED,
        message: 'Gemini Live session expired',
        userMessage: 'Your session has expired. Starting a new session...',
        retryable: true,
        recoveryAction: 'renew_session',
        originalError: error,
        context,
        timestamp,
      };
    }

    // Model unavailable
    if (error.status === 503 || error.message?.includes('model unavailable')) {
      return {
        type: GeminiLiveErrorType.MODEL_UNAVAILABLE,
        message: 'Gemini Live model unavailable',
        userMessage: 'The AI model is temporarily unavailable. Please try again in a few minutes.',
        retryable: true,
        recoveryAction: 'retry_later',
        originalError: error,
        context,
        timestamp,
      };
    }

    // Browser compatibility
    if (!window.WebSocket) {
      return {
        type: GeminiLiveErrorType.BROWSER_NOT_SUPPORTED,
        message: 'WebSocket not supported',
        userMessage: 'Your browser doesn\'t support real-time features. Please use a modern browser like Chrome, Firefox, or Safari.',
        retryable: false,
        recoveryAction: 'upgrade_browser',
        originalError: error,
        context,
        timestamp,
      };
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        type: GeminiLiveErrorType.WEBRTC_NOT_SUPPORTED,
        message: 'WebRTC not supported',
        userMessage: 'Your browser doesn\'t support voice features. Please use a modern browser.',
        retryable: false,
        recoveryAction: 'upgrade_browser',
        originalError: error,
        context,
        timestamp,
      };
    }

    // Default unknown error
    return {
      type: GeminiLiveErrorType.UNKNOWN_ERROR,
      message: error.message || 'An unknown error occurred',
      userMessage: 'Something went wrong. Please try again or contact support if the problem persists.',
      retryable: true,
      recoveryAction: 'retry',
      originalError: error,
      context,
      timestamp,
    };
  }

  /**
   * Get recovery suggestions based on error type
   */
  static getRecoveryActions(errorType: GeminiLiveErrorType): string[] {
    switch (errorType) {
      case GeminiLiveErrorType.CONNECTION_FAILED:
      case GeminiLiveErrorType.WEBSOCKET_ERROR:
      case GeminiLiveErrorType.NETWORK_ERROR:
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Disable VPN if using one',
          'Try again in a few minutes',
        ];

      case GeminiLiveErrorType.MICROPHONE_ACCESS_DENIED:
        return [
          'Click the microphone icon in your browser\'s address bar',
          'Select "Allow" for microphone access',
          'Refresh the page and try again',
          'Check your browser\'s privacy settings',
        ];

      case GeminiLiveErrorType.AUDIO_DEVICE_ERROR:
        return [
          'Check that your microphone is connected',
          'Test your microphone in other applications',
          'Try unplugging and reconnecting your microphone',
          'Check your system\'s audio settings',
        ];

      case GeminiLiveErrorType.API_KEY_INVALID:
      case GeminiLiveErrorType.UNAUTHORIZED:
        return [
          'Refresh the page',
          'Sign out and sign back in',
          'Clear your browser cache',
          'Contact support if the problem persists',
        ];

      case GeminiLiveErrorType.QUOTA_EXCEEDED:
      case GeminiLiveErrorType.RATE_LIMITED:
        return [
          'Wait a few minutes before trying again',
          'Try again during off-peak hours',
          'Contact support for increased limits',
        ];

      case GeminiLiveErrorType.SESSION_EXPIRED:
      case GeminiLiveErrorType.SESSION_RENEWAL_FAILED:
        return [
          'The session will automatically restart',
          'Your progress has been saved',
          'You can continue from where you left off',
        ];

      case GeminiLiveErrorType.BROWSER_NOT_SUPPORTED:
      case GeminiLiveErrorType.WEBRTC_NOT_SUPPORTED:
        return [
          'Update your browser to the latest version',
          'Try using Chrome, Firefox, Safari, or Edge',
          'Enable JavaScript if disabled',
        ];

      default:
        return [
          'Try refreshing the page',
          'Check your internet connection',
          'Try again in a few minutes',
          'Contact support if the problem persists',
        ];
    }
  }

  /**
   * Get user-friendly error message with context
   */
  static getUserMessage(error: GeminiLiveError, includeActions = false): string {
    let message = error.userMessage;
    
    if (includeActions) {
      const actions = this.getRecoveryActions(error.type);
      if (actions.length > 0) {
        message += '\n\nWhat you can try:\n' + actions.map(action => `• ${action}`).join('\n');
      }
    }
    
    return message;
  }

  /**
   * Check if error should trigger automatic retry
   */
  static shouldAutoRetry(error: GeminiLiveError, attemptCount: number): boolean {
    if (!error.retryable || attemptCount >= 3) {
      return false;
    }

    const autoRetryTypes = [
      GeminiLiveErrorType.NETWORK_ERROR,
      GeminiLiveErrorType.TIMEOUT_ERROR,
      GeminiLiveErrorType.WEBSOCKET_ERROR,
      GeminiLiveErrorType.SESSION_EXPIRED,
    ];

    return autoRetryTypes.includes(error.type);
  }

  /**
   * Get retry delay in milliseconds (exponential backoff)
   */
  static getRetryDelay(attemptCount: number): number {
    return Math.min(1000 * Math.pow(2, attemptCount), 30000); // Max 30 seconds
  }

  /**
   * Log error for monitoring and debugging
   */
  static logError(error: GeminiLiveError): void {
    const logData = {
      type: error.type,
      message: error.message,
      retryable: error.retryable,
      context: error.context,
      timestamp: error.timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error('Gemini Live Error:', logData);

    // In production, you might want to send this to a monitoring service
    // Example: analytics.track('gemini_live_error', logData);
  }
}

/**
 * React hook for error handling with automatic recovery
 */
export function useGeminiLiveErrorHandler() {
  const [errors, setErrors] = useState<GeminiLiveError[]>([]);
  const [retryAttempts, setRetryAttempts] = useState<Map<string, number>>(new Map());

  const handleError = useCallback((error: any, context?: Record<string, any>) => {
    const processedError = GeminiLiveErrorHandler.handleError(error, context);
    
    setErrors(prev => [...prev, processedError]);
    GeminiLiveErrorHandler.logError(processedError);

    // Check for automatic retry
    const errorKey = `${processedError.type}_${processedError.message}`;
    const currentAttempts = retryAttempts.get(errorKey) || 0;

    if (GeminiLiveErrorHandler.shouldAutoRetry(processedError, currentAttempts)) {
      const delay = GeminiLiveErrorHandler.getRetryDelay(currentAttempts);
      
      setTimeout(() => {
        setRetryAttempts(prev => new Map(prev).set(errorKey, currentAttempts + 1));
        // Trigger retry logic here if needed
      }, delay);
    }

    return processedError;
  }, [retryAttempts]);

  const clearError = useCallback((errorIndex: number) => {
    setErrors(prev => prev.filter((_, index) => index !== errorIndex));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
    setRetryAttempts(new Map());
  }, []);

  const getLatestError = useCallback(() => {
    return errors.length > 0 ? errors[errors.length - 1] : null;
  }, [errors]);

  return {
    errors,
    handleError,
    clearError,
    clearAllErrors,
    getLatestError,
    hasErrors: errors.length > 0,
  };
}