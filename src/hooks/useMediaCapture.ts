import { useState, useCallback, useRef, useEffect } from "react";
import { usePermissions, type PermissionError } from "./usePermissions";

export type RecordingState = "idle" | "requesting" | "recording" | "paused" | "stopped" | "error";

export type RecordingType = "screen" | "audio" | "screen_and_audio";

export interface RecordingQuality {
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
}

export interface RecordingOptions {
  type: RecordingType;
  quality?: RecordingQuality;
  timeslice?: number; // Chunk size in milliseconds
  maxDuration?: number; // Maximum recording duration in milliseconds
}

export interface RecordingChunk {
  data: Blob;
  timestamp: number;
  size: number;
}

export interface RecordingStats {
  duration: number; // Current recording duration in milliseconds
  size: number; // Current recording size in bytes
  chunks: number; // Number of chunks recorded
}

export interface MediaCaptureError {
  type: "permission_denied" | "not_supported" | "browser_error" | "recording_failed" | "stream_error";
  message: string;
}

export interface UseMediaCaptureReturn {
  // State
  state: RecordingState;
  isRecording: boolean;
  isPaused: boolean;
  stats: RecordingStats;
  error: MediaCaptureError | null;
  
  // Recording data
  recordedChunks: RecordingChunk[];
  recordedBlob: Blob | null;
  previewUrl: string | null;
  
  // Controls
  startRecording: (options: RecordingOptions) => Promise<boolean>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  clearRecording: () => void;
  
  // Utilities
  getSupportedMimeTypes: () => string[];
  getOptimalMimeType: () => string;
  downloadRecording: (filename?: string) => void;
  clearError: () => void;
}

/**
 * Hook for media capture using MediaRecorder API
 * Handles screen recording, audio recording, and combined recording
 */
