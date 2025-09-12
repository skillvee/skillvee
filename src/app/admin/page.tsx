"use client";

import { BarChart3, Database, FileText, Target, Users } from "lucide-react";
import { AppSidebar } from "~/components/admin/app-sidebar";
import { SiteHeader } from "~/components/admin/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { api } from "~/trpc/react";

export default function AdminDashboardPage() {
  // Fetch dashboard stats
  const { data: skillsStats, isLoading: skillsLoading } = api.skills.getStats.useQuery();
  const { data: archetypesStats, isLoading: archetypesLoading } = api.skills.getArchetypeStats.useQuery();

  const statsCards = [
    {
      title: "Skill Domains",
      value: skillsStats?.totalDomains ?? 0,
      description: "Active skill domains",
      icon: Target,
      loading: skillsLoading,
    },
    {
      title: "Skills",
      value: skillsStats?.totalSkills ?? 0,
      description: "Total skills in taxonomy",
      icon: Database,
      loading: skillsLoading,
    },
    {
      title: "Role Archetypes",
      value: archetypesStats?.totalArchetypes ?? 0,
      description: "Available role archetypes",
      icon: Users,
      loading: archetypesLoading,
    },
    {
      title: "Job Roles",
      value: archetypesStats?.totalRoles ?? 0,
      description: "Individual job roles",
      icon: FileText,
      loading: archetypesLoading,
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader
          title="Admin Dashboard"
          subtitle="Manage skills taxonomy, role archetypes, and interview system"
        />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              
              {/* Overview Stats */}
              <div className="px-4 lg:px-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {statsCards.map((stat, index) => (
                    <Card key={index}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {stat.title}
                        </CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {stat.loading ? (
                            <div className="h-8 w-16 animate-pulse bg-muted rounded" />
                          ) : (
                            stat.value
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {stat.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Common administrative tasks for managing the skills taxonomy
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Skills Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Manage skill domains, skills, and rubric levels
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Role Archetypes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Configure role archetypes and job roles
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">CSV Import</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Bulk import skills taxonomy from CSV files
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest changes to the skills taxonomy and system configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        <p className="text-sm text-muted-foreground">
                          Skills taxonomy schema updated
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                        <p className="text-sm text-muted-foreground">
                          Admin interface components created
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                        <p className="text-sm text-muted-foreground">
                          CSV parsing utilities implemented
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}