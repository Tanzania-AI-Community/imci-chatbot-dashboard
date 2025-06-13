"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { mainNavItems } from "@/config/nav";
import { footerConfig } from "@/config/site";

interface MainSidebarProps {
  footerTitle?: string;
  footerVersion?: string;
  footerDescription?: string;
  footerCopyright?: string;
}

export function MainSidebar({
  footerTitle = footerConfig.title,
  footerVersion = footerConfig.version,
  footerDescription = footerConfig.description,
  footerCopyright = footerConfig.copyright,
}: MainSidebarProps) {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      side="left"
      className="bg-muted"
    >
      <SidebarHeader>
        <div
          className={cn(
            "flex items-center",
            open ? "px-4" : "justify-center py-2"
          )}
        >
          {open && (
            <span className="ml-2 text-lg font-semibold">{footerTitle}</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {open && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        pathname.startsWith(item.href))
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground",
                    open ? "justify-start px-3 py-2" : "justify-center p-3"
                  )}
                >
                  <div
                    className={cn(
                      "relative transition-all",
                      !open &&
                        (pathname === item.href ||
                          (item.href !== "/dashboard" &&
                            pathname.startsWith(item.href))) &&
                        "after:absolute after:-right-1 after:top-1/2 after:h-1.5 after:w-1.5 after:-translate-y-1/2 after:rounded-full after:bg-primary"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "transition-all",
                        open ? "h-4 w-4" : "h-5 w-5"
                      )}
                    />
                  </div>
                  {open && <span>{item.title}</span>}
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {open && (
          <Card className="w-auto bg-background shadow-sm transition-all">
            <CardContent className="justify-center space-y-2 p-3 text-center">
              <h2 className="text-base font-semibold text-muted-foreground">
                {footerTitle} <span className="text-xs">{footerVersion}</span>
              </h2>
              <div className="text-xs text-muted-foreground">
                {footerDescription}
              </div>
              <div className="text-xs text-muted-foreground">
                {footerCopyright}
              </div>
            </CardContent>
          </Card>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
