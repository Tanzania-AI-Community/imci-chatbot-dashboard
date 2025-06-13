"use client";

import { useState } from "react";
import { updateFlowDetails } from "@/actions/flows";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Flow } from "@/db/schema";

export function OverviewTab({ flow }: { flow: Flow }) {
  const [name, setName] = useState(flow.name);
  const [description, setDescription] = useState(flow.description || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateFlowDetails(flow.id, { name, description });
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="name">Flow Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="space-y-2 border-t pt-4 text-sm text-muted-foreground">
        <div>
          <strong>Status:</strong>{" "}
          <Badge variant={flow.status === "published" ? "default" : "outline"}>
            {flow.status}
          </Badge>
        </div>
        <div>
          <strong>Created by:</strong> {flow.created_by}
        </div>
        <div>
          <strong>Created at:</strong>{" "}
          {new Date(flow.created_at).toLocaleString()}
        </div>
        <div>
          <strong>Last updated:</strong>{" "}
          {new Date(flow.updated_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
