import { useState, useCallback } from "react";

export type PermissionState = "prompt" | "granted" | "denied";

export interface PermissionStatus {
  camera: PermissionState;
  microphone: PermissionState;
  screen: PermissionState;
}

export interface PermissionError {
  type: "permission_denied" | "not_supported" | "browser_error";
  message: string;
  permission?: keyof PermissionStatus;
}

export interface UsePermissionsReturn {
  permissions: PermissionStatus;
  isLoading: boolean;
  error: PermissionError | null;
  requestCameraPermission: () => Promise<boolean>;
  requestMicrophonePermission: () => Promise<boolean>;
  requestScreenPermission: () => Promise<boolean>;
  requestAllPermissions: () => Promise<Partial<PermissionStatus>>;
  checkPermissions: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing media permissions (camera, microphone, screen capture)
 * Provides unified permission management with proper error handling
 */
export function usePermissions(): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: "prompt",
    microphone: "prompt",
    screen: "prompt",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PermissionError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updatePermission = useCallback((permission: keyof PermissionStatus, state: PermissionState) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: state,
    }));
  }, []);

  const createPermissionError = useCallback((
    type: PermissionError["type"],
    message: string,
    permission?: keyof PermissionStatus
  ): PermissionError => ({
    type,
    message,
    permission,
  }), []);

  /**
   * Check current permission states using the Permissions API where available
   */
  const checkPermissions = useCallback(async () => {
    if (!navigator.permissions) {
      // Permissions API not supported, permissions will be checked on request
      return;
    }

    try {
      const [cameraResult, microphoneResult] = await Promise.allSettled([
        navigator.permissions.query({ name: "camera" as PermissionName }),
        navigator.permissions.query({ name: "microphone" as PermissionName }),
      ]);

      if (cameraResult.status === "fulfilled") {
        updatePermission("camera", cameraResult.value.state as PermissionState);
      }

      if (microphoneResult.status === "fulfilled") {
        updatePermission("microphone", microphoneResult.value.state as PermissionState);
      }

      // Screen capture permissions can't be checked ahead of time
      // They require user gesture and are always "prompt"
    } catch (err) {
      console.warn("Error checking permissions:", err);
    }
  }, [updatePermission]);

  /**
   * Request camera permission
   */
  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(createPermissionError(
        "not_supported",
        "Camera access is not supported in this browser",
        "camera"
      ));
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false,
      });
      
      // Stop the stream immediately, we just wanted to check permission
      stream.getTracks().forEach(track => track.stop());
      
      updatePermission("camera", "granted");
      return true;
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          updatePermission("camera", "denied");
          setError(createPermissionError(
            "permission_denied",
            "Camera access was denied. Please allow camera access and try again.",
            "camera"
          ));
        } else if (err.name === "NotFoundError") {
          setError(createPermissionError(
            "not_supported",
            "No camera device found on this device.",
            "camera"
          ));
        } else {
          setError(createPermissionError(
            "browser_error",
            `Camera access failed: ${err.message}`,
            "camera"
          ));
        }
      } else {
        setError(createPermissionError(
          "browser_error",
          "An unknown error occurred while requesting camera access.",
          "camera"
        ));
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [createPermissionError, updatePermission]);

  /**
   * Request microphone permission
   */
  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(createPermissionError(
        "not_supported",
        "Microphone access is not supported in this browser",
        "microphone"
      ));
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false,
      });
      
      // Stop the stream immediately, we just wanted to check permission
      stream.getTracks().forEach(track => track.stop());
      
      updatePermission("microphone", "granted");
      return true;
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          updatePermission("microphone", "denied");
          setError(createPermissionError(
            "permission_denied",
            "Microphone access was denied. Please allow microphone access and try again.",
            "microphone"
          ));
        } else if (err.name === "NotFoundError") {
          setError(createPermissionError(
            "not_supported",
            "No microphone device found on this device.",
            "microphone"
          ));
        } else {
          setError(createPermissionError(
            "browser_error",
            `Microphone access failed: ${err.message}`,
            "microphone"
          ));
        }
      } else {
        setError(createPermissionError(
          "browser_error",
          "An unknown error occurred while requesting microphone access.",
          "microphone"
        ));
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [createPermissionError, updatePermission]);

  /**
   * Request screen capture permission
   */
  const requestScreenPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError(createPermissionError(
        "not_supported",
        "Screen capture is not supported in this browser",
        "screen"
      ));
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      
      // Stop the stream immediately, we just wanted to check permission
      stream.getTracks().forEach(track => track.stop());
      
      updatePermission("screen", "granted");
      return true;
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          updatePermission("screen", "denied");
          setError(createPermissionError(
            "permission_denied",
            "Screen capture was denied. Please allow screen capture and try again.",
            "screen"
          ));
        } else if (err.name === "NotSupportedError") {
          setError(createPermissionError(
            "not_supported",
            "Screen capture is not supported on this device.",
            "screen"
          ));
        } else {
          setError(createPermissionError(
            "browser_error",
            `Screen capture failed: ${err.message}`,
            "screen"
          ));
        }
      } else {
        setError(createPermissionError(
          "browser_error",
          "An unknown error occurred while requesting screen capture access.",
          "screen"
        ));
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [createPermissionError, updatePermission]);

  /**
   * Request all permissions that are needed for recording
   */
  const requestAllPermissions = useCallback(async (): Promise<Partial<PermissionStatus>> => {
    setIsLoading(true);
    setError(null);

    const results: Partial<PermissionStatus> = {};

    try {
      // Request permissions in parallel
      const [micGranted, screenGranted] = await Promise.all([
        requestMicrophonePermission(),
        requestScreenPermission(),
      ]);

      if (micGranted) results.microphone = "granted";
      if (screenGranted) results.screen = "granted";

      return results;
    } catch (err) {
      console.error("Error requesting permissions:", err);
      return results;
    } finally {
      setIsLoading(false);
    }
  }, [requestMicrophonePermission, requestScreenPermission]);

  return {
    permissions,
    isLoading,
    error,
    requestCameraPermission,
    requestMicrophonePermission,
    requestScreenPermission,
    requestAllPermissions,
    checkPermissions,
    clearError,
  };
}