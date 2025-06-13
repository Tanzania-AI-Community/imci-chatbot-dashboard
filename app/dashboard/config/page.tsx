import { type Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Configuration",
  description: "Manage your application settings and preferences.",
};

export default function ConfigPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-medium">Configuration Overview</h3>
        <p className="text-sm text-muted-foreground">
          Manage your global settings and configurations.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Link href="/dashboard/config/variables">
          <Card className="hover:bg-muted/50">
            <CardHeader>
              <h4 className="text-sm font-medium">Global Variables</h4>
              <CardDescription>
                Configure variables available across all flows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure patient data fields and system variables used
                throughout the application.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