export function useMediaCapture(): UseMediaCaptureReturn {
  const permissions = usePermissions();
  
  // Core state
  const [state, setState] = useState<RecordingState>("idle");
  const [error, setError] = useState<MediaCaptureError | null>(null);
  const [stats, setStats] = useState<RecordingStats>({
    duration: 0,
    size: 0,
    chunks: 0,
  });
  
  // Recording data
  const [recordedChunks, setRecordedChunks] = useState<RecordingChunk[]>([]);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Refs for MediaRecorder and streams
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamsRef = useRef<MediaStream[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const timesliceRef = useRef<number | undefined>(undefined);
  const maxDurationRef = useRef<number | undefined>(undefined);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Computed state
  const isRecording = state === "recording";
  const isPaused = state === "paused";

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createError = useCallback((
    type: MediaCaptureError["type"],
    message: string
  ): MediaCaptureError => ({
    type,
    message,
  }), []);

  /**
   * Get list of supported MIME types for recording
   */
  const getSupportedMimeTypes = useCallback((): string[] => {
    if (typeof MediaRecorder === "undefined") return [];

    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus", 
      "video/webm;codecs=h264,opus",
      "video/webm",
      "video/mp4;codecs=h264,aac",
      "video/mp4",
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/wav",
    ];

    return types.filter(type => MediaRecorder.isTypeSupported(type));
  }, []);

  /**
   * Get optimal MIME type based on browser support
   */
  const getOptimalMimeType = useCallback((): string => {
    const supportedTypes = getSupportedMimeTypes();
    
    // Preference order: VP9 > VP8 > H264 > fallback
    const preferredOrder = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=h264,opus", 
      "video/webm",
      "video/mp4;codecs=h264,aac",
      "video/mp4",
    ];

    for (const type of preferredOrder) {
      if (supportedTypes.includes(type)) {
        return type;
      }
    }

    // Fallback to first supported type or empty string
    return supportedTypes[0] || "";
  }, [getSupportedMimeTypes]);

  /**
   * Create media stream based on recording type
   */
  const createMediaStream = useCallback(async (type: RecordingType): Promise<MediaStream> => {
    const streams: MediaStream[] = [];

    try {
      if (type === "screen" || type === "screen_and_audio") {
        // Request screen capture
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: { ideal: 30, max: 60 },
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
          },
          audio: false, // We'll handle audio separately for better control
        });
        streams.push(screenStream);
      }

      if (type === "audio" || type === "screen_and_audio") {
        // Request audio capture
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
          },
          video: false,
        });
        streams.push(audioStream);
      }

      // Combine streams if we have multiple
      if (streams.length === 0) {
        throw new Error("No streams available for recording type: " + type);
      }

      if (streams.length === 1) {
        const stream = streams[0];
        if (!stream) {
          throw new Error("Invalid stream created");
        }
        return stream;
      }

      // Combine video and audio streams
      const combinedStream = new MediaStream();
      
      streams.forEach(stream => {
        stream.getTracks().forEach(track => {
          combinedStream.addTrack(track);
        });
      });

      streamsRef.current = streams;
      return combinedStream;

    } catch (err) {
      // Clean up any created streams
      streams.forEach(stream => {
        stream.getTracks().forEach(track => track.stop());
      });
      throw err;
    }
  }, []);

  /**
   * Clean up media streams
   */
  const cleanupStreams = useCallback(() => {
    streamsRef.current.forEach(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    streamsRef.current = [];
  }, []);

  /**
   * Update recording statistics
   */
  const updateStats = useCallback(() => {
    if (startTimeRef.current && (isRecording || isPaused)) {
      const duration = Date.now() - startTimeRef.current;
      const size = recordedChunks.reduce((total, chunk) => total + chunk.size, 0);
      
      setStats({
        duration,
        size,
        chunks: recordedChunks.length,
      });

      // Check max duration limit
      if (maxDurationRef.current && duration >= maxDurationRef.current) {
        stopRecording();
      }
    }
  }, [isRecording, isPaused, recordedChunks]);

  /**
   * Start recording with specified options
   */
  const startRecording = useCallback(async (options: RecordingOptions): Promise<boolean> => {
    if (state !== "idle") {
      setError(createError("recording_failed", "Recording is already in progress"));
      return false;
    }

    setState("requesting");
    setError(null);
    clearRecording();

    try {
      // Create media stream
      const stream = await createMediaStream(options.type);
      
      // Get optimal MIME type
      const mimeType = getOptimalMimeType();
      if (!mimeType) {
        throw new Error("No supported recording format found");
      }

      // Configure MediaRecorder options
      const recorderOptions: MediaRecorderOptions = {
        mimeType,
        ...(options.quality?.videoBitsPerSecond && { 
          videoBitsPerSecond: options.quality.videoBitsPerSecond 
        }),
        ...(options.quality?.audioBitsPerSecond && { 
          audioBitsPerSecond: options.quality.audioBitsPerSecond 
        }),
      };

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;
      
      // Store options
      timesliceRef.current = options.timeslice;
      maxDurationRef.current = options.maxDuration;

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          const chunk: RecordingChunk = {
            data: event.data,
            timestamp: Date.now(),
            size: event.data.size,
          };
          
          setRecordedChunks(prev => [...prev, chunk]);
        }
      };

      mediaRecorder.onstart = () => {
        startTimeRef.current = Date.now();
        setState("recording");
        
        // Start stats update interval
        statsIntervalRef.current = setInterval(updateStats, 1000);
      };

      mediaRecorder.onpause = () => {
        setState("paused");
      };

      mediaRecorder.onresume = () => {
        setState("recording");
      };

      mediaRecorder.onstop = () => {
        setState("stopped");
        
        // Clear stats interval
        if (statsIntervalRef.current) {
          clearInterval(statsIntervalRef.current);
          statsIntervalRef.current = null;
        }
        
        // Create final blob
        if (recordedChunks.length > 0) {
          const blob = new Blob(
            recordedChunks.map(chunk => chunk.data), 
            { type: mimeType }
          );
          setRecordedBlob(blob);
          
          // Create preview URL
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        }
        
        // Clean up streams
        cleanupStreams();
      };

      mediaRecorder.onerror = (event) => {
        const error = (event as any).error || new Error("Recording failed");
        setError(createError("recording_failed", `Recording error: ${error.message}`));
        setState("error");
        cleanupStreams();
      };

      // Handle stream ended events
      stream.getTracks().forEach(track => {
        track.onended = () => {
          if (mediaRecorderRef.current?.state === "recording") {
            stopRecording();
          }
        };
      });

      // Start recording
      if (options.timeslice) {
        mediaRecorder.start(options.timeslice);
      } else {
        mediaRecorder.start();
      }

      return true;

    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError(createError("permission_denied", "Permission denied for media capture"));
        } else if (err.name === "NotFoundError") {
          setError(createError("not_supported", "Required media devices not found"));
        } else if (err.name === "NotSupportedError") {
          setError(createError("not_supported", "Media recording not supported"));
        } else {
          setError(createError("recording_failed", err.message));
        }
      } else {
        setError(createError("recording_failed", "Unknown error occurred during recording setup"));
      }
      
      setState("error");
      cleanupStreams();
      return false;
    }
  }, [state, createError, createMediaStream, getOptimalMimeType, cleanupStreams, updateStats, recordedChunks]);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && 
        (mediaRecorderRef.current.state === "recording" || mediaRecorderRef.current.state === "paused")) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  /**
   * Pause recording
   */
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
    }
  }, []);

  /**
   * Resume recording
   */
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
    }
  }, []);

  /**
   * Clear recording data
   */
  const clearRecording = useCallback(() => {
    setRecordedChunks([]);
    setRecordedBlob(null);
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    setStats({
      duration: 0,
      size: 0,
      chunks: 0,
    });
    
    startTimeRef.current = null;
    
    if (state === "stopped" || state === "error") {
      setState("idle");
    }
  }, [previewUrl, state]);

  /**
   * Download recorded file
   */
  const downloadRecording = useCallback((filename?: string) => {
    if (!recordedBlob) return;

    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `recording-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [recordedBlob]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && 
          (mediaRecorderRef.current.state === "recording" || mediaRecorderRef.current.state === "paused")) {
        mediaRecorderRef.current.stop();
      }
      
      cleanupStreams();
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, [cleanupStreams, previewUrl]);

  // Update stats periodically
  useEffect(() => {
    if (isRecording || isPaused) {
      updateStats();
    }
  }, [recordedChunks, isRecording, isPaused, updateStats]);

  return {
    // State
    state,
    isRecording,
    isPaused,
    stats,
    error,
    
    // Recording data
    recordedChunks,
    recordedBlob,
    previewUrl,
    
    // Controls
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    
    // Utilities
    getSupportedMimeTypes,
    getOptimalMimeType,
    downloadRecording,
    clearError,
  };
}