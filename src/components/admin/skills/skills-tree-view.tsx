"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { ScrollArea } from "~/components/ui/scroll-area";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  Building2,
  FolderOpen,
  Target,
  Award,
  Plus,
  Edit,
  Trash2,
  Star,
  AlertTriangle,
} from "lucide-react";

interface TreeNode {
  id: string;
  name: string;
  type: "domain" | "category" | "skill" | "competency";
  priority?: "PRIMARY" | "SECONDARY" | "NONE";
  children?: TreeNode[];
}

interface SkillsTreeViewProps {
  data?: {
    domains?: Array<{
      id: string;
      name: string;
      categories?: Array<{
        id: string;
        name: string;
        skills?: Array<{
          id: string;
          name: string;
          competencies?: Array<{
            id: string;
            name: string;
            priority: "PRIMARY" | "SECONDARY" | "NONE";
          }>;
        }>;
      }>;
    }>;
  };
  isLoading: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
  searchQuery?: string;
  onSelect?: (node: TreeNode) => void;
}

function TreeItem({ node, level, searchQuery, onSelect }: TreeItemProps) {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand first 2 levels
  const hasChildren = node.children && node.children.length > 0;
  
  // Highlight search matches
  const isMatch = searchQuery && 
    node.name.toLowerCase().includes(searchQuery.toLowerCase());

  const getIcon = () => {
    switch (node.type) {
      case "domain":
        return <Building2 className="h-4 w-4 text-blue-600" />;
      case "category":
        return <FolderOpen className="h-4 w-4 text-green-600" />;
      case "skill":
        return <Target className="h-4 w-4 text-orange-600" />;
      case "competency":
        return <Award className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getPriorityBadge = () => {
    if (node.type !== "competency" || !node.priority) return null;
    
    const variants = {
      PRIMARY: { variant: "destructive" as const, icon: Star },
      SECONDARY: { variant: "secondary" as const, icon: AlertTriangle },
      NONE: { variant: "outline" as const, icon: null },
    };
    
    const config = variants[node.priority];
    if (!config || node.priority === "NONE") return null;
    
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="text-xs gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {node.priority.toLowerCase()}
      </Badge>
    );
  };

  return (
    <div className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="group flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              disabled={!hasChildren}
            >
              {hasChildren ? (
                isOpen ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )
              ) : (
                <div className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <div 
            className="flex items-center gap-2 flex-1 cursor-pointer"
            onClick={() => onSelect?.(node)}
          >
            {getIcon()}
            <span 
              className={`font-medium ${
                isMatch ? "bg-yellow-200 dark:bg-yellow-800 px-1 rounded" : ""
              }`}
            >
              {node.name}
            </span>
            {getPriorityBadge()}
          </div>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {hasChildren && (
          <CollapsibleContent>
            <div className="ml-6 border-l border-gray-200 dark:border-gray-700 pl-3 space-y-1">
              {node.children?.map((child) => (
                <TreeItem
                  key={child.id}
                  node={child}
                  level={level + 1}
                  searchQuery={searchQuery}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

export function SkillsTreeView({ data, isLoading, searchQuery, onSearchChange }: SkillsTreeViewProps) {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  // Transform API data to tree structure
  const transformToTreeNodes = (): TreeNode[] => {
    if (!data?.domains) return [];
    
    return data.domains.map(domain => ({
      id: domain.id,
      name: domain.name,
      type: "domain" as const,
      children: domain.categories?.map(category => ({
        id: category.id,
        name: category.name,
        type: "category" as const,
        children: category.skills?.map(skill => ({
          id: skill.id,
          name: skill.name,
          type: "skill" as const,
          children: skill.competencies?.map(competency => ({
            id: competency.id,
            name: competency.name,
            type: "competency" as const,
            priority: competency.priority,
          })),
        })),
      })),
    }));
  };

  const treeNodes = transformToTreeNodes();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Skills Hierarchy
            </CardTitle>
            <CardDescription>
              Navigate through domains, categories, skills, and competencies
            </CardDescription>
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search skills and competencies..."
                value={searchQuery || ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] w-full">
              {treeNodes.length > 0 ? (
                <div className="space-y-1">
                  {treeNodes.map((node) => (
                    <TreeItem
                      key={node.id}
                      node={node}
                      level={0}
                      searchQuery={searchQuery}
                      onSelect={setSelectedNode}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No domains yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first domain to start building the skills hierarchy
                  </p>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Domain
                  </Button>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedNode ? "Details" : "Selection"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {selectedNode.type === "domain" && <Building2 className="h-5 w-5 text-blue-600" />}
                  {selectedNode.type === "category" && <FolderOpen className="h-5 w-5 text-green-600" />}
                  {selectedNode.type === "skill" && <Target className="h-5 w-5 text-orange-600" />}
                  {selectedNode.type === "competency" && <Award className="h-5 w-5 text-purple-600" />}
                  <div>
                    <h3 className="font-medium">{selectedNode.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {selectedNode.type}
                    </p>
                  </div>
                </div>

                {selectedNode.priority && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Priority:</span>
                    <Badge 
                      variant={
                        selectedNode.priority === "PRIMARY" 
                          ? "destructive" 
                          : selectedNode.priority === "SECONDARY"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {selectedNode.priority.toLowerCase()}
                    </Badge>
                  </div>
                )}


                <div className="space-y-2">
                  <Button size="sm" className="w-full gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Add Child
                  </Button>
                  <Button size="sm" variant="destructive" className="w-full gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select an item from the tree to view details and actions
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}