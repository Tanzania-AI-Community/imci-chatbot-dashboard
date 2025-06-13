import { getAllFlowsWithMetadata } from "@/actions/flows";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateFlowDialog } from "@/components/flow/create-flow-dialog";

interface Flow {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  created_at: Date;
  updated_at: Date;
  versions_count: number;
}

export default async function FlowsPage() {
  const result = await getAllFlowsWithMetadata();
  const flows: Flow[] = result.success && result.data ? result.data : [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Flows</h3>
          <p className="text-sm text-muted-foreground">
            Browse all available IMCI or medical flows. Click a flow to view or
            edit.
          </p>
        </div>
        <CreateFlowDialog />
      </div>

      {flows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No Flows Available</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            There are currently no flows available. Please create a new flow.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {flows.map((flow) => (
            <Link key={flow.id} href={`/dashboard/flows/${flow.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base">{flow.name}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {flow.description ?? "No description."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-sm">
                  <Badge variant="outline">{flow.status}</Badge>
                  <span>{flow.versions_count ?? 0} version(s)</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
