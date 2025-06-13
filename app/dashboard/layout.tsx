import type React from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardFooter } from "@/components/layout/dashboard-footer";
import { MainSidebar } from "@/components/layout/main-sidebar";
import { getSession } from "@/auth";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <SidebarProvider>
      <div className="relative flex h-screen min-h-screen w-full bg-muted py-2">
        <MainSidebar />
        <div className="mr-2 flex flex-1 flex-col overflow-hidden rounded-2xl border-l border-border bg-background">
          <DashboardHeader session={session} />
          <div className="relative flex min-h-0 flex-1 flex-col">
            <main className="min-h-0 flex-1 overflow-auto">{children}</main>
            <DashboardFooter className="-mx-0" />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
