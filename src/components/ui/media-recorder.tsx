"use client";

import React, { useState, useCallback, useEffect } from "react";
import { 
  Play, 
  Square, 
  Pause, 
  Circle, 
  Monitor, 
  Mic, 
  MicOff, 
  Download,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  HardDrive,
} from "lucide-react";

import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { cn } from "~/lib/utils";

import { useMediaCapture, type RecordingOptions, type RecordingType } from "~/hooks/useMediaCapture";
import { usePermissions } from "~/hooks/usePermissions";
import { validateRecordingSupport, getBrowserCapabilities } from "~/lib/media-compatibility";

interface MediaRecorderProps {
  onRecordingComplete?: (blob: Blob, stats: { duration: number; size: number }) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  defaultRecordingType?: RecordingType;
  showPreview?: boolean;
  maxDuration?: number; // in seconds
  className?: string;
}

function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function MediaRecorder({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  defaultRecordingType = "screen_and_audio",
  showPreview = true,
  maxDuration = 3600, // 1 hour default
  className,
}: MediaRecorderProps) {
  const [recordingType, setRecordingType] = useState<RecordingType>(defaultRecordingType);
  const [showSettings, setShowSettings] = useState(false);
  
  const permissions = usePermissions();
  const mediaCapture = useMediaCapture();

  // Recording support validation
  const supportValidation = validateRecordingSupport();
  const browserCapabilities = getBrowserCapabilities();

  // Handle recording completion
  useEffect(() => {
    if (mediaCapture.state === "stopped" && mediaCapture.recordedBlob) {
      onRecordingComplete?.(mediaCapture.recordedBlob, {
        duration: mediaCapture.stats.duration,
        size: mediaCapture.stats.size,
      });
    }
  }, [mediaCapture.state, mediaCapture.recordedBlob, mediaCapture.stats, onRecordingComplete]);

  // Handle recording state changes
  useEffect(() => {
    if (mediaCapture.isRecording) {
      onRecordingStart?.();
    } else if (mediaCapture.state === "stopped") {
      onRecordingStop?.();
    }
  }, [mediaCapture.isRecording, mediaCapture.state, onRecordingStart, onRecordingStop]);

  const handleStartRecording = useCallback(async () => {
    // Request permissions first
    const requiredPermissions = recordingType === "screen" 
      ? ["screen"]
      : recordingType === "audio" 
      ? ["microphone"]
      : ["screen", "microphone"];

    for (const permission of requiredPermissions) {
      if (permission === "screen") {
        const granted = await permissions.requestScreenPermission();
        if (!granted) return;
      } else if (permission === "microphone") {
        const granted = await permissions.requestMicrophonePermission();
        if (!granted) return;
      }
    }

    // Start recording
    const options: RecordingOptions = {
      type: recordingType,
      maxDuration: maxDuration * 1000, // Convert to milliseconds
      timeslice: 1000, // 1 second chunks
    };

    await mediaCapture.startRecording(options);
  }, [recordingType, maxDuration, permissions, mediaCapture]);

  const getRecordingTypeIcon = (type: RecordingType) => {
    switch (type) {
      case "screen":
        return <Monitor className="h-4 w-4" />;
      case "audio":
        return <Mic className="h-4 w-4" />;
      case "screen_and_audio":
        return (
          <div className="flex items-center space-x-1">
            <Monitor className="h-3 w-3" />
            <Mic className="h-3 w-3" />
          </div>
        );
    }
  };

  const getRecordingTypeLabel = (type: RecordingType) => {
    switch (type) {
      case "screen":
        return "Screen Only";
      case "audio":
        return "Audio Only";
      case "screen_and_audio":
        return "Screen + Audio";
    }
  };

  const isRecordingDisabled = 
    !supportValidation.isSupported || 
    permissions.isLoading || 
    mediaCapture.state === "requesting";

  if (!supportValidation.isSupported) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Recording Not Supported</span>
          </CardTitle>
          <CardDescription>
            Your browser or environment doesn&apos;t support the required features for recording.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm font-medium">Missing features:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {supportValidation.missingFeatures.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Circle 
              className={cn(
                "h-3 w-3",
                mediaCapture.isRecording ? "fill-red-500 text-red-500 animate-pulse" : 
                mediaCapture.isPaused ? "fill-yellow-500 text-yellow-500" :
                "fill-gray-300 text-gray-300"
              )} 
            />
            <span>Interview Recording</span>
          </div>
          <div className="flex items-center space-x-2">
            {mediaCapture.state === "stopped" && mediaCapture.recordedBlob && (
              <Badge variant="outline" className="text-teal-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Recording Complete
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        
        {showSettings && (
          <div className="pt-4 border-t">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Recording Type</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(["screen", "audio", "screen_and_audio"] as RecordingType[]).map((type) => (
                    <Button
                      key={type}
                      variant={recordingType === type ? "default" : "outline"}
                      size="sm"
                      className="justify-start"
                      onClick={() => setRecordingType(type)}
                      disabled={mediaCapture.isRecording}
                    >
                      {getRecordingTypeIcon(type)}
                      <span className="ml-2 text-xs">{getRecordingTypeLabel(type)}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>Browser: {browserCapabilities.isChromium ? "Chrome" : 
                           browserCapabilities.isFirefox ? "Firefox" : 
                           browserCapabilities.isSafari ? "Safari" : 
                           browserCapabilities.isEdge ? "Edge" : "Unknown"}</p>
                <p>Supported formats: {browserCapabilities.supportedVideoMimeTypes.length} video, {browserCapabilities.supportedAudioMimeTypes.length} audio</p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Display */}
        {(mediaCapture.error || permissions.error) && (
          <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">
              {mediaCapture.error?.message || permissions.error?.message}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                mediaCapture.clearError();
                permissions.clearError();
              }}
            >
              ×
            </Button>
          </div>
        )}

        {/* Recording Stats */}
        {(mediaCapture.isRecording || mediaCapture.isPaused || mediaCapture.state === "stopped") && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{formatDuration(mediaCapture.stats.duration)}</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{formatFileSize(mediaCapture.stats.size)}</p>
                <p className="text-xs text-muted-foreground">Size</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Circle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{mediaCapture.stats.chunks}</p>
                <p className="text-xs text-muted-foreground">Chunks</p>
              </div>
            </div>
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex items-center justify-center space-x-3">
          {!mediaCapture.isRecording && !mediaCapture.isPaused ? (
            <Button
              onClick={handleStartRecording}
              disabled={isRecordingDisabled}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Recording
            </Button>
          ) : (
            <>
              {mediaCapture.isRecording ? (
                <Button
                  onClick={mediaCapture.pauseRecording}
                  variant="outline"
                  size="lg"
                >
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button
                  onClick={mediaCapture.resumeRecording}
                  size="lg"
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Resume
                </Button>
              )}
              
              <Button
                onClick={mediaCapture.stopRecording}
                variant="destructive"
                size="lg"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            </>
          )}
        </div>

        {/* Preview and Download */}
        {showPreview && mediaCapture.state === "stopped" && mediaCapture.previewUrl && (
          <div className="space-y-3">
            <div className="border rounded-lg overflow-hidden">
              {recordingType === "audio" ? (
                <audio 
                  controls 
                  src={mediaCapture.previewUrl}
                  className="w-full h-12"
                />
              ) : (
                <video 
                  controls 
                  src={mediaCapture.previewUrl}
                  className="w-full max-h-64"
                />
              )}
            </div>
            
            <div className="flex justify-center space-x-3">
              <Button
                onClick={() => mediaCapture.downloadRecording(`interview-recording-${Date.now()}`)}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Recording
              </Button>
              
              <Button
                onClick={mediaCapture.clearRecording}
                variant="ghost"
                size="sm"
              >
                Clear Recording
              </Button>
            </div>
          </div>
        )}

        {/* Warnings */}
        {supportValidation.warnings.length > 0 && (
          <div className="space-y-2">
            {supportValidation.warnings.map((warning, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-800">{warning}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}