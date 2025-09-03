"use client";

import React, { useState, useCallback, useEffect } from "react";
import { 
  Play, 
  Square, 
  Pause, 
  Circle, 
  Monitor, 
  Mic, 
  Upload,
  Download,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  HardDrive,
  Wifi,
  WifiOff,
  X,
  RotateCcw,
} from "lucide-react";

import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { cn } from "~/lib/utils";

import { useMediaCapture, type RecordingOptions, type RecordingType } from "~/hooks/useMediaCapture";
import { usePermissions } from "~/hooks/usePermissions";
import { useMediaUpload } from "~/hooks/useMediaUpload";
import { validateRecordingSupport, getBrowserCapabilities } from "~/lib/media-compatibility";

import type { RecordingType as PrismaRecordingType } from "@prisma/client";

interface InterviewRecorderProps {
  interviewId: string;
  onRecordingComplete?: (recordingId: string) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  defaultRecordingType?: RecordingType;
  maxDuration?: number; // in seconds
  autoUpload?: boolean;
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

function mapRecordingTypeToPrisma(type: RecordingType): PrismaRecordingType {
  switch (type) {
    case "screen":
      return "SCREEN";
    case "audio":
      return "AUDIO";
    case "screen_and_audio":
      return "SCREEN_AND_AUDIO";
  }
}

export function InterviewRecorder({
  interviewId,
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  defaultRecordingType = "screen_and_audio",
  maxDuration = 3600, // 1 hour default
  autoUpload = true,
  className,
}: InterviewRecorderProps) {
  const [recordingType, setRecordingType] = useState<RecordingType>(defaultRecordingType);
  const [showSettings, setShowSettings] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  
  const permissions = usePermissions();
  const mediaCapture = useMediaCapture();
  
  const mediaUpload = useMediaUpload({
    interviewId,
    onUploadComplete: (recordingId) => {
      setHasUploaded(true);
      onRecordingComplete?.(recordingId);
    },
    onUploadError: (error) => {
      console.error("Upload failed:", error);
    },
  });

  // Recording support validation
  const supportValidation = validateRecordingSupport();
  const browserCapabilities = getBrowserCapabilities();

  // Auto-upload on recording completion
  useEffect(() => {
    if (autoUpload && 
        mediaCapture.state === "stopped" && 
        mediaCapture.recordedBlob && 
        !hasUploaded &&
        mediaUpload.uploadState.status === "idle") {
      
      const fileName = `interview-${interviewId}-${Date.now()}`;
      void mediaUpload.uploadRecording(
        mediaCapture.recordedBlob, 
        mapRecordingTypeToPrisma(recordingType),
        fileName
      );
    }
  }, [
    autoUpload,
    mediaCapture.state,
    mediaCapture.recordedBlob,
    hasUploaded,
    mediaUpload,
    interviewId,
    recordingType,
  ]);

  // Handle recording state changes
  useEffect(() => {
    if (mediaCapture.isRecording) {
      onRecordingStart?.();
    } else if (mediaCapture.state === "stopped") {
      onRecordingStop?.();
    }
  }, [mediaCapture.isRecording, mediaCapture.state, onRecordingStart, onRecordingStop]);

  // Reset upload state when starting new recording
  useEffect(() => {
    if (mediaCapture.state === "recording") {
      setHasUploaded(false);
      mediaUpload.clearUpload();
    }
  }, [mediaCapture.state, mediaUpload]);

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

  const handleManualUpload = useCallback(() => {
    if (mediaCapture.recordedBlob && mediaUpload.uploadState.status === "idle") {
      const fileName = `interview-${interviewId}-${Date.now()}`;
      void mediaUpload.uploadRecording(
        mediaCapture.recordedBlob, 
        mapRecordingTypeToPrisma(recordingType),
        fileName
      );
    }
  }, [mediaCapture.recordedBlob, mediaUpload, interviewId, recordingType]);

  const handleResetRecording = useCallback(() => {
    mediaCapture.clearRecording();
    mediaUpload.clearUpload();
    setHasUploaded(false);
  }, [mediaCapture, mediaUpload]);

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

  const getOverallStatus = () => {
    if (mediaCapture.isRecording) return "recording";
    if (mediaCapture.isPaused) return "paused";
    if (mediaUpload.uploadState.status === "uploading") return "uploading";
    if (mediaUpload.uploadState.status === "completed") return "completed";
    if (mediaCapture.state === "stopped" && mediaCapture.recordedBlob) return "recorded";
    return "idle";
  };

  const overallStatus = getOverallStatus();

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
                overallStatus === "recording" ? "fill-red-500 text-red-500 animate-pulse" : 
                overallStatus === "paused" ? "fill-yellow-500 text-yellow-500" :
                overallStatus === "uploading" ? "fill-blue-500 text-blue-500 animate-pulse" :
                overallStatus === "completed" ? "fill-teal-500 text-teal-500" :
                "fill-gray-300 text-gray-300"
              )} 
            />
            <span>Interview Recording</span>
          </div>
          <div className="flex items-center space-x-2">
            {overallStatus === "completed" && (
              <Badge variant="outline" className="text-teal-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Upload Complete
              </Badge>
            )}
            {overallStatus === "uploading" && (
              <Badge variant="outline" className="text-blue-600">
                <Upload className="h-3 w-3 mr-1" />
                Uploading ({mediaUpload.uploadState.progress.percentage}%)
              </Badge>
            )}
            {overallStatus === "recorded" && !autoUpload && (
              <Badge variant="outline" className="text-orange-600">
                <WifiOff className="h-3 w-3 mr-1" />
                Ready to Upload
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

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto-upload</label>
                <Badge variant={autoUpload ? "default" : "secondary"}>
                  {autoUpload ? (
                    <>
                      <Wifi className="h-3 w-3 mr-1" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3 mr-1" />
                      Disabled
                    </>
                  )}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>Browser: {browserCapabilities.isChromium ? "Chrome" : 
                           browserCapabilities.isFirefox ? "Firefox" : 
                           browserCapabilities.isSafari ? "Safari" : 
                           browserCapabilities.isEdge ? "Edge" : "Unknown"}</p>
                <p>Max duration: {Math.floor(maxDuration / 60)} minutes</p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Display */}
        {(mediaCapture.error || permissions.error || mediaUpload.uploadState.error) && (
          <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive flex-1">
              {mediaCapture.error?.message || permissions.error?.message || mediaUpload.uploadState.error}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                mediaCapture.clearError();
                permissions.clearError();
                mediaUpload.clearUpload();
              }}
            >
              <X className="h-3 w-3" />
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

        {/* Upload Progress */}
        {mediaUpload.uploadState.status === "uploading" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{mediaUpload.uploadState.progress.percentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${mediaUpload.uploadState.progress.percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatFileSize(mediaUpload.uploadState.progress.loaded)} / {formatFileSize(mediaUpload.uploadState.progress.total)}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={mediaUpload.cancelUpload}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex items-center justify-center space-x-3">
          {overallStatus === "idle" || overallStatus === "completed" ? (
            <Button
              onClick={handleStartRecording}
              disabled={isRecordingDisabled}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Recording
            </Button>
          ) : overallStatus === "recording" ? (
            <>
              <Button
                onClick={mediaCapture.pauseRecording}
                variant="outline"
                size="lg"
              >
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
              
              <Button
                onClick={mediaCapture.stopRecording}
                variant="destructive"
                size="lg"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            </>
          ) : overallStatus === "paused" ? (
            <>
              <Button
                onClick={mediaCapture.resumeRecording}
                size="lg"
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Play className="h-5 w-5 mr-2" />
                Resume
              </Button>
              
              <Button
                onClick={mediaCapture.stopRecording}
                variant="destructive"
                size="lg"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            </>
          ) : overallStatus === "recorded" ? (
            <div className="flex space-x-3">
              {!autoUpload && (
                <Button
                  onClick={handleManualUpload}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={mediaUpload.uploadState.status === "uploading"}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Recording
                </Button>
              )}
              
              <Button
                onClick={handleResetRecording}
                variant="outline"
                size="lg"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                New Recording
              </Button>
            </div>
          ) : null}
        </div>

        {/* Preview */}
        {mediaCapture.state === "stopped" && mediaCapture.previewUrl && (
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
            
            <div className="flex justify-center">
              <Button
                onClick={() => mediaCapture.downloadRecording(`interview-${interviewId}-${Date.now()}`)}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Recording
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