"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { type FlowVersion } from "@/db/tables/flow-versions";
import { publishVersion } from "@/actions/flow-versions";

interface VersionSelectorProps {
  versions: FlowVersion[];
  currentVersionId: string;
  onVersionSelect: (versionId: string) => void;
  onPublish?: (versionId: string) => Promise<void>;
}

export function VersionSelector({
  versions,
  currentVersionId,
  onVersionSelect,
  onPublish,
}: VersionSelectorProps) {
  const currentVersion = versions.find((v) => v.id === currentVersionId);

  const handlePublish = async () => {
    try {
      if (!currentVersion) return;

      const result = await publishVersion(currentVersion.id);

      if (result.success) {
        toast.success("Version published successfully");

        // Notify parent component if callback provided
        if (onPublish) {
          await onPublish(currentVersion.id);
        }
      } else {
        toast.error(result.error || "Failed to publish version");
      }
    } catch (error) {
      console.error("Error publishing version:", error);
      toast.error("Failed to publish version");
    }
  };

  const getStatusBadge = (status: "draft" | "published" | "archived") => {
    const variant =
      status === "published"
        ? ("default" as const)
        : status === "archived"
          ? ("secondary" as const)
          : ("outline" as const);

    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <div className="flex items-center gap-4">
      <Select value={currentVersionId} onValueChange={onVersionSelect}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select version" />
        </SelectTrigger>
        <SelectContent>
          {versions.map((version) => (
            <SelectItem key={version.id} value={version.id}>
              <div className="flex items-center gap-2">
                <span>Version {version.version_number}</span>
                {getStatusBadge(version.status)}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentVersion?.status === "draft" && onPublish && (
        <Button onClick={handlePublish}>Publish Version</Button>
      )}
    </div>
  );
}
