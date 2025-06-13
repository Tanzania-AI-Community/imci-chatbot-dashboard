import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, GitBranch, Database, Calendar } from "lucide-react";

export default function DashboardLoading() {
  const cards = [
    {
      title: "Total Users",
      icon: Users,
    },
    {
      title: "IMCI Flows",
      icon: GitBranch,
    },
    {
      title: "Global Variables",
      icon: Database,
    },
    {
      title: "Last Update",
      icon: Calendar,
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="mt-2 h-4 w-32" />
            </CardContent>
            <CardFooter className="p-2">
              <Skeleton className="h-8 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
