"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { RefreshCw, ArrowRight } from "lucide-react";

interface NextQuestionDialogProps {
  open: boolean;
  currentQuestion: number;
  totalQuestions: number;
  isLastQuestion: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isTransitioning?: boolean;
}

export function NextQuestionDialog({
  open,
  currentQuestion,
  totalQuestions,
  isLastQuestion,
  onConfirm,
  onCancel,
  isTransitioning = false,
}: NextQuestionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && !isTransitioning && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isLastQuestion ? "End Interview?" : "Move to Next Question?"}
          </DialogTitle>
          <DialogDescription>
            {isLastQuestion ? (
              <>
                You're about to complete the interview. Your answers have been recorded.
              </>
            ) : (
              <>
                You're about to move to question {currentQuestion + 2} of {totalQuestions}.
                Your current answer will be saved automatically.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isTransitioning}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isTransitioning}
          >
            {isTransitioning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {isLastQuestion ? "Ending..." : "Transitioning..."}
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 mr-2" />
                {isLastQuestion ? "End Interview" : "Continue"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
