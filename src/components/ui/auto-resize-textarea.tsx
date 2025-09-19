"use client";

import * as React from "react";
import { cn } from "~/lib/utils";

export interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxRows?: number;
  minRows?: number;
}

const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ className, maxRows = 12, minRows = 3, ...props }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const combinedRef = React.useMemo(
    () => ref || textareaRef,
    [ref]
  ) as React.RefObject<HTMLTextAreaElement>;

  const adjustHeight = React.useCallback(() => {
    const textarea = combinedRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    const scrollHeight = textarea.scrollHeight;
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
    
    const minHeight = minRows * lineHeight;
    const maxHeight = maxRows * lineHeight;
    
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
    
    // Show/hide scrollbar based on content
    textarea.style.overflowY = scrollHeight > maxHeight ? 'scroll' : 'hidden';
  }, [combinedRef, maxRows, minRows]);

  React.useEffect(() => {
    adjustHeight();
  }, [adjustHeight, props.value]);

  React.useEffect(() => {
    const textarea = combinedRef.current;
    if (!textarea) return;

    const resizeObserver = new ResizeObserver(() => {
      adjustHeight();
    });

    resizeObserver.observe(textarea);
    
    return () => resizeObserver.disconnect();
  }, [adjustHeight, combinedRef]);

  return (
    <textarea
      className={cn(
        "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden transition-all",
        className
      )}
      ref={combinedRef}
      onInput={adjustHeight}
      {...props}
    />
  );
});

AutoResizeTextarea.displayName = "AutoResizeTextarea";

export { AutoResizeTextarea };