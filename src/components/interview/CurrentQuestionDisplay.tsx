"use client";

import React from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { cn } from "~/lib/utils";

interface CurrentQuestionDisplayProps {
  questionText: string;
  currentIndex: number;
  totalQuestions: number;
  className?: string;
}

export function CurrentQuestionDisplay({
  questionText,
  currentIndex,
  totalQuestions,
  className,
}: CurrentQuestionDisplayProps) {
  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge variant="secondary" className="shrink-0">
            <MessageSquare className="w-3 h-3 mr-1" />
            Question {currentIndex + 1} of {totalQuestions}
          </Badge>
        </div>
        <p className="text-base font-medium leading-relaxed text-foreground">
          {questionText}
        </p>
      </CardContent>
    </Card>
  );
}
