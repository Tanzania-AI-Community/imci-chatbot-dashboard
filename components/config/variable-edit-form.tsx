"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Variable } from "@/types/variables";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  getAllFlowVersions,
  FlowVersionWithFlow,
} from "@/actions/flow-versions";

interface VariableEditFormProps {
  mode: "add" | "edit";
  variable?: Variable;
  open: boolean;
  onClose: () => void;
  onSave: (data: Variable) => Promise<void>;
}

const defaultVariable: Omit<
  Variable,
  "id" | "created_at" | "updated_at" | "created_by"
> = {
  variable_id: "",
  name: "",
  description: "",
  type: "string",
  default_value: "",
  category: "system",
  is_global: true,
  flow_version_id: null,
  required: false,
};

export function VariableEditForm({
  mode,
  variable = undefined,
  open,
  onClose,
  onSave,
}: VariableEditFormProps) {
  const [formState, setFormState] = useState<Variable>(() => getInitialState());
  const [flowVersions, setFlowVersions] = useState<FlowVersionWithFlow[]>([]);
  const [isLoadingFlows, setIsLoadingFlows] = useState(false);

  // Function to get the initial state
  function getInitialState(): Variable {
    if (mode === "edit" && variable) {
      console.log("Initializing edit form with variable:", variable);
      // When editing, use the variable's values but ensure all fields are present
      return {
        ...defaultVariable, // Provide defaults first
        ...variable, // Override with actual values
        // Ensure these specific fields are set correctly
        id: variable.id,
        variable_id: variable.variable_id,
        name: variable.name,
        description: variable.description || "",
        type: variable.type || "string",
        category: variable.category || "system",
        default_value: variable.default_value || "",
        is_global: variable.is_global ?? true,
        required: variable.required ?? false,
        created_at: variable.created_at,
        updated_at: variable.updated_at,
        created_by: variable.created_by,
      };
    }
    // When adding, use defaults with new ID and timestamps
    return {
      ...defaultVariable,
      id: crypto.randomUUID(),
      created_at: new Date(),
      updated_at: new Date(),
      created_by: "", // This should be set server-side
    };
  }

  // Reset form state when variable prop changes
  useEffect(() => {
    setFormState(getInitialState());
  }, [variable, mode, getInitialState]);

  // Load flow versions when component mounts
  useEffect(() => {
    loadFlowVersions();
  }, []);

  const loadFlowVersions = async () => {
    setIsLoadingFlows(true);
    try {
      const response = await getAllFlowVersions();
      if (response.success && response.data) {
        setFlowVersions(response.data);
      }
    } catch (error) {
      console.error("Failed to load flow versions:", error);
      toast.error("Failed to load available flows");
    } finally {
      setIsLoadingFlows(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validate required fields
    if (mode === "add" && !formState.variable_id) {
      toast.error("Variable Key is required when creating a new variable");
      return;
    }

    if (!formState.name) {
      toast.error("Variable Name is required");
      return;
    }

    // Validate flow selection for non-global variables
    if (!formState.is_global && !formState.flow_version_id) {
      toast.error("Please select a flow for non-global variables");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting form data:", formState);

      // Ensure all required fields are included
      const dataToSave = {
        ...formState,
        // Update timestamps
        updated_at: new Date(),
        // Keep original creation data in edit mode
        ...(mode === "edit" &&
          variable && {
            created_at: variable.created_at,
            created_by: variable.created_by,
          }),
      };

      await onSave(dataToSave);
      onClose(); // Close form on successful save
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to save variable");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Variable" : "Edit Variable"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Create a new variable."
              : "Update the values and description of this variable."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Global Variable</Label>
              <p className="text-[0.8rem] text-muted-foreground">
                Make this variable available across all flows
              </p>
            </div>
            <Switch
              checked={formState.is_global}
              onCheckedChange={(checked) =>
                setFormState((prev) => ({
                  ...prev,
                  is_global: checked,
                  // Clear flow_version_id when switching to global
                  flow_version_id: checked ? null : prev.flow_version_id,
                }))
              }
              disabled={mode === "edit"}
            />
          </div>

          {!formState.is_global && (
            <div>
              <Label>
                Flow <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formState.flow_version_id || ""}
                onValueChange={(value) =>
                  setFormState((prev) => ({
                    ...prev,
                    flow_version_id: value || null,
                  }))
                }
                disabled={isSubmitting || isLoadingFlows}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingFlows ? "Loading flows..." : "Select a flow"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {flowVersions.map((flowVersion) => (
                    <SelectItem key={flowVersion.id} value={flowVersion.id}>
                      {flowVersion.flow_name} (v{flowVersion.version_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formState.flow_version_id && !formState.is_global && (
                <p className="mt-1 text-sm text-red-500">
                  A flow must be selected for non-global variables
                </p>
              )}
            </div>
          )}

          <div>
            <Label>Key</Label>
            <Input
              value={formState.variable_id}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  variable_id: e.target.value,
                }))
              }
              disabled={isSubmitting}
              readOnly={mode === "edit"}
              placeholder="Enter variable key"
              required
            />
          </div>

          <div>
            <Label>Name</Label>
            <Input
              value={formState.name}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={isSubmitting}
              placeholder="Enter variable name"
              required
            />
          </div>

          <div>
            <Label>Type</Label>
            <Select
              value={formState.type}
              onValueChange={(value: "string" | "number" | "boolean") =>
                setFormState((prev) => ({ ...prev, type: value }))
              }
              disabled={mode === "edit"}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Category</Label>
            <Select
              value={formState.category}
              onValueChange={(value: "system" | "patient" | "custom") =>
                setFormState((prev) => ({ ...prev, category: value }))
              }
              disabled={mode === "edit"}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Default Value</Label>
            <Input
              value={formState.default_value}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  default_value: e.target.value,
                }))
              }
              placeholder="Enter default value"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={formState.description ?? ""}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter description"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : mode === "add"
                  ? "Create"
                  : "Update"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
