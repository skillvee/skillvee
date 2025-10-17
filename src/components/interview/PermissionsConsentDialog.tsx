"use client";

import { Mic, Monitor } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

interface PermissionsConsentDialogProps {
  open: boolean;
  onConsent: () => void;
  onDecline: () => void;
  isStarting?: boolean;
}

export function PermissionsConsentDialog({
  open,
  onConsent,
  onDecline,
  isStarting = false,
}: PermissionsConsentDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md bg-white" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="text-2xl">Ready to start your interview?</DialogTitle>
          <DialogDescription className="text-base pt-2">
            To provide the best interview experience, we need access to:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Mic className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Microphone Access</h4>
              <p className="text-sm text-gray-600">
                For voice conversation with the AI interviewer
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Screen Recording</h4>
              <p className="text-sm text-gray-600">
                So the AI can see and discuss the case details with you
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mt-4">
            <p className="text-xs text-gray-600">
              🔒 Your data is encrypted and only used for interview assessment. You can end the session at any time.
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            onClick={onConsent}
            disabled={isStarting}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            size="lg"
          >
            {isStarting ? "Starting..." : "Start Interview"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
