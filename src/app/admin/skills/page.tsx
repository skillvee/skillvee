"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { 
  TrendingUpIcon, 
  CheckCircleIcon, 
  Building2,
  Plus,
  Upload,
  Download,
  Search,
  Settings,
  Users,
  Target,
  Star,
  FolderOpen,
  TreePine,
  Award,
  BookOpen
} from "lucide-react";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { CreateDomainForm } from "~/components/admin/skills/create-domain-form";
import { SkillsTreeView } from "~/components/admin/skills/skills-tree-view";
import { SkillsDataTable } from "~/components/admin/skills/skills-data-table";
import { SkillsStats } from "~/components/admin/skills/skills-stats";
import { CSVImportDialog } from "~/components/admin/skills/csv-import-dialog";

export default function AdminSkillsPage() {
  const [createDomainOpen, setCreateDomainOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch skills data
  const { data: stats, isLoading: statsLoading } = api.skills.getStats.useQuery();
  const { data: domainsData, isLoading: domainsLoading } = api.skills.listDomains.useQuery({
    limit: 100,
    query: searchQuery || undefined,
  });
  const { data: hierarchyData, isLoading: hierarchyLoading } = api.skills.getHierarchy.useQuery({});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Skills Management
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Manage competencies and skill frameworks for technical interviews
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Dialog open={csvImportOpen} onOpenChange={setCsvImportOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Import CSV
                  </Button>
                </DialogTrigger>
                <CSVImportDialog onClose={() => setCsvImportOpen(false)} />
              </Dialog>
              
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              
              <Dialog open={createDomainOpen} onOpenChange={setCreateDomainOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    Add Domain
                  </Button>
                </DialogTrigger>
                <CreateDomainForm onClose={() => setCreateDomainOpen(false)} />
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <SkillsStats stats={stats} isLoading={statsLoading} />

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search domains, categories, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="hierarchy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="hierarchy" className="flex items-center gap-2">
              <TreePine className="h-4 w-4" />
              Hierarchy
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Data Table
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hierarchy" className="space-y-6">
            <SkillsTreeView 
              data={hierarchyData} 
              isLoading={hierarchyLoading}
              searchQuery={searchQuery}
            />
          </TabsContent>

          <TabsContent value="table" className="space-y-6">
            <SkillsDataTable 
              domains={domainsData?.items || []}
              isLoading={domainsLoading}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Priority Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown of competencies by priority level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Primary</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-500"
                              style={{ 
                                width: `${(stats.primaryCompetencies / stats.totalCompetencies) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{stats.primaryCompetencies}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Secondary</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-500"
                              style={{ 
                                width: `${(stats.secondaryCompetencies / stats.totalCompetencies) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{stats.secondaryCompetencies}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">None</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gray-400"
                              style={{ 
                                width: `${((stats.totalCompetencies - stats.primaryCompetencies - stats.secondaryCompetencies) / stats.totalCompetencies) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {stats.totalCompetencies - stats.primaryCompetencies - stats.secondaryCompetencies}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Recently added skills and competencies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.recentlyAdded && stats.recentlyAdded.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentlyAdded.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="capitalize">
                              {item.type}
                            </Badge>
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No recent activity</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}