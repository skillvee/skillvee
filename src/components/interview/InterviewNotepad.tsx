"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import {
  StickyNote,
  Save,
  Check
} from "lucide-react";
import { cn } from "~/lib/utils";

interface InterviewNotepadProps {
  initialNotes?: string;
  placeholder?: string;
  onChange?: (notes: string) => void;
  className?: string;
  maxLength?: number;
  autoSave?: boolean;
}

export function InterviewNotepad({
  initialNotes = "",
  placeholder = "Take notes here...\n\nKey points to remember:\n• \n• \n• ",
  onChange,
  className,
  maxLength = 5000,
  autoSave = true,
}: InterviewNotepadProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [savedNotes, setSavedNotes] = useState(initialNotes);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 500)}px`;
    }
  }, [notes]);

  // Auto-save effect
  useEffect(() => {
    if (!autoSave) return;

    const timeoutId = setTimeout(() => {
      if (notes !== savedNotes) {
        setSavedNotes(notes);
        onChange?.(notes);
      }
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [notes, autoSave, savedNotes, onChange]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    if (newNotes.length <= maxLength) {
      setNotes(newNotes);
      onChange?.(newNotes);
    }
  };



  const wordCount = notes.trim().split(/\s+/).filter(Boolean).length;
  const charCount = notes.length;
  const hasUnsavedChanges = notes !== savedNotes;

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="border-b pb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <StickyNote className="w-5 h-5 text-primary" />
              <span>Interview Notes</span>
            </CardTitle>
            <div className="flex items-center space-x-1">
              {hasUnsavedChanges && autoSave && (
                <Badge variant="secondary" className="text-xs">
                  <span className="animate-pulse">Saving...</span>
                </Badge>
              )}
              {!hasUnsavedChanges && notes.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Check className="w-3 h-3 mr-1" />
                  Saved
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 overflow-hidden">
        <div className="h-full flex flex-col">
          <Textarea
            ref={textareaRef}
            value={notes}
            onChange={handleNotesChange}
            placeholder={placeholder}
            className={cn(
              "flex-1 resize-none font-mono text-sm",
              "focus:ring-2 focus:ring-primary/50"
            )}
          />

          {/* Character/Word Count */}
          <div className="flex justify-between text-xs text-muted-foreground pt-2">
            <span>
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>
            <span className={cn(
              charCount > maxLength * 0.9 && "text-orange-500",
              charCount >= maxLength && "text-destructive"
            )}>
              {charCount}/{maxLength} characters
            </span>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}