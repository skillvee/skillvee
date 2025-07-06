"use client";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { 
  Building2,
  FolderOpen,
  Target,
  Award,
} from "lucide-react";

interface SectionCardsProps {
  isLoading: boolean;
}

export function SectionCards({ isLoading }: SectionCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 gap-4 px-4 lg:px-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cardData = [
    {
      title: "Domains",
      description: "Knowledge frameworks",
      icon: Building2,
      detail: "Organize by subject area",
    },
    {
      title: "Categories",
      description: "Skill groupings",
      icon: FolderOpen,
      detail: "Structured classifications",
    },
    {
      title: "Skills",
      description: "Core abilities",
      icon: Target,
      detail: "Measurable competencies",
    },
    {
      title: "Assessment",
      description: "5-level proficiency",
      icon: Award,
      detail: "Detailed evaluation",
    },
  ];

  return (
    <div className="grid grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 gap-4 px-4 lg:px-6">
      {cardData.map((card) => {
        const Icon = card.icon;
        
        return (
          <Card key={card.title} className="@container/card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold">
                    {card.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {card.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                {card.detail}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}