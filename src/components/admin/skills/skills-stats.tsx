"use client";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { 
  TrendingUpIcon, 
  CheckCircleIcon, 
  Building2,
  FolderOpen,
  Target,
  Award,
  Star
} from "lucide-react";
import type { SkillsStats } from "~/server/api/schemas/skills";

interface SkillsStatsProps {
  stats?: SkillsStats;
  isLoading: boolean;
}

export function SkillsStats({ stats, isLoading }: SkillsStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
            <CardFooter className="pt-0">
              <Skeleton className="h-4 w-32" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: "Total Domains",
      value: stats.totalDomains,
      description: "Active knowledge domains",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      description: "Skill categories",
      icon: FolderOpen,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Skills",
      value: stats.totalSkills,
      description: "Individual skills tracked",
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Competencies",
      value: stats.totalCompetencies,
      description: "Detailed competencies",
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        const isPositive = stat.value > 0;

        return (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium">
                  {stat.title}
                </CardDescription>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold tabular-nums">
                {stat.value.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardFooter className="pt-0">
              <div className="flex items-center gap-2 text-sm">
                <div className={`flex items-center gap-1 font-medium ${
                  isPositive ? "text-green-600" : "text-gray-500"
                }`}>
                  {isPositive ? (
                    <>
                      <CheckCircleIcon className="h-3 w-3" />
                      Active
                    </>
                  ) : (
                    <>
                      <span className="h-3 w-3 rounded-full bg-gray-300" />
                      Empty
                    </>
                  )}
                </div>
                <span className="text-gray-500">{stat.description}</span>
              </div>
            </CardFooter>
            
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-50/20 dark:to-gray-800/20 pointer-events-none" />
          </Card>
        );
      })}
      
      {/* Additional stats row for primary/secondary competencies */}
      <div className="md:col-span-2 lg:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Priority Breakdown
            </CardTitle>
            <CardDescription>
              Distribution of competencies by priority level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {stats.primaryCompetencies}
                </div>
                <div className="text-sm text-gray-600 mb-2">Primary</div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ 
                      width: stats.totalCompetencies > 0 
                        ? `${(stats.primaryCompetencies / stats.totalCompetencies) * 100}%` 
                        : '0%'
                    }}
                  />
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {stats.secondaryCompetencies}
                </div>
                <div className="text-sm text-gray-600 mb-2">Secondary</div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 transition-all duration-300"
                    style={{ 
                      width: stats.totalCompetencies > 0 
                        ? `${(stats.secondaryCompetencies / stats.totalCompetencies) * 100}%` 
                        : '0%'
                    }}
                  />
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 mb-1">
                  {stats.totalCompetencies - stats.primaryCompetencies - stats.secondaryCompetencies}
                </div>
                <div className="text-sm text-gray-600 mb-2">No Priority</div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-400 transition-all duration-300"
                    style={{ 
                      width: stats.totalCompetencies > 0 
                        ? `${((stats.totalCompetencies - stats.primaryCompetencies - stats.secondaryCompetencies) / stats.totalCompetencies) * 100}%` 
                        : '0%'
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}