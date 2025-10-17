"use client";

import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  Building2,
  Users,
} from "lucide-react";

interface SkillLevel {
  id: string;
  level: number;
  levelName: string;
  generalDescription: string;
  observableBehaviors: string;
  exampleResponses: string;
  commonMistakes: string;
}

interface Skill {
  id: string;
  name: string;
  skillLevels: SkillLevel[];
}

interface Domain {
  id: string;
  name: string;
  order: number;
  skills: Skill[];
}

interface RoleSkillMapping {
  id: string;
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
  skill: {
    id: string;
    name: string;
    domain: {
      id: string;
      name: string;
    };
    skillLevels: SkillLevel[];
  };
}

interface Role {
  id: string;
  title: string;
}

interface Archetype {
  id: string;
  name: string;
  description: string;
  roles: Role[];
  roleSkillMappings: RoleSkillMapping[];
}

interface MatrixData {
  archetypes: Archetype[];
  domains: Domain[];
}

interface SkillsArchetypesMatrixProps {
  data?: MatrixData;
  isLoading: boolean;
}

// Utility functions and constants
const IMPORTANCE_LEVELS = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
} as const;

const LEVEL_CONFIG = {
  HIGH: { 
    bg: 'bg-green-100 hover:bg-green-200', 
    border: 'border-green-300', 
    text: 'text-green-800',
    level: 3
  },
  MEDIUM: { 
    bg: 'bg-blue-100 hover:bg-blue-200', 
    border: 'border-blue-300', 
    text: 'text-blue-800',
    level: 2
  },
  LOW: { 
    bg: 'bg-yellow-100 hover:bg-yellow-200', 
    border: 'border-yellow-300', 
    text: 'text-yellow-800',
    level: 1
  },
} as const;

const getSkillLevelByImportance = (skill: Skill, importance: 'LOW' | 'MEDIUM' | 'HIGH') => {
  const targetLevel = IMPORTANCE_LEVELS[importance];
  return skill.skillLevels.find(level => level.level === targetLevel);
};

const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// Sub-components for better organization
interface MatrixLegendProps {
  className?: string;
}

function MatrixLegend({ className = "" }: MatrixLegendProps) {
  return (
    <div className={`flex items-center gap-6 text-sm ${className}`}>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-yellow-100 border border-yellow-300 rounded flex items-center justify-center text-xs font-bold text-yellow-800">1</div>
        <span>Developing</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-blue-100 border border-blue-300 rounded flex items-center justify-center text-xs font-bold text-blue-800">2</div>
        <span>Proficient</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-green-100 border border-green-300 rounded flex items-center justify-center text-xs font-bold text-green-800">3</div>
        <span>Advanced</span>
      </div>
    </div>
  );
}

interface SkillHeaderCellProps {
  skill: Skill;
}

function SkillHeaderCell({ skill }: SkillHeaderCellProps) {
  return (
    <div className="flex-1 p-2 text-center text-xs font-medium text-gray-700 border-r border-gray-100 last:border-r-0 min-w-[80px]">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              {truncateText(skill.name, 10)}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="font-medium">{skill.name}</div>
            <div className="text-xs text-gray-600 mt-1">
              {skill.skillLevels.length} proficiency levels
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

interface ArchetypeRowHeaderProps {
  archetype: Archetype;
  index: number;
}

function ArchetypeRowHeader({ archetype, index }: ArchetypeRowHeaderProps) {
  return (
    <td 
      className="p-4 border-r border-gray-200 font-medium text-gray-800 sticky left-0 z-10" 
      style={{backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'}}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              <div className="font-semibold text-sm">{archetype.name}</div>
              <div className="text-xs text-gray-600 flex items-center gap-1">
                <Users className="h-3 w-3" />
                {archetype.roles.length} titles
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <div className="space-y-2">
              <div className="font-semibold">{archetype.name}</div>
              <div className="text-xs">{archetype.description}</div>
              <div className="text-xs">
                <strong>Job Titles:</strong>
                <div className="mt-1">
                  {archetype.roles.map((role) => (
                    <div key={role.id}>• {role.title}</div>
                  ))}
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </td>
  );
}

interface MatrixCellProps {
  archetype: Archetype;
  skill: Skill;
  mapping?: RoleSkillMapping;
}

function MatrixCell({ archetype, skill, mapping }: MatrixCellProps) {
  if (!mapping) {
    return (
      <td className="border-r border-gray-100 text-center w-20 h-12">
        <div className="flex items-center justify-center h-full text-gray-400">
          -
        </div>
      </td>
    );
  }

  const config = LEVEL_CONFIG[mapping.importance];
  const skillLevel = getSkillLevelByImportance(skill, mapping.importance);

  return (
    <td className="border-r border-gray-100 text-center w-20 h-12 p-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={`w-full h-full ${config.bg} ${config.border} ${config.text} 
                border rounded cursor-help flex items-center justify-center font-bold text-sm
                transition-colors duration-150`}
            >
              {config.level}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-md">
            <div className="space-y-2">
              <div className="font-semibold text-sm">
                {archetype.name} • {skill.name}
              </div>
              <div className="text-xs">
                <strong>Required Level:</strong> {config.level} ({mapping.importance})
              </div>
              {skillLevel && (
                <>
                  <div className="text-xs">
                    <strong>Level Name:</strong> {skillLevel.levelName}
                  </div>
                  <div className="text-xs">
                    <strong>Description:</strong> {skillLevel.generalDescription}
                  </div>
                  <div className="text-xs">
                    <strong>Observable Behaviors:</strong> {skillLevel.observableBehaviors}
                  </div>
                </>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </td>
  );
}

export function SkillsArchetypesMatrix({ data, isLoading }: SkillsArchetypesMatrixProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4" data-testid="loading-skeleton">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="h-12 w-48" />
                {Array.from({ length: 8 }).map((_, j) => (
                  <Skeleton key={j} className="h-12 w-20" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.archetypes || !data?.domains) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skills-Archetypes Matrix</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Import your skills taxonomy and role archetypes to see the matrix view
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Skills-Archetypes Matrix
        </CardTitle>
        <CardDescription>
          Matrix showing skill level requirements across role archetypes. Hover over cells for details.
        </CardDescription>
        <MatrixLegend />
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-max">
            <table className="w-full border-collapse">
              {/* Header Row */}
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="p-4 text-left font-semibold text-gray-800 border-r-2 border-gray-200 w-64 sticky left-0 bg-gray-50 z-10">
                    Role Archetype
                  </th>
                  {data.domains.map((domain) => (
                    <th key={domain.id} className="border-r border-gray-200 bg-blue-50" colSpan={domain.skills.length}>
                      <div className="p-3 text-center font-bold text-sm text-blue-800 border-b border-gray-200">
                        {domain.name}
                      </div>
                      <div className="flex border-t border-gray-100">
                        {domain.skills.map((skill) => (
                          <SkillHeaderCell key={skill.id} skill={skill} />
                        ))}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Data Rows */}
              <tbody>
                {data.archetypes.map((archetype, index) => (
                  <tr key={archetype.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                    <ArchetypeRowHeader archetype={archetype} index={index} />
                    
                    {/* Skill Level Cells */}
                    {data.domains.map((domain) => (
                      <React.Fragment key={domain.id}>
                        {domain.skills.map((skill) => {
                          const mapping = archetype.roleSkillMappings.find(
                            m => m.skill.id === skill.id
                          );
                          return (
                            <MatrixCell
                              key={skill.id}
                              archetype={archetype}
                              skill={skill}
                              mapping={mapping}
                            />
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}