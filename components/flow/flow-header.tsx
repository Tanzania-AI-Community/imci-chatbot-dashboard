// filepath: components/flow/flow-header.tsx

import { FlowWithMetadata } from "@/actions/flows";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface FlowHeaderProps {
  flow: FlowWithMetadata;
}

export function FlowHeader({ flow }: FlowHeaderProps) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted p-4 shadow">
      <div>
        <h2 className="text-2xl font-semibold">{flow.name}</h2>
        <div className="mt-1 flex items-center space-x-2">
          <Badge variant="outline" className="capitalize">
            {flow.status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Updated {formatDistanceToNow(flow.updated_at, { addSuffix: true })}
          </span>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button size="sm" variant="secondary">
          Edit
        </Button>
        <Button size="sm" variant="outline">
          Duplicate
        </Button>
        <Button size="sm" variant="destructive">
          Delete
        </Button>
      </div>
    </div>
  );
}
