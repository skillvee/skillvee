"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { 
  Settings, 
  Volume2, 
  Mic, 
  Brain, 
  Zap, 
  MessageSquare,
  Save,
  RotateCcw,
  Info
} from "lucide-react";
import { cn } from "~/lib/utils";
import type { GeminiLiveConfig } from "~/lib/gemini-live";

export interface GeminiLiveSettingsProps {
  config: Partial<GeminiLiveConfig>;
  onConfigChange: (config: Partial<GeminiLiveConfig>) => void;
  onSave?: () => void;
  onReset?: () => void;
  isSessionActive?: boolean;
  className?: string;
}

export function GeminiLiveSettings({
  config,
  onConfigChange,
  onSave,
  onReset,
  isSessionActive = false,
  className
}: GeminiLiveSettingsProps) {
  const [customSystemInstruction, setCustomSystemInstruction] = useState(
    config.systemInstruction || ''
  );

  // Voice options with descriptions
  const voiceOptions = [
    { 
      value: 'Puck', 
      label: 'Puck', 
      description: 'Professional, clear voice ideal for interviews',
      recommended: true 
    },
    { 
      value: 'Charon', 
      label: 'Charon', 
      description: 'Deep, authoritative voice' 
    },
    { 
      value: 'Kore', 
      label: 'Kore', 
      description: 'Warm, conversational voice' 
    },
    { 
      value: 'Fenrir', 
      label: 'Fenrir', 
      description: 'Dynamic, energetic voice' 
    },
    { 
      value: 'Aoede', 
      label: 'Aoede', 
      description: 'Melodic, expressive voice' 
    },
  ];

  // Model options with descriptions
  const modelOptions = [
    {
      value: 'gemini-2.0-flash-live-001',
      label: 'Gemini 2.0 Flash Live',
      description: 'Reliable, production-ready model with consistent performance',
      recommended: true,
      features: ['Stable', 'Fast', 'Production Ready']
    },
    {
      value: 'gemini-2.5-flash-preview-native-audio-dialog',
      label: 'Gemini 2.5 Flash Native Audio',
      description: 'Advanced model with most natural speech patterns',
      features: ['Natural Speech', 'Emotion Aware', 'Preview']
    }
  ];

  const handleConfigUpdate = (updates: Partial<GeminiLiveConfig>) => {
    const newConfig = { ...config, ...updates };
    onConfigChange(newConfig);
  };

  const handleSystemInstructionChange = (value: string) => {
    setCustomSystemInstruction(value);
    handleConfigUpdate({ systemInstruction: value });
  };

  const resetToDefaults = () => {
    const defaultConfig: Partial<GeminiLiveConfig> = {
      model: 'models/gemini-2.0-flash-exp',
      responseModalities: ['AUDIO'],
      voice: 'Puck',
      systemInstruction: `You are a professional AI interviewer conducting a technical interview.

Guidelines:
- Speak clearly and at a moderate pace
- Ask follow-up questions to clarify responses  
- Be encouraging but maintain professional standards
- Keep responses concise (10-30 seconds)
- Focus on technical accuracy and problem-solving approach
- Provide constructive feedback when appropriate`,
    };

    setCustomSystemInstruction(defaultConfig.systemInstruction || '');
    onConfigChange(defaultConfig);
    onReset?.();
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Gemini Live Configuration</span>
        </CardTitle>
        {isSessionActive && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Session is active. Some changes will take effect after reconnection.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Model Selection */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>AI Model</span>
          </Label>
          <Select
            value={config.model || 'gemini-2.0-flash-live-001'}
            onValueChange={(value) => handleConfigUpdate({ 
              model: value as GeminiLiveConfig['model'] 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {modelOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span>{option.label}</span>
                        {option.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </p>
                      <div className="flex space-x-1 mt-1">
                        {option.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Voice Selection */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4" />
            <span>Voice</span>
          </Label>
          <Select
            value={config.voice || 'Puck'}
            onValueChange={(value) => handleConfigUpdate({ 
              voice: value as GeminiLiveConfig['voice'] 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              {voiceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span>{option.label}</span>
                        {option.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Response Modalities */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Response Types</span>
          </Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-normal">Audio Responses</Label>
                <p className="text-xs text-muted-foreground">
                  AI will speak responses aloud
                </p>
              </div>
              <Switch
                checked={config.responseModalities?.includes('AUDIO') ?? true}
                onCheckedChange={(checked) => {
                  const modalities = config.responseModalities || ['AUDIO'];
                  if (checked && !modalities.includes('AUDIO')) {
                    handleConfigUpdate({ 
                      responseModalities: [...modalities, 'AUDIO'] 
                    });
                  } else if (!checked && modalities.includes('AUDIO')) {
                    handleConfigUpdate({ 
                      responseModalities: modalities.filter(m => m !== 'AUDIO') 
                    });
                  }
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-normal">Text Responses</Label>
                <p className="text-xs text-muted-foreground">
                  AI will also provide text versions of responses
                </p>
              </div>
              <Switch
                checked={config.responseModalities?.includes('TEXT') ?? false}
                onCheckedChange={(checked) => {
                  const modalities = config.responseModalities || ['AUDIO'];
                  if (checked && !modalities.includes('TEXT')) {
                    handleConfigUpdate({ 
                      responseModalities: [...modalities, 'TEXT'] 
                    });
                  } else if (!checked && modalities.includes('TEXT')) {
                    handleConfigUpdate({ 
                      responseModalities: modalities.filter(m => m !== 'TEXT') 
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Audio Configuration */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <Mic className="w-4 h-4" />
            <span>Audio Settings</span>
          </Label>
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-xs text-muted-foreground">Input Sample Rate</label>
                <p className="font-mono">16kHz</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Input Encoding</label>
                <p className="font-mono">16-bit PCM</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Input Channels</label>
                <p className="font-mono">Mono</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Output Sample Rate</label>
                <p className="font-mono">24kHz</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Audio settings are optimized for Gemini Live API requirements
            </p>
          </div>
        </div>

        {/* System Instruction */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>System Instructions</span>
          </Label>
          <Textarea
            value={customSystemInstruction}
            onChange={(e) => handleSystemInstructionChange(e.target.value)}
            placeholder="Enter custom system instructions for the AI interviewer..."
            className="min-h-32 font-mono text-sm"
            disabled={isSessionActive}
          />
          <p className="text-xs text-muted-foreground">
            Define how the AI should behave during the interview. Be specific about tone, 
            response length, and interview style.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={isSessionActive}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          
          {onSave && (
            <Button onClick={onSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          )}
        </div>

        {/* Configuration Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Configuration</Label>
          <div className="p-3 bg-muted/50 rounded-lg">
            <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
              {JSON.stringify({
                model: config.model || 'gemini-2.0-flash-live-001',
                voice: config.voice || 'Puck',
                responseModalities: config.responseModalities || ['AUDIO'],
                systemInstructionLength: customSystemInstruction.length
              }, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick settings presets component
export interface SettingsPresetsProps {
  onPresetSelect: (config: Partial<GeminiLiveConfig>) => void;
  className?: string;
}

export function SettingsPresets({ onPresetSelect, className }: SettingsPresetsProps) {
  const presets = [
    {
      name: 'Professional Interview',
      description: 'Optimized for formal technical interviews',
      config: {
        model: 'models/gemini-2.0-flash-exp' as const,
        voice: 'Puck' as const,
        responseModalities: ['AUDIO' as const],
        systemInstruction: `You are a professional AI interviewer conducting a technical interview.

Guidelines:
- Maintain a formal, professional tone
- Ask detailed follow-up questions
- Focus on technical depth and accuracy
- Keep responses concise (15-30 seconds)
- Provide constructive feedback
- Be thorough in evaluation`
      }
    },
    {
      name: 'Conversational Practice',
      description: 'Relaxed setting for interview practice',
      config: {
        model: 'models/gemini-2.5-flash-preview-native-audio-dialog' as const,
        voice: 'Kore' as const,
        responseModalities: ['AUDIO' as const, 'TEXT' as const],
        systemInstruction: `You are a friendly AI interviewer helping someone practice for interviews.

Guidelines:
- Use a warm, encouraging tone
- Provide helpful hints when needed
- Focus on building confidence
- Give detailed feedback and suggestions
- Keep the atmosphere relaxed but professional
- Explain your reasoning for questions`
      }
    },
    {
      name: 'Quick Assessment',
      description: 'Fast-paced evaluation with brief responses',
      config: {
        model: 'models/gemini-2.0-flash-exp' as const,
        voice: 'Fenrir' as const,
        responseModalities: ['AUDIO' as const],
        systemInstruction: `You are an efficient AI interviewer conducting a rapid technical assessment.

Guidelines:
- Keep responses very brief (5-15 seconds)
- Ask direct, focused questions
- Move quickly through topics
- Provide immediate, concise feedback
- Maintain energy and pace
- Focus on key competencies only`
      }
    }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-sm font-medium">Quick Presets</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {presets.map((preset) => (
          <Card 
            key={preset.name}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onPresetSelect(preset.config)}
          >
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-1">{preset.name}</h4>
              <p className="text-xs text-muted-foreground mb-3">
                {preset.description}
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  {preset.config.model?.includes('2.5') ? 'v2.5' : 'v2.0'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {preset.config.voice}
                </Badge>
                {preset.config.responseModalities?.includes('TEXT' as any) && (
                  <Badge variant="outline" className="text-xs">
                    Text
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}