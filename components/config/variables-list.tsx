"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Variable } from "@/types/variables";
import { VariableEditForm } from "./variable-edit-form";
import { FlowVariableForm } from "./flow-variable-form";
import { GlobalVariableForm } from "./global-variable-form";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateGlobalVariables } from "@/actions/variables";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VariablesListProps {
  initialVariables: Variable[];
  onEdit?: (variable: Variable) => void;
  isSubmitting?: boolean;
  context?: "global" | "flow"; // Determines which form to use
  flowVersionId?: string; // Required when context is "flow"
}

function VariablesTable({
  variables,
  onEdit,
  isSubmitting,
}: {
  variables: Variable[];
  onEdit: (variable: Variable) => void;
  isSubmitting: boolean;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Key</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {variables.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={7}
              className="text-center text-muted-foreground"
            >
              No variables found
            </TableCell>
          </TableRow>
        ) : (
          variables.map((variable) => (
            <TableRow key={variable.id}>
              <TableCell>{variable.variable_id}</TableCell>
              <TableCell>{variable.name}</TableCell>
              <TableCell>{variable.type}</TableCell>
              <TableCell>{variable.category}</TableCell>
              <TableCell>{variable.default_value}</TableCell>
              <TableCell>{variable.description}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(variable)}
                  disabled={isSubmitting}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export function VariablesList({
  initialVariables,
  onEdit,
  isSubmitting = false,
  context = "global",
  flowVersionId,
}: VariablesListProps) {
  const [variables, setVariables] = useState<Variable[]>(initialVariables);
  const [selectedVariable, setSelectedVariable] = useState<
    Variable | undefined
  >();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [isSubmittingState, setIsSubmitting] = useState(false);

  const globalVariables = variables.filter((v) => v.is_global);
  const flowVariables = variables.filter((v) => !v.is_global);

  const handleSave = async (data: Variable) => {
    console.log("Attempting to save variable:", data);

    // Validate required fields
    if (!data.variable_id || !data.name) {
      toast.error("Variable ID and Name are required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Transform Variable to VariableUpdateInput format
      const variableUpdateData = {
        id: data.id || crypto.randomUUID(),
        variable_id: data.variable_id,
        name: data.name,
        description: data.description,
        default_value: data.default_value,
        type: data.type,
        category: data.category,
        required: data.required,
        is_global: data.is_global,
        flow_version_id: data.flow_version_id,
        isNew: formMode === "add",
      };

      console.log("Sending variable data to server:", variableUpdateData);

      const result = await updateGlobalVariables([variableUpdateData]);

      console.log("Server response:", result);

      if (result.success) {
        // Only update UI if the server operation was successful
        if (formMode === "add") {
          setVariables((prev) => [...prev, data]);
        } else {
          setVariables((prev) =>
            prev.map((v) => (v.id === data.id ? data : v))
          );
        }
        setIsFormOpen(false);
        setSelectedVariable(undefined);
        toast.success(
          `Variable ${formMode === "add" ? "created" : "updated"} successfully`
        );
      } else {
        // Show error message from server
        toast.error(result.error || `Failed to ${formMode} variable`);
      }
    } catch (error) {
      console.error(
        `Error ${formMode === "add" ? "creating" : "updating"} variable:`,
        error
      );
      toast.error(
        `An unexpected error occurred while ${formMode === "add" ? "creating" : "updating"} the variable`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (variable: Variable) => {
    console.log("Editing variable:", variable);
    setSelectedVariable(variable); // Set this first
    setFormMode("edit");
    setIsFormOpen(true);
    // Call external onEdit if provided
    onEdit?.(variable);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Variables</h3>
        <Button
          onClick={() => {
            setFormMode("add");
            setSelectedVariable(undefined);
            setIsFormOpen(true);
          }}
          disabled={isSubmitting}
        >
          <Plus className="mr-2 size-4" />
          Add Variable
        </Button>
      </div>

      <Tabs defaultValue="global" className="w-full">
        <TabsList>
          <TabsTrigger value="global">
            Global Variables ({globalVariables.length})
          </TabsTrigger>
          <TabsTrigger value="flow">
            Flow Variables ({flowVariables.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="global" className="mt-4">
          <VariablesTable
            variables={globalVariables}
            onEdit={handleEdit}
            isSubmitting={isSubmitting}
          />
        </TabsContent>
        <TabsContent value="flow" className="mt-4">
          <VariablesTable
            variables={flowVariables}
            onEdit={handleEdit}
            isSubmitting={isSubmitting}
          />
        </TabsContent>
      </Tabs>

      {/* Render appropriate form based on context */}
      {context === "flow" && flowVersionId ? (
        <FlowVariableForm
          mode={formMode}
          variable={selectedVariable}
          open={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedVariable(undefined);
          }}
          onSave={handleSave}
          flowVersionId={flowVersionId}
        />
      ) : (
        <GlobalVariableForm
          mode={formMode}
          variable={selectedVariable}
          open={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedVariable(undefined);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
