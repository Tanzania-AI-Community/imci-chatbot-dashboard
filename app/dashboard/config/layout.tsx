"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface ConfigLayoutProps {
  children: React.ReactNode;
}

const tabs = [
  {
    title: "Overview",
    href: "/dashboard/config",
  },
  {
    title: "Global Variables",
    href: "/dashboard/config/variables",
  },
];

function TabNavigation() {
  const pathname = usePathname();

  return (
    <Tabs value={pathname} className="w-full">
      <TabsList className="w-full justify-start border-b bg-transparent p-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.href}
            value={tab.href}
            className={cn(
              "relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground hover:text-foreground",
              pathname === tab.href && "border-primary text-foreground"
            )}
            asChild
          >
            <Link href={tab.href}>{tab.title}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export default function ConfigLayout({ children }: ConfigLayoutProps) {
  return (
    <div className="space-y-6">
      <TabNavigation />
      <div className="mt-4">{children}</div>
    </div>
  );
}
