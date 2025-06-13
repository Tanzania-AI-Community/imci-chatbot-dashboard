import { getDashboardStats } from "@/actions/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  GitBranch,
  Database,
  Calendar,
  ArrowRight,
  Activity,
  Target,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage() {
  const { data, success } = await getDashboardStats();

  const stats = {
    userCount: success && data ? data.userCount : 0,
    flowCount: success && data ? data.flowCount : 0,
    variableCount: success && data ? data.variableCount : 0,
    totalSessions: success && data ? data.totalSessions : 0,
    totalFinalizedSessions: success && data ? data.totalFinalizedSessions : 0,
    lastUpdatedFlow: success && data ? data.lastUpdatedFlow : null,
  };

  const cards = [
    {
      title: "Total Users",
      value: stats.userCount,
      description: "Active system users",
      icon: Users,
      linkHref: "/dashboard/settings/users",
      linkText: "Manage Users",
    },
    {
      title: "IMCI Flows",
      value: stats.flowCount,
      description: "Diagnosis flows",
      icon: GitBranch,
      linkHref: "/dashboard/flows",
      linkText: "Manage Flows",
    },
    {
      title: "Global Variables",
      value: stats.variableCount,
      description: "Available variables",
      icon: Database,
      linkHref: "/dashboard/config",
      linkText: "Manage Variables",
    },
    {
      title: "Total Sessions",
      value: stats.totalSessions,
      description: "Flow executions",
      icon: Activity,
      linkHref: "/dashboard/flows",
      linkText: "View Analytics",
    },
    {
      title: "Finalized Sessions",
      value: stats.totalFinalizedSessions,
      description: "Completed diagnoses",
      icon: Target,
      linkHref: "/dashboard/flows",
      linkText: "View Details",
    },
    {
      title: "Last Update",
      value: stats.lastUpdatedFlow?.title || "No flows yet",
      description: stats.lastUpdatedFlow
        ? `Updated ${formatDistanceToNow(new Date(stats.lastUpdatedFlow.updated_at))} ago`
        : "No recent updates",
      icon: Calendar,
      linkHref: "/dashboard/flows",
      linkText: "View Flows",
    },
  ];

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the IMCI Dashboard system overview
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
            <CardFooter className="p-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="w-full justify-between"
              >
                <Link href={card.linkHref}>
                  {card.linkText}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
