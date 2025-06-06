import * as React from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Sparkles, X } from "lucide-react";

export const PREDEFINED_FOCUS_AREAS = [
  "Machine Learning",
  "Data Analysis", 
  "Statistics",
  "Python Programming",
  "SQL",
  "Data Visualization",
  "Deep Learning",
  "Natural Language Processing",
  "Computer Vision",
  "Big Data",
  "Cloud Computing",
  "A/B Testing",
  "Business Intelligence", 
  "Data Engineering",
  "MLOps",
  "Product Sense",
  "Problem Solving",
  "System Design",
  "Data Science",
  "Analytics",
] as const;

export interface FocusAreaSelectorProps {
  selectedAreas: string[];
  onSelectionChange: (areas: string[]) => void;
  maxSelections?: number;
  aiSuggestions?: string[];
  isLoadingAI?: boolean;
  className?: string;
}

export function FocusAreaSelector({
  selectedAreas,
  onSelectionChange,
  maxSelections = 8,
  aiSuggestions = [],
  isLoadingAI = false,
  className,
}: FocusAreaSelectorProps) {
  const toggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      onSelectionChange(selectedAreas.filter((a) => a !== area));
    } else if (selectedAreas.length < maxSelections) {
      onSelectionChange([...selectedAreas, area]);
    }
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const selectAISuggestions = () => {
    const uniqueAISuggestions = aiSuggestions.filter(area => !selectedAreas.includes(area));
    const newAreas = [...selectedAreas, ...uniqueAISuggestions].slice(0, maxSelections);
    onSelectionChange(newAreas);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-900">
            Focus Areas ({selectedAreas.length}/{maxSelections})
          </h3>
          <p className="text-xs text-gray-500">
            Select up to {maxSelections} areas that best match this role
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {aiSuggestions.length > 0 && !isLoadingAI && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAISuggestions}
              className="text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Use AI suggestions
            </Button>
          )}
          {selectedAreas.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              <X className="h-3 w-3 mr-1" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* AI Suggestions Section */}
      {(aiSuggestions.length > 0 || isLoadingAI) && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">AI Suggestions</span>
            {isLoadingAI && (
              <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          {isLoadingAI ? (
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded-full animate-pulse" style={{ width: `${60 + Math.random() * 40}px` }}></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {aiSuggestions.map((area) => (
                <Badge
                  key={area}
                  variant={selectedAreas.includes(area) ? "default" : "secondary"}
                  className={cn(
                    "cursor-pointer transition-colors border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
                    selectedAreas.includes(area) && "bg-blue-600 text-white hover:bg-blue-700",
                    selectedAreas.length >= maxSelections && !selectedAreas.includes(area) && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => toggleArea(area)}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {area}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Focus Areas */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">All Focus Areas</span>
        <div className="flex flex-wrap gap-2">
          {PREDEFINED_FOCUS_AREAS.map((area) => {
            const isSelected = selectedAreas.includes(area);
            const isAISuggestion = aiSuggestions.includes(area);
            const isDisabled = selectedAreas.length >= maxSelections && !isSelected;
            
            return (
              <Badge
                key={area}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors",
                  isSelected && "bg-gray-900 text-white hover:bg-gray-800",
                  !isSelected && "hover:bg-gray-100",
                  isAISuggestion && !isSelected && "border-blue-300 text-blue-700",
                  isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                )}
                onClick={() => !isDisabled && toggleArea(area)}
              >
                {area}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Selected Areas Summary */}
      {selectedAreas.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">Selected Areas</span>
          <div className="flex flex-wrap gap-2">
            {selectedAreas.map((area) => (
              <Badge
                key={area}
                variant="default"
                className="bg-gray-900 text-white"
              >
                {area}
                <button
                  type="button"
                  onClick={() => toggleArea(area)}
                  className="ml-1 hover:bg-gray-700 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}