"use client";

import * as React from "react";
import { cn } from "~/lib/utils";

interface TypingLoaderProps {
  messages: string[];
  className?: string;
}

export function TypingLoader({ messages, className }: TypingLoaderProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);
  const [displayedText, setDisplayedText] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(true);

  React.useEffect(() => {
    if (currentMessageIndex >= messages.length) return;

    const currentMessage = messages[currentMessageIndex];
    if (!currentMessage) return;

    let charIndex = 0;
    setDisplayedText("");
    setIsTyping(true);

    const typeInterval = setInterval(() => {
      if (charIndex < currentMessage.length) {
        setDisplayedText(currentMessage.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        
        // Wait before moving to next message
        setTimeout(() => {
          if (currentMessageIndex < messages.length - 1) {
            setCurrentMessageIndex(prev => prev + 1);
          }
        }, 1500);
      }
    }, 50); // Typing speed

    return () => clearInterval(typeInterval);
  }, [currentMessageIndex, messages]);

  return (
    <div className={cn("space-y-8", className)}>
      {/* Animated dots loader */}
      <div className="flex justify-center">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1.4s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Typing text */}
      <div className="text-center space-y-4">
        <div className="text-lg font-medium text-gray-800 min-h-[2rem] flex items-center justify-center">
          {displayedText}
          {isTyping && (
            <span className="ml-1 w-0.5 h-5 bg-blue-600 animate-pulse" />
          )}
        </div>
        
        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          {messages.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors duration-300",
                index <= currentMessageIndex
                  ? "bg-blue-600"
                  : "bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}