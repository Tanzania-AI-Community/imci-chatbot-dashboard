import {
  LayoutDashboard,
  Settings,
  History,
  Database,
  GitBranch,
  Users,
  Shield,
  Code,
  Pill,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  external?: boolean;
  label?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// Main navigation items shown in the sidebar
export const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Flows",
    href: "/dashboard/flows",
    icon: GitBranch,
  },
  {
    title: "Medications",
    href: "/dashboard/medications",
    icon: Pill,
  },
  {
    title: "Global Config",
    href: "/dashboard/config",
    icon: Database,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

// Settings sub-navigation items
export const settingsNavItems: NavItem[] = [
  {
    title: "General",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Users",
    href: "/dashboard/settings/users",
    icon: Users,
  },
  {
    title: "Permissions",
    href: "/dashboard/settings/permissions",
    icon: Shield,
  },
  {
    title: "API",
    href: "/dashboard/settings/api",
    icon: Code,
  },
];

// Config sub-navigation items
export const configNavItems: NavItem[] = [
  {
    title: "Global Variables",
    href: "/dashboard/config",
    icon: Database,
  },
  {
    title: "API Configuration",
    href: "/dashboard/config/api",
    icon: Code,
  },
];
