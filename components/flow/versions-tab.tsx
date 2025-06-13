"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoreVertical, Copy, Trash2, Archive, Eye } from "lucide-react";
import {
  createDraftVersion,
  publishVersion,
  archiveVersion,
  deleteVersion,
  duplicateVersion,
} from "@/actions/flow-versions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { FlowVersion } from "@/db/tables/flow-versions";

interface VersionsTabProps {
  flowId: string;
  versions: FlowVersion[];
  currentVersionId: string;
  onVersionSelect: (versionId: string) => void;
  onVersionsChange: () => void;
}

export function VersionsTab({
  flowId,
  versions,
  currentVersionId,
  onVersionSelect,
  onVersionsChange,
}: VersionsTabProps) {
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [versionToPublish, setVersionToPublish] = useState<FlowVersion | null>(
    null
  );
  const [versionToArchive, setVersionToArchive] = useState<FlowVersion | null>(
    null
  );
  const [versionToDelete, setVersionToDelete] = useState<FlowVersion | null>(
    null
  );
  const [versionToDuplicate, setVersionToDuplicate] =
    useState<FlowVersion | null>(null);
  const [duplicateNotes, setDuplicateNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Sort versions based on selected order
  const sortedVersions = [...versions].sort((a, b) => {
    if (sortOrder === "newest") {
      return b.version_number - a.version_number;
    } else {
      return a.version_number - b.version_number;
    }
  });

  const handleCreateDraft = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = await createDraftVersion(flowId);
      if (result.success && result.data) {
        onVersionsChange();
        onVersionSelect(result.data.id);
        toast.success("New draft version created");
      } else {
        toast.error(result.error || "Failed to create draft version");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!versionToPublish || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = await publishVersion(versionToPublish.id);
      if (result.success) {
        onVersionsChange();
        setShowPublishDialog(false);
        setVersionToPublish(null);
        toast.success("Version published successfully");
      } else {
        toast.error(result.error || "Failed to publish version");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!versionToArchive || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = await archiveVersion(versionToArchive.id);
      if (result.success) {
        toast.success("Version archived successfully");
        onVersionsChange();
        setShowArchiveDialog(false);
        setVersionToArchive(null);
      } else {
        toast.error(result.error || "Failed to archive version");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!versionToDelete || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = await deleteVersion(versionToDelete.id);
      if (result.success) {
        toast.success("Version deleted successfully");
        onVersionsChange();
        setShowDeleteDialog(false);
        setVersionToDelete(null);

        // If we deleted the current version, select another one
        if (versionToDelete.id === currentVersionId) {
          const remainingVersions = versions.filter(
            (v) => v.id !== versionToDelete.id
          );
          if (remainingVersions.length > 0) {
            onVersionSelect(remainingVersions[0].id);
          }
        }
      } else {
        toast.error(result.error || "Failed to delete version");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!versionToDuplicate || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = await duplicateVersion(
        versionToDuplicate.id,
        duplicateNotes
      );
      if (result.success && result.data) {
        toast.success("Version duplicated successfully");
        onVersionsChange();
        onVersionSelect(result.data.id);
        setShowDuplicateDialog(false);
        setVersionToDuplicate(null);
        setDuplicateNotes("");
      } else {
        toast.error(result.error || "Failed to duplicate version");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const initiatePublish = (version: FlowVersion) => {
    setVersionToPublish(version);
    setShowPublishDialog(true);
  };

  const initiateArchive = (version: FlowVersion) => {
    setVersionToArchive(version);
    setShowArchiveDialog(true);
  };

  const initiateDelete = (version: FlowVersion) => {
    setVersionToDelete(version);
    setShowDeleteDialog(true);
  };

  const initiateDuplicate = (version: FlowVersion) => {
    setVersionToDuplicate(version);
    setShowDuplicateDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "default";
      case "archived":
        return "secondary";
      case "draft":
        return "outline";
      default:
        return "outline";
    }
  };

  const canDelete = (version: FlowVersion) => {
    return version.status === "draft" && versions.length > 1;
  };

  const canArchive = (version: FlowVersion) => {
    return version.status === "published";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Version History</h3>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Sort: {sortOrder === "newest" ? "Newest First" : "Oldest First"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                Oldest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleCreateDraft} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create New Draft"}
          </Button>
        </div>
      </div>

      {/* Version Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{versions.length}</div>
              <div className="text-sm text-muted-foreground">
                Total Versions
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {versions.filter((v) => v.status === "published").length}
              </div>
              <div className="text-sm text-muted-foreground">Published</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {versions.filter((v) => v.status === "draft").length}
              </div>
              <div className="text-sm text-muted-foreground">Drafts</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {versions.filter((v) => v.status === "archived").length}
              </div>
              <div className="text-sm text-muted-foreground">Archived</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {sortedVersions.map((version) => (
            <Card
              key={version.id}
              className={`transition-all hover:shadow-md ${
                version.id === currentVersionId ? "ring-2 ring-primary" : ""
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge>v{version.version_number}</Badge>
                      <Badge variant={getStatusColor(version.status)}>
                        {version.status}
                      </Badge>
                      {version.id === currentVersionId && (
                        <Badge variant="secondary">Current</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created{" "}
                      {formatDistanceToNow(version.created_at, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onVersionSelect(version.id)}
                      disabled={version.id === currentVersionId}
                    >
                      <Eye className="mr-1 size-4" />
                      {version.id === currentVersionId ? "Current" : "View"}
                    </Button>
                    {version.status === "draft" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => initiatePublish(version)}
                        disabled={isSubmitting}
                      >
                        Publish
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => initiateDuplicate(version)}
                        >
                          <Copy className="mr-2 size-4" />
                          Duplicate
                        </DropdownMenuItem>
                        {canArchive(version) && (
                          <DropdownMenuItem
                            onClick={() => initiateArchive(version)}
                          >
                            <Archive className="mr-2 size-4" />
                            Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {canDelete(version) && (
                          <DropdownMenuItem
                            onClick={() => initiateDelete(version)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              {(version.published_at || version.status === "published") && (
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    {version.published_at && (
                      <span>
                        Published{" "}
                        {formatDistanceToNow(version.published_at, {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                    {version.status === "published" && (
                      <Badge variant="default" className="text-xs">
                        Active Version
                      </Badge>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          {versions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="mb-4 text-muted-foreground">No versions found</p>
              <Button onClick={handleCreateDraft} disabled={isSubmitting}>
                Create First Version
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Version</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to publish version{" "}
              {versionToPublish?.version_number}? This will archive the
              currently published version if one exists.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowPublishDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish} disabled={isSubmitting}>
              {isSubmitting ? "Publishing..." : "Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Version</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive version{" "}
              {versionToArchive?.version_number}? This version will no longer be
              active but can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowArchiveDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} disabled={isSubmitting}>
              {isSubmitting ? "Archiving..." : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Version</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete version{" "}
              {versionToDelete?.version_number}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Version</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new draft version based on version{" "}
              {versionToDuplicate?.version_number}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="duplicate-notes">Notes (optional)</Label>
              <Textarea
                id="duplicate-notes"
                placeholder="Add notes for this duplicated version..."
                value={duplicateNotes}
                onChange={(e) => setDuplicateNotes(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDuplicateDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDuplicate}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Duplicating..." : "Duplicate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
