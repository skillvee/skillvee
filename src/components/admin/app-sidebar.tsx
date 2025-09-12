"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenu,
} from "~/components/ui/sidebar";
import { 
  Building2, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Target,
  Award,
  BookOpen,
  PlusCircle,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

// Navigation items for admin sidebar
const navigationItems = [
  {
    title: "Overview",
    icon: BarChart3,
    href: "/admin",
  },
  {
    title: "Skills Taxonomy",
    icon: Target,
    href: "/admin/skills",
  },
  {
    title: "Role Archetypes", 
    icon: Building2,
    href: "/admin/archetypes",
  },
  {
    title: "Interviews",
    icon: Users,
    href: "/admin/interviews",
  },
  {
    title: "Job Descriptions",
    icon: FileText,
    href: "/admin/job-descriptions",
  },
  {
    title: "Analytics",
    icon: TrendingUp,
    href: "/admin/analytics",
  },
];

const quickActions = [
  {
    title: "Add Skill Domain",
    icon: PlusCircle,
    href: "/admin/skills?action=create-domain",
  },
  {
    title: "Add Archetype", 
    icon: Building2,
    href: "/admin/archetypes?action=create",
  },
  {
    title: "Import CSV", 
    icon: BookOpen,
    href: "/admin/skills?action=import-csv",
  },
];

interface AppSidebarProps {
  variant?: "sidebar" | "floating" | "inset";
}

export function AppSidebar({ variant = "inset" }: AppSidebarProps) {
  return (
    <Sidebar variant={variant} className="border-r">
      <SidebarHeader>
        <SidebarMenuButton size="lg" asChild>
          <Link href="/admin">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Skillvee Admin</span>
              <span className="truncate text-xs text-muted-foreground">Skills Platform</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild>
                <Link href={item.href}>
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {/* Quick Actions */}
        <div className="mt-6">
          <div className="px-2 py-1">
            <p className="text-xs font-medium text-muted-foreground">Quick Actions</p>
          </div>
          <SidebarMenu>
            {quickActions.map((action) => (
              <SidebarMenuItem key={action.href}>
                <SidebarMenuButton asChild size="sm">
                  <Link href={action.href}>
                    <action.icon className="size-3" />
                    <span className="text-xs">{action.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/admin/settings">
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}