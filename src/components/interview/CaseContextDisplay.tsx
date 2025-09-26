"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ChevronDown, ChevronUp, FileText, Database } from "lucide-react";
import { cn } from "~/lib/utils";

interface CaseContextDisplayProps {
  caseContent: string;
  title?: string;
  isCollapsible?: boolean;
  className?: string;
}

export function CaseContextDisplay({
  caseContent,
  title = "Case Context",
  isCollapsible = false,
  className,
}: CaseContextDisplayProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Case Context</span>
          </CardTitle>
          {isCollapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand case context" : "Collapse case context"}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="p-6 overflow-auto">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold mb-3 mt-6 text-foreground">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold mb-2 mt-4 text-foreground flex items-center">
                    <Database className="w-4 h-4 mr-2 text-primary" />
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-base font-medium mb-2 mt-3 text-foreground">{children}</h4>
                ),
                p: ({ children }) => (
                  <p className="mb-4 text-muted-foreground leading-relaxed">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">{children}</strong>
                ),
                ul: ({ children }) => (
                  <ul className="mb-4 ml-4 list-disc space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-4 ml-4 list-decimal space-y-1">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-muted-foreground">{children}</li>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-6">
                    <table className="min-w-full border-collapse border border-border">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-muted/50">{children}</thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-border">{children}</tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left font-semibold text-foreground border border-border">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-muted-foreground border border-border">
                    {children}
                  </td>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono text-primary">
                      {children}
                    </code>
                  ) : (
                    <code className="block p-4 bg-muted rounded-md text-sm font-mono overflow-x-auto">
                      {children}
                    </code>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {caseContent}
            </ReactMarkdown>
          </div>
        </CardContent>
      )}
    </Card>
  );
}