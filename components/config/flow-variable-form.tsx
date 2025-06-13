"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Variable } from "@/types/variables";

interface FlowVariableFormProps {
  mode: "add" | "edit";
  variable?: Variable;
  open: boolean;
  onClose: () => void;
  onSave: (variable: Variable) => void;
  flowVersionId: string; // Required for flow variables
}

export function FlowVariableForm({
  mode,
  variable,
  open,
  onClose,
  onSave,
  flowVersionId,
}: FlowVariableFormProps) {
  const [formData, setFormData] = useState<Variable>({
    id: variable?.id || "",
    variable_id: variable?.variable_id || "",
    name: variable?.name || "",
    type: variable?.type || "string",
    category: variable?.category || "patient",
    default_value: variable?.default_value || "",
    description: variable?.description || "",
    is_global: false, // Always false for flow variables
    flow_version_id: flowVersionId, // Always set for flow variables
    required: variable?.required || false,
    created_by: variable?.created_by || "",
    created_at: variable?.created_at || new Date(),
    updated_at: variable?.updated_at || new Date(),
  });

  useEffect(() => {
    if (variable && mode === "edit") {
      setFormData(variable);
    } else if (mode === "add") {
      // Reset form for new variable, keeping flow_version_id
      setFormData({
        id: "",
        variable_id: "",
        name: "",
        type: "string",
        category: "patient",
        default_value: "",
        description: "",
        is_global: false,
        flow_version_id: flowVersionId,
        required: false,
        created_by: "",
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
  }, [variable, mode, flowVersionId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      flow_version_id: flowVersionId, // Ensure it's always set
      is_global: false, // Ensure it's always false
    });
  };

  const handleInputChange = (field: keyof Variable, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      updated_at: new Date(),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Create Flow Variable" : "Edit Flow Variable"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="variable_id">Variable ID</Label>
              <Input
                id="variable_id"
                value={formData.variable_id}
                onChange={(e) =>
                  handleInputChange("variable_id", e.target.value)
                }
                placeholder="e.g., patient_age"
                required
              />
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Patient Age"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "string" | "number" | "boolean") =>
                  handleInputChange("type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: "patient" | "system" | "custom") =>
                  handleInputChange("category", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="default_value">Default Value</Label>
              <Input
                id="default_value"
                value={formData.default_value}
                onChange={(e) =>
                  handleInputChange("default_value", e.target.value)
                }
                placeholder="e.g., 0"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe this variable's purpose..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === "add" ? "Create Variable" : "Update Variable"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
