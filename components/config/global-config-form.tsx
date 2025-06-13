"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Variable,
  VariableFormState,
  VariableUpdateInput,
} from "@/types/variables";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  getAllFlowVersions,
  FlowVersionWithFlow,
} from "@/actions/flow-versions";

const formSchema = z.object({
  id: z.string(),
  variable_id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  default_value: z.string().min(1, "Value is required"),
  type: z.string(),
  category: z.string(),
  required: z.boolean(),
  is_global: z.boolean(),
  flow_version_id: z.string().nullable().optional(),
});

interface GlobalConfigFormProps {
  variable?: Variable;
  open: boolean;
  onClose: () => void;
  onSave: (data: VariableUpdateInput) => Promise<void>;
}

export function GlobalConfigForm({
  variable,
  open,
  onClose,
  onSave,
}: GlobalConfigFormProps) {
  const [flowVersions, setFlowVersions] = useState<FlowVersionWithFlow[]>([]);
  const [isLoadingFlows, setIsLoadingFlows] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: variable?.id ?? "",
      variable_id: variable?.variable_id ?? "",
      name: variable?.name ?? "",
      description: variable?.description ?? null,
      default_value: variable?.default_value ?? "",
      type: variable?.type ?? "string",
      category: variable?.category ?? "system",
      required: variable?.required ?? false,
      is_global: variable?.is_global ?? true,
      flow_version_id: variable?.flow_version_id ?? null,
    },
  });

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Validate flow selection for non-global variables
    if (!values.is_global && !values.flow_version_id) {
      toast.error("Please select a flow for non-global variables");
      return;
    }

    const updateData: VariableUpdateInput = {
      id: values.id,
      variable_id: values.variable_id,
      name: values.name,
      description: values.description,
      default_value: values.default_value,
      type: values.type as "string" | "number" | "boolean",
      category: values.category as "custom" | "patient" | "system",
      required: values.required,
      is_global: values.is_global,
      flow_version_id: values.is_global ? null : values.flow_version_id,
    };

    toast.promise(onSave(updateData), {
      loading: "Saving variable...",
      success: "Variable saved successfully!",
      error: "Failed to save variable",
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {variable ? "Edit Variable" : "Add Variable"}
          </DialogTitle>
          <DialogDescription>
            {variable
              ? "Update the variable's value and description."
              : "Create a new variable."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="variable_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!!variable} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!!variable} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                        disabled={!!variable}
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                        disabled={!!variable}
                      >
                        <option value="system">System</option>
                        <option value="patient">Patient</option>
                        <option value="custom">Custom</option>
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="default_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Value</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_global"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={!!variable}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Global Variable</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="required"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={!!variable}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Required</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {variable ? "Save Changes" : "Create Variable"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
