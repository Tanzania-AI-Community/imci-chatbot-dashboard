"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import UserButton from "@/components/layout/user-button";
import { Sidebar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
} from "@/components/ui/breadcrumb";
import React, { useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/mode-toggle";
import { useSession } from "next-auth/react";
import { getSession } from "@/auth";

// This maps route segments to readable titles
const routeToTitle: Record<string, string> = {
  dashboard: "Flows",
  config: "Global Config",
  versions: "Version History",
  settings: "Settings",
  variables: "Variables",
  templates: "Templates",
  api: "API Settings",
};

interface Breadcrumb {
  href: string;
}

interface DashboardHeaderProps {
  session: Awaited<ReturnType<typeof getSession>>;
}

export function DashboardHeader({ session }: DashboardHeaderProps) {
  const { open, setOpen } = useSidebar();
  const pathname = usePathname();

  // Generate breadcrumbs dynamically based on the pathname
  const breadcrumbs = useMemo(() => {
    const pathSegments = pathname.split("/").filter(Boolean);
    return pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      return { name: segment.charAt(0).toUpperCase() + segment.slice(1), href };
    });
  }, [pathname]);

  if (!session?.user) {
    return (
      <div className="z-10 border-b bg-background px-6 py-2">
        <Skeleton className="h-8 w-[200px]" />
      </div>
    );
  }

  return (
    <div className="z-10 border-b bg-background px-6 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            className="-ml-2 size-9"
          >
            <Sidebar className="size-5" />
          </Button>
          <div className="flex flex-col gap-2">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem>
                      {index < breadcrumbs.length - 1 ? (
                        <Link href={breadcrumb.href} className="text-sm">
                          {breadcrumb.name}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium">
                          {breadcrumb.name}
                        </span>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && (
                      <Separator orientation="vertical" className="h-4" />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <UserButton session={session} />
        </div>
      </div>
    </div>
  );
}
