/**
 * Browser compatibility utilities for media recording
 * Handles cross-browser MIME type detection and Safari compatibility
 */

export interface BrowserCapabilities {
  hasMediaRecorder: boolean;
  hasGetDisplayMedia: boolean;
  hasGetUserMedia: boolean;
  supportedVideoMimeTypes: string[];
  supportedAudioMimeTypes: string[];
  isChromium: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isEdge: boolean;
}

export interface MediaFormatPreference {
  video: {
    preferred: string;
    fallbacks: string[];
  };
  audio: {
    preferred: string;
    fallbacks: string[];
  };
}

/**
 * Detect browser type from user agent
 */
export function detectBrowser(): { 
  isChromium: boolean; 
  isFirefox: boolean; 
  isSafari: boolean; 
  isEdge: boolean; 
} {
  const userAgent = navigator.userAgent.toLowerCase();
  
  return {
    isChromium: userAgent.includes("chrome") && !userAgent.includes("edg"),
    isFirefox: userAgent.includes("firefox"),
    isSafari: userAgent.includes("safari") && !userAgent.includes("chrome"),
    isEdge: userAgent.includes("edg"),
  };
}

/**
 * Check if MediaRecorder API is available
 */
export function hasMediaRecorderSupport(): boolean {
  return typeof MediaRecorder !== "undefined" && typeof MediaRecorder.isTypeSupported === "function";
}

/**
 * Check if getDisplayMedia API is available
 */
export function hasGetDisplayMediaSupport(): boolean {
  return typeof navigator.mediaDevices?.getDisplayMedia === "function";
}

/**
 * Check if getUserMedia API is available
 */
export function hasGetUserMediaSupport(): boolean {
  return typeof navigator.mediaDevices?.getUserMedia === "function";
}

/**
 * Get all supported video MIME types for recording
 */
export function getSupportedVideoMimeTypes(): string[] {
  if (!hasMediaRecorderSupport()) return [];

  const videoTypes = [
    // WebM with VP9 (best quality, good compression)
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp9",
    
    // WebM with VP8 (good compatibility)
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp8",
    
    // WebM with H.264 (wide compatibility)
    "video/webm;codecs=h264,opus",
    "video/webm;codecs=h264",
    "video/webm;codecs=avc1,opus",
    "video/webm;codecs=avc1",
    
    // Generic WebM
    "video/webm",
    
    // MP4 formats (Safari preference)
    "video/mp4;codecs=h264,aac",
    "video/mp4;codecs=avc1,mp4a",
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
    
    // Alternative formats
    "video/x-matroska;codecs=avc1",
  ];

  return videoTypes.filter(type => MediaRecorder.isTypeSupported(type));
}

/**
 * Get all supported audio MIME types for recording
 */
export function getSupportedAudioMimeTypes(): string[] {
  if (!hasMediaRecorderSupport()) return [];

  const audioTypes = [
    // WebM audio formats
    "audio/webm;codecs=opus",
    "audio/webm",
    
    // MP4 audio formats (Safari preference)
    "audio/mp4;codecs=aac",
    "audio/mp4;codecs=mp4a.40.2",
    "audio/mp4",
    
    // WAV (broad compatibility)
    "audio/wav",
    "audio/wave",
    
    // Other formats
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];

  return audioTypes.filter(type => MediaRecorder.isTypeSupported(type));
}

/**
 * Get browser capabilities
 */
export function getBrowserCapabilities(): BrowserCapabilities {
  const browser = detectBrowser();
  
  return {
    hasMediaRecorder: hasMediaRecorderSupport(),
    hasGetDisplayMedia: hasGetDisplayMediaSupport(),
    hasGetUserMedia: hasGetUserMediaSupport(),
    supportedVideoMimeTypes: getSupportedVideoMimeTypes(),
    supportedAudioMimeTypes: getSupportedAudioMimeTypes(),
    ...browser,
  };
}

/**
 * Get browser-specific format preferences
 */
export function getMediaFormatPreferences(): MediaFormatPreference {
  const capabilities = getBrowserCapabilities();
  
  if (capabilities.isSafari) {
    // Safari prefers MP4 formats
    return {
      video: {
        preferred: "video/mp4;codecs=h264,aac",
        fallbacks: [
          "video/mp4",
          "video/webm;codecs=h264,opus",
          "video/webm",
        ],
      },
      audio: {
        preferred: "audio/mp4;codecs=aac",
        fallbacks: [
          "audio/mp4",
          "audio/wav",
          "audio/webm;codecs=opus",
        ],
      },
    };
  }
  
  if (capabilities.isFirefox) {
    // Firefox has strong WebM support
    return {
      video: {
        preferred: "video/webm;codecs=vp9,opus",
        fallbacks: [
          "video/webm;codecs=vp8,opus",
          "video/webm",
          "video/mp4;codecs=h264,aac",
        ],
      },
      audio: {
        preferred: "audio/webm;codecs=opus",
        fallbacks: [
          "audio/webm",
          "audio/ogg;codecs=opus",
          "audio/wav",
        ],
      },
    };
  }
  
  // Chrome/Chromium and Edge default
  return {
    video: {
      preferred: "video/webm;codecs=vp9,opus",
      fallbacks: [
        "video/webm;codecs=vp8,opus",
        "video/webm;codecs=h264,opus",
        "video/webm",
        "video/mp4;codecs=h264,aac",
      ],
    },
    audio: {
      preferred: "audio/webm;codecs=opus",
      fallbacks: [
        "audio/webm",
        "audio/mp4;codecs=aac",
        "audio/wav",
      ],
    },
  };
}

