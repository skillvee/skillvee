"use client";

import { Plus, Upload, Download, Users, Building2 } from "lucide-react";
import { useState } from "react";
import { AppSidebar } from "~/components/admin/app-sidebar";
import { SiteHeader } from "~/components/admin/site-header";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";

export default function AdminArchetypesPage() {
  const [createArchetypeOpen, setCreateArchetypeOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);

  // Fetch archetypes data
  const { data: archetypesData, isLoading } = api.skills.listArchetypes.useQuery({
    limit: 50,
  });

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader
          title="Role Archetypes"
          subtitle="Manage role archetypes, job roles, and skill importance mappings"
          actions={
            <div className="flex items-center gap-3">
              <Dialog open={csvImportOpen} onOpenChange={setCsvImportOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Import CSV
                  </Button>
                </DialogTrigger>
                {/* CSV Import Dialog will be updated to handle archetypes */}
              </Dialog>

              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>

              <Dialog
                open={createArchetypeOpen}
                onOpenChange={setCreateArchetypeOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Archetype
                  </Button>
                </DialogTrigger>
                {/* Create Archetype Form will be created */}
              </Dialog>
            </div>
          }
        />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              
              {/* Overview Stats */}
              <div className="px-4 lg:px-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Archetypes
                      </CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {isLoading ? (
                          <div className="h-8 w-16 animate-pulse bg-muted rounded" />
                        ) : (
                          archetypesData?.items.length ?? 0
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Unique role archetypes
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Job Roles
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {isLoading ? (
                          <div className="h-8 w-16 animate-pulse bg-muted rounded" />
                        ) : (
                          archetypesData?.items.reduce((acc: number, archetype: any) => 
                            acc + (archetype.roles?.length ?? 0), 0
                          ) ?? 0
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Individual job roles
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Skill Mappings
                      </CardTitle>
                      <Badge className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {isLoading ? (
                          <div className="h-8 w-16 animate-pulse bg-muted rounded" />
                        ) : (
                          archetypesData?.items.reduce((acc: number, archetype: any) => 
                            acc + (archetype.roleSkillMappings?.length ?? 0), 0
                          ) ?? 0
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total skill importance mappings
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Main Content */}
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="grid" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 lg:w-[300px]">
                    <TabsTrigger value="grid">Grid View</TabsTrigger>
                    <TabsTrigger value="table">Table View</TabsTrigger>
                  </TabsList>

                  <TabsContent value="grid" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {isLoading ? (
                        // Loading skeleton
                        Array.from({ length: 6 }).map((_, i) => (
                          <Card key={i}>
                            <CardHeader>
                              <div className="h-5 w-32 animate-pulse bg-muted rounded" />
                              <div className="h-4 w-full animate-pulse bg-muted rounded" />
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="h-4 w-24 animate-pulse bg-muted rounded" />
                                <div className="flex gap-1">
                                  <div className="h-5 w-16 animate-pulse bg-muted rounded" />
                                  <div className="h-5 w-20 animate-pulse bg-muted rounded" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        archetypesData?.items.map((archetype: any) => (
                          <Card key={archetype.id} className="cursor-pointer transition-colors hover:bg-muted/50">
                            <CardHeader>
                              <CardTitle className="text-base">{archetype.name}</CardTitle>
                              <CardDescription className="line-clamp-2">
                                {archetype.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-2">
                                    Job Roles ({archetype.roles?.length ?? 0})
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {archetype.roles?.slice(0, 3).map((role: any) => (
                                      <Badge key={role.id} variant="outline" className="text-xs">
                                        {role.title}
                                      </Badge>
                                    ))}
                                    {(archetype.roles?.length ?? 0) > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{(archetype.roles?.length ?? 0) - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-2">
                                    Key Skills
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {archetype.roleSkillMappings?.slice(0, 3).map((mapping: any) => (
                                      <Badge 
                                        key={mapping.id} 
                                        variant={
                                          mapping.importance === 'HIGH' ? 'default' :
                                          mapping.importance === 'MEDIUM' ? 'secondary' : 'outline'
                                        } 
                                        className="text-xs"
                                      >
                                        {mapping.skill.name}
                                        {mapping.importance === 'HIGH' && ' ✔✔✔'}
                                        {mapping.importance === 'MEDIUM' && ' ✔✔'}
                                        {mapping.importance === 'LOW' && ' ✔'}
                                      </Badge>
                                    ))}
                                    {(archetype.roleSkillMappings?.length ?? 0) > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{(archetype.roleSkillMappings?.length ?? 0) - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="table" className="space-y-6">
                    <div className="border rounded-lg">
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground">
                          Table view with detailed archetype information will be implemented here
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}