"use client";

import { Download, Plus, Upload } from "lucide-react";
import { useState } from "react";
import { AppSidebar } from "~/components/admin/app-sidebar";
import { SiteHeader } from "~/components/admin/site-header";
import { CreateDomainForm } from "~/components/admin/skills/create-domain-form";
import { CSVImportDialog } from "~/components/admin/skills/csv-import-dialog";
import { SkillsDataTable } from "~/components/admin/skills/skills-data-table";
import { SkillsTreeView } from "~/components/admin/skills/skills-tree-view";
import { SkillsArchetypesMatrix } from "~/components/admin/skills/skills-archetypes-matrix";
import { Button } from "~/components/ui/button";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/trpc/react";

export default function AdminSkillsPage() {
  const [createDomainOpen, setCreateDomainOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch skills data
  const { data: domainsData, isLoading: domainsLoading } =
    api.skills.listDomains.useQuery({
      limit: 100,
      query: searchQuery || undefined,
    });
  const { data: hierarchyData, isLoading: hierarchyLoading } =
    api.skills.getHierarchy.useQuery({});
  const { data: matrixData, isLoading: matrixLoading } =
    api.skills.getSkillsArchetypesMatrix.useQuery();

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader
          title="Skills Management"
          subtitle="Manage competencies and skill frameworks for technical interviews"
          actions={
            <div className="flex items-center gap-3">
              <Dialog open={csvImportOpen} onOpenChange={setCsvImportOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Import CSV
                  </Button>
                </DialogTrigger>
                <CSVImportDialog onClose={() => setCsvImportOpen(false)} />
              </Dialog>

              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>

              <Dialog
                open={createDomainOpen}
                onOpenChange={setCreateDomainOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Domain
                  </Button>
                </DialogTrigger>
                <CreateDomainForm onClose={() => setCreateDomainOpen(false)} />
              </Dialog>
            </div>
          }
        />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Main Content Tabs */}
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="hierarchy" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3 lg:w-[450px]">
                    <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
                    <TabsTrigger value="matrix">Matrix View</TabsTrigger>
                    <TabsTrigger value="table">Data Table</TabsTrigger>
                  </TabsList>

                  <TabsContent value="hierarchy" className="space-y-6">
                    <SkillsTreeView
                      data={hierarchyData}
                      isLoading={hierarchyLoading}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                    />
                  </TabsContent>

                  <TabsContent value="matrix" className="space-y-6">
                    <SkillsArchetypesMatrix
                      data={matrixData}
                      isLoading={matrixLoading}
                    />
                  </TabsContent>

                  <TabsContent value="table" className="space-y-6">
                    <SkillsDataTable
                      domains={domainsData?.items || []}
                      isLoading={domainsLoading}
                    />
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
