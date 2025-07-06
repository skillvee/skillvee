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
  TrendingUpIcon, 
  TrendingDownIcon,
  Building2,
  FolderOpen,
  Target,
  Award,
} from "lucide-react";
import type { SkillsStats } from "~/server/api/schemas/skills";

interface SectionCardsProps {
  stats?: SkillsStats;
  isLoading: boolean;
}

export function SectionCards({ stats, isLoading }: SectionCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 gap-4 px-4 lg:px-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const cardData = [
    {
      title: "Total Domains",
      description: "Knowledge domains",
      value: stats.totalDomains,
      change: "+12%",
      trend: "up" as const,
      icon: Building2,
      detail: "Active frameworks",
    },
    {
      title: "Categories",
      description: "Skill categories",
      value: stats.totalCategories,
      change: "+8%", 
      trend: "up" as const,
      icon: FolderOpen,
      detail: "Organized groups",
    },
    {
      title: "Skills",
      description: "Individual skills",
      value: stats.totalSkills,
      change: "+25%",
      trend: "up" as const,
      icon: Target,
      detail: "Tracked abilities",
    },
    {
      title: "Competencies",
      description: "Detailed competencies",
      value: stats.totalCompetencies,
      change: "+18%",
      trend: "up" as const,
      icon: Award,
      detail: `${stats.primaryCompetencies} primary`,
    },
  ];

  return (
    <div className="grid grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 gap-4 px-4 lg:px-6">
      {cardData.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trend === "up" ? TrendingUpIcon : TrendingDownIcon;
        
        return (
          <Card key={card.title} className="@container/card">
            <CardHeader className="relative pb-3">
              <CardDescription>{card.description}</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {card.value.toLocaleString()}
              </CardTitle>
              <div className="absolute right-4 top-4">
                <Badge 
                  variant="outline" 
                  className={`flex gap-1 rounded-lg text-xs ${
                    card.trend === "up" 
                      ? "text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800"
                      : "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800"
                  }`}
                >
                  <TrendIcon className="size-3" />
                  {card.change}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                <Icon className="size-4 text-muted-foreground" />
                {card.detail}
              </div>
              <div className="text-muted-foreground">
                {card.title.toLowerCase()} available
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}