import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "~/trpc/react";
import { useQuestionVideoUpload } from "./useQuestionVideoUpload";

interface Question {
  id: string;
  questionText: string;
  questionOrder: number;
}

interface RecorderState {
  isInitialized: boolean;
  isRecording: boolean;
  currentQuestionIndex: number;
  currentRecordingId: string | null;
  error: string | null;
  isTransitioning: boolean;
}

interface UseQuestionVideoRecorderProps {
  interviewId: string;
  questions: Question[];
  onError?: (error: string) => void;
  onRecordingStart?: (questionIndex: number) => void;
  onRecordingStop?: (questionIndex: number) => void;
  onTransitionComplete?: (nextQuestionIndex: number) => void;
}

export function useQuestionVideoRecorder({
  interviewId,
  questions,
  onError,
  onRecordingStart,
  onRecordingStop,
  onTransitionComplete,
}: UseQuestionVideoRecorderProps) {
  // State
  const [state, setState] = useState<RecorderState>({
    isInitialized: false,
    isRecording: false,
    currentQuestionIndex: 0,
    currentRecordingId: null,
    error: null,
    isTransitioning: false,
  });

  // Refs to maintain across renders
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number | null>(null);

  // Hooks
  const { uploadVideo, getProgress } = useQuestionVideoUpload();
  const createRecordingMutation = api.questionRecording.create.useMutation();
  const updateStatusMutation = api.questionRecording.updateStatus.useMutation();

  // Initialize recorder with screen capture
  const initialize = useCallback(async () => {
    try {
      console.log("[Recorder] Initializing screen capture...");

      // Request screen capture with audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
        } as MediaTrackConstraints,
        audio: true,
      });

      // Check if user has granted both video and audio
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      if (!videoTrack) {
        throw new Error("Screen capture video track not available");
      }

      if (!audioTrack) {
        console.warn("[Recorder] No audio track available - recording screen only");
      }

      // Handle stream end (user stops sharing)
      stream.getTracks().forEach(track => {
        track.onended = () => {
          console.error("[Recorder] Stream ended unexpectedly");
          const error = "Screen sharing stopped. Please restart the interview.";
          setState(prev => ({ ...prev, error }));
          onError?.(error);
          cleanup();
        };
      });

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps
      });

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recorder errors
      mediaRecorder.onerror = (event) => {
        console.error("[Recorder] MediaRecorder error:", event);
        const error = "Recording failed. Please restart the interview.";
        setState(prev => ({ ...prev, error }));
        onError?.(error);
      };

      mediaRecorderRef.current = mediaRecorder;
      streamRef.current = stream;

      setState(prev => ({
        ...prev,
        isInitialized: true,
        error: null,
      }));

      console.log("[Recorder] ✅ Initialized successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("[Recorder] Initialization failed:", errorMessage);

      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
      throw error;
    }
  }, [onError]);

  // Start recording for a specific question
  const startRecording = useCallback(async (questionIndex: number) => {
    if (!mediaRecorderRef.current || !state.isInitialized) {
      throw new Error("Recorder not initialized");
    }

    if (questionIndex < 0 || questionIndex >= questions.length) {
      throw new Error("Invalid question index");
    }

    try {
      const question = questions[questionIndex]!;

      console.log(`[Recorder] Starting recording for question ${questionIndex + 1}/${questions.length}`);

      // Create database entry for this question recording
      const recording = await createRecordingMutation.mutateAsync({
        interviewId,
        questionId: question.id,
        questionText: question.questionText,
        questionOrder: questionIndex,
        recordingStartedAt: new Date(),
      });

      // Reset chunks and start time
      chunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      // Start recording
      mediaRecorderRef.current.start(1000); // Collect data every second

      setState(prev => ({
        ...prev,
        isRecording: true,
        currentQuestionIndex: questionIndex,
        currentRecordingId: recording.id,
        error: null,
      }));

      onRecordingStart?.(questionIndex);

      console.log(`[Recorder] ✅ Recording started for question ${questionIndex + 1}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("[Recorder] Failed to start recording:", errorMessage);

      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
      throw error;
    }
  }, [
    state.isInitialized,
    questions,
    interviewId,
    createRecordingMutation,
    onRecordingStart,
    onError,
  ]);

  // Stop recording and upload
  const stopRecording = useCallback(async (): Promise<void> => {
    if (!mediaRecorderRef.current || !state.isRecording || !state.currentRecordingId) {
      return;
    }

    return new Promise((resolve, reject) => {
      const recorder = mediaRecorderRef.current!;
      const recordingId = state.currentRecordingId!;
      const questionIndex = state.currentQuestionIndex;

      console.log(`[Recorder] Stopping recording for question ${questionIndex + 1}`);

      recorder.onstop = async () => {
        try {
          // Calculate duration
          const duration = recordingStartTimeRef.current
            ? Math.floor((Date.now() - recordingStartTimeRef.current) / 1000)
            : 0;

          // Create blob from chunks
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType });

          console.log(`[Recorder] Recording stopped. Duration: ${duration}s, Size: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);

          // Update recording end time
          await updateStatusMutation.mutateAsync({
            id: recordingId,
            recordingEndedAt: new Date(),
          });

          // Upload video in background (non-blocking)
          uploadVideo({
            recordingId,
            blob,
            duration,
          }).catch((error) => {
            console.error("[Recorder] Background upload failed:", error);
            // Don't throw - upload happens in background
          });

          onRecordingStop?.(questionIndex);

          resolve();
        } catch (error) {
          console.error("[Recorder] Error during stop:", error);
          reject(error);
        }
      };

      // Stop the recorder
      recorder.stop();

      setState(prev => ({
        ...prev,
        isRecording: false,
      }));
    });
  }, [
    state.isRecording,
    state.currentRecordingId,
    state.currentQuestionIndex,
    updateStatusMutation,
    uploadVideo,
    onRecordingStop,
  ]);

  // Transition to next question (seamless)
  const transitionToNextQuestion = useCallback(async (nextQuestionIndex: number): Promise<void> => {
    if (nextQuestionIndex < 0 || nextQuestionIndex >= questions.length) {
      throw new Error("Invalid question index");
    }

    if (!state.isRecording) {
      throw new Error("No active recording to transition from");
    }

    setState(prev => ({ ...prev, isTransitioning: true }));

    try {
      console.log(`[Recorder] Transitioning from question ${state.currentQuestionIndex + 1} to ${nextQuestionIndex + 1}`);

      // Stop and upload current recording
      await stopRecording();

      // Small delay to ensure clean transition
      await new Promise(resolve => setTimeout(resolve, 100));

      // Start new recording
      await startRecording(nextQuestionIndex);

      setState(prev => ({ ...prev, isTransitioning: false }));

      onTransitionComplete?.(nextQuestionIndex);

      console.log(`[Recorder] ✅ Transition complete`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("[Recorder] Transition failed:", errorMessage);

      setState(prev => ({
        ...prev,
        isTransitioning: false,
        error: errorMessage,
      }));
      onError?.(errorMessage);
      throw error;
    }
  }, [
    state.isRecording,
    state.currentQuestionIndex,
    questions.length,
    stopRecording,
    startRecording,
    onTransitionComplete,
    onError,
  ]);

  // Cleanup
  const cleanup = useCallback(() => {
    console.log("[Recorder] Cleaning up...");

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    mediaRecorderRef.current = null;
    streamRef.current = null;
    chunksRef.current = [];
    recordingStartTimeRef.current = null;

    setState({
      isInitialized: false,
      isRecording: false,
      currentQuestionIndex: 0,
      currentRecordingId: null,
      error: null,
      isTransitioning: false,
    });

    console.log("[Recorder] ✅ Cleanup complete");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    // State
    isInitialized: state.isInitialized,
    isRecording: state.isRecording,
    currentQuestionIndex: state.currentQuestionIndex,
    currentRecordingId: state.currentRecordingId,
    error: state.error,
    isTransitioning: state.isTransitioning,

    // Methods
    initialize,
    startRecording,
    stopRecording,
    transitionToNextQuestion,
    cleanup,

    // Upload progress
    getUploadProgress: (recordingId: string) => getProgress(recordingId),
  };
}
