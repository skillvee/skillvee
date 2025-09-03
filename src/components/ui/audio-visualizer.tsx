"use client";

import { useEffect, useRef, useState } from 'react';
import { cn } from "~/lib/utils";

export interface AudioVisualizerProps {
  audioLevel: number;
  isActive: boolean;
  variant?: 'bars' | 'waveform' | 'circle' | 'simple';
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'teal' | 'red' | 'orange';
  className?: string;
}

export function AudioVisualizer({ 
  audioLevel, 
  isActive, 
  variant = 'bars',
  size = 'md',
  color = 'blue',
  className 
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Set dimensions based on size
  useEffect(() => {
    const sizes = {
      sm: { width: 60, height: 30 },
      md: { width: 100, height: 40 },
      lg: { width: 150, height: 60 }
    };
    setDimensions(sizes[size]);
  }, [size]);

  // Colors for different variants
  const colors = {
    blue: { primary: '#3b82f6', secondary: '#93c5fd' },
    teal: { primary: '#14b8a6', secondary: '#7dd3fc' },
    red: { primary: '#ef4444', secondary: '#fca5a5' },
    orange: { primary: '#f97316', secondary: '#fed7aa' }
  };

  const colorScheme = colors[color];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      if (!isActive) {
        // Draw inactive state
        ctx.fillStyle = '#e5e7eb';
        if (variant === 'bars') {
          drawBars(ctx, dimensions, 0);
        } else if (variant === 'waveform') {
          drawWaveform(ctx, dimensions, 0);
        } else if (variant === 'circle') {
          drawCircle(ctx, dimensions, 0);
        } else {
          drawSimple(ctx, dimensions, 0);
        }
        return;
      }

      // Draw active state with audio level
      ctx.fillStyle = colorScheme.primary;
      if (variant === 'bars') {
        drawBars(ctx, dimensions, audioLevel);
      } else if (variant === 'waveform') {
        drawWaveform(ctx, dimensions, audioLevel);
      } else if (variant === 'circle') {
        drawCircle(ctx, dimensions, audioLevel);
      } else {
        drawSimple(ctx, dimensions, audioLevel);
      }

      if (isActive) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioLevel, isActive, dimensions, variant, colorScheme]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className={cn("rounded", className)}
      style={{ width: dimensions.width, height: dimensions.height }}
    />
  );
}

// Drawing functions for different visualizer variants
function drawBars(
  ctx: CanvasRenderingContext2D, 
  dimensions: { width: number; height: number }, 
  level: number
) {
  const barCount = Math.floor(dimensions.width / 8);
  const barWidth = 4;
  const barSpacing = 2;
  
  for (let i = 0; i < barCount; i++) {
    const x = i * (barWidth + barSpacing);
    const heightMultiplier = 0.3 + (Math.sin(Date.now() * 0.01 + i) * 0.2 + 0.2) * level;
    const barHeight = dimensions.height * heightMultiplier;
    const y = dimensions.height - barHeight;
    
    ctx.fillRect(x, y, barWidth, barHeight);
  }
}

function drawWaveform(
  ctx: CanvasRenderingContext2D, 
  dimensions: { width: number; height: number }, 
  level: number
) {
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = ctx.fillStyle;
  
  const points = 50;
  const amplitude = dimensions.height * 0.3 * level;
  const centerY = dimensions.height / 2;
  
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * dimensions.width;
    const y = centerY + Math.sin((i / points) * Math.PI * 4 + Date.now() * 0.01) * amplitude;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.stroke();
}

function drawCircle(
  ctx: CanvasRenderingContext2D, 
  dimensions: { width: number; height: number }, 
  level: number
) {
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const baseRadius = Math.min(dimensions.width, dimensions.height) * 0.15;
  const pulseRadius = baseRadius + (level * 10);
  
  // Draw outer pulse
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw inner circle
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
  ctx.fill();
}

function drawSimple(
  ctx: CanvasRenderingContext2D, 
  dimensions: { width: number; height: number }, 
  level: number
) {
  const barHeight = dimensions.height * level;
  const y = dimensions.height - barHeight;
  
  ctx.fillRect(0, y, dimensions.width, barHeight);
}

// Simple audio level indicator component
export interface AudioLevelIndicatorProps {
  level: number;
  isActive: boolean;
  className?: string;
}

export function AudioLevelIndicator({ level, isActive, className }: AudioLevelIndicatorProps) {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const threshold = (i + 1) * 0.2;
        const isLit = isActive && level >= threshold;
        
        return (
          <div
            key={i}
            className={cn(
              "w-1 h-4 rounded-full transition-colors duration-150",
              isLit ? "bg-teal-500" : "bg-gray-300"
            )}
          />
        );
      })}
    </div>
  );
}

// Microphone status indicator
export interface MicrophoneStatusProps {
  isListening: boolean;
  isMuted: boolean;
  audioLevel: number;
  className?: string;
}

export function MicrophoneStatus({ 
  isListening, 
  isMuted, 
  audioLevel, 
  className 
}: MicrophoneStatusProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
        isListening && !isMuted ? "bg-teal-500" : 
        isMuted ? "bg-red-500" : "bg-gray-400"
      )}>
        <div className={cn(
          "w-3 h-3 rounded-full bg-white",
          isListening && !isMuted && audioLevel > 0 && "animate-pulse"
        )} />
      </div>
      
      {isListening && !isMuted && (
        <AudioLevelIndicator level={audioLevel} isActive={true} />
      )}
    </div>
  );
}