/**
 * Get the best supported MIME type for recording
 */
export function getBestSupportedMimeType(recordingType: "video" | "audio" = "video"): string | null {
  const preferences = getMediaFormatPreferences();
  const targetPrefs = recordingType === "video" ? preferences.video : preferences.audio;
  
  // Try preferred format first
  if (MediaRecorder.isTypeSupported(targetPrefs.preferred)) {
    return targetPrefs.preferred;
  }
  
  // Try fallbacks
  for (const fallback of targetPrefs.fallbacks) {
    if (MediaRecorder.isTypeSupported(fallback)) {
      return fallback;
    }
  }
  
  return null;
}

/**
 * Get recording constraints optimized for the current browser
 */
export function getBrowserOptimizedConstraints(recordingType: "screen" | "audio" | "screen_and_audio") {
  const capabilities = getBrowserCapabilities();
  
  const baseVideoConstraints = {
    frameRate: { ideal: 30, max: 60 },
    width: { ideal: 1920, max: 1920 },
    height: { ideal: 1080, max: 1080 },
  };
  
  const baseAudioConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100,
  };
  
  if (capabilities.isSafari) {
    // Safari optimizations
    return {
      video: recordingType !== "audio" ? {
        ...baseVideoConstraints,
        frameRate: { ideal: 24, max: 30 }, // Lower framerate for better stability
      } : false,
      audio: recordingType !== "screen" ? {
        ...baseAudioConstraints,
        sampleRate: 48000, // Safari prefers 48kHz
      } : false,
    };
  }
  
  if (capabilities.isFirefox) {
    // Firefox optimizations
    return {
      video: recordingType !== "audio" ? {
        ...baseVideoConstraints,
        mediaSource: "screen", // Explicit for Firefox
      } : false,
      audio: recordingType !== "screen" ? baseAudioConstraints : false,
    };
  }
  
  // Chrome/Edge default
  return {
    video: recordingType !== "audio" ? baseVideoConstraints : false,
    audio: recordingType !== "screen" ? baseAudioConstraints : false,
  };
}

/**
 * Get recommended MediaRecorder options for the current browser
 */
export function getBrowserOptimizedRecorderOptions(recordingType: "video" | "audio" = "video"): MediaRecorderOptions {
  const capabilities = getBrowserCapabilities();
  const mimeType = getBestSupportedMimeType(recordingType);
  
  const baseOptions: MediaRecorderOptions = {
    ...(mimeType && { mimeType }),
  };
  
  if (capabilities.isSafari) {
    // Safari optimizations - lower bitrates for stability
    return {
      ...baseOptions,
      videoBitsPerSecond: recordingType === "video" ? 2000000 : undefined, // 2 Mbps
      audioBitsPerSecond: 128000, // 128 kbps
    };
  }
  
  if (capabilities.isFirefox) {
    // Firefox optimizations
    return {
      ...baseOptions,
      videoBitsPerSecond: recordingType === "video" ? 3000000 : undefined, // 3 Mbps
      audioBitsPerSecond: 192000, // 192 kbps
    };
  }
  
  // Chrome/Edge - higher quality
  return {
    ...baseOptions,
    videoBitsPerSecond: recordingType === "video" ? 4000000 : undefined, // 4 Mbps
    audioBitsPerSecond: 256000, // 256 kbps
  };
}

/**
 * Check if the current browser/environment supports the required features
 */
export function validateRecordingSupport(): {
  isSupported: boolean;
  missingFeatures: string[];
  warnings: string[];
} {
  const missingFeatures: string[] = [];
  const warnings: string[] = [];
  
  if (!hasMediaRecorderSupport()) {
    missingFeatures.push("MediaRecorder API");
  }
  
  if (!hasGetDisplayMediaSupport()) {
    missingFeatures.push("Screen capture (getDisplayMedia)");
  }
  
  if (!hasGetUserMediaSupport()) {
    missingFeatures.push("Audio capture (getUserMedia)");
  }
  
  const capabilities = getBrowserCapabilities();
  
  if (capabilities.isSafari && capabilities.supportedVideoMimeTypes.length === 0) {
    warnings.push("Safari may have limited video recording support");
  }
  
  if (!window.isSecureContext) {
    missingFeatures.push("Secure context (HTTPS or localhost required)");
  }
  
  return {
    isSupported: missingFeatures.length === 0,
    missingFeatures,
    warnings,
  };
}