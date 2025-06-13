"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Variable, VariableUpdateInput } from "@/types/variables";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

const globalVariableSchema = z.object({
  id: z.string(),
  variable_id: z.string().min(1, "Variable key is required"),
  name: z.string().min(1, "Variable name is required"),
  description: z.string().nullable(),
  default_value: z.string(),
  type: z.enum(["string", "number", "boolean"]),
  category: z.enum(["custom", "patient", "system"]),
  required: z.boolean(),
});

interface GlobalVariableFormProps {
  mode: "add" | "edit";
  variable?: Variable;
  open: boolean;
  onClose: () => void;
  onSave: (variable: Variable) => void;
}

export function GlobalVariableForm({
  mode,
  variable,
  open,
  onClose,
  onSave,
}: GlobalVariableFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof globalVariableSchema>>({
    resolver: zodResolver(globalVariableSchema),
    defaultValues: {
      id: variable?.id ?? crypto.randomUUID(),
      variable_id: variable?.variable_id ?? "",
      name: variable?.name ?? "",
      description: variable?.description ?? "",
      default_value: variable?.default_value ?? "",
      type: variable?.type ?? "string",
      category: variable?.category ?? "system",
      required: variable?.required ?? false,
    },
  });

  // Reset form when variable changes
  useEffect(() => {
    if (variable) {
      form.reset({
        id: variable.id,
        variable_id: variable.variable_id,
        name: variable.name,
        description: variable.description ?? "",
        default_value: variable.default_value,
        type: variable.type,
        category: variable.category,
        required: variable.required,
      });
    } else {
      form.reset({
        id: crypto.randomUUID(),
        variable_id: "",
        name: "",
        description: "",
        default_value: "",
        type: "string",
        category: "system",
        required: false,
      });
    }
  }, [variable, form, open]);

  const onSubmit = async (values: z.infer<typeof globalVariableSchema>) => {
    setIsSubmitting(true);
    try {
      const variableData: Variable = {
        ...values,
        is_global: true, // Always global for this form
        flow_version_id: null, // Always null for global variables
        created_by: variable?.created_by || "", // This will be set by the server
        created_at: variable?.created_at || new Date(),
        updated_at: new Date(),
      };

      onSave(variableData);
      onClose();
      toast.success(
        mode === "add" ? "Global variable created!" : "Global variable updated!"
      );
    } catch (error) {
      console.error("Error saving global variable:", error);
      toast.error("Failed to save global variable");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Global Variable" : "Edit Global Variable"}
          </DialogTitle>
          <DialogDescription>
            {variable
              ? "Update this global variable that's available across all flows."
              : "Create a new global variable that will be available across all flows."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="variable_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Key</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={!!variable || isSubmitting}
                      placeholder="e.g., patient_age"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSubmitting}
                      placeholder="e.g., Patient Age"
                    />
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
                  <FormLabel>Data Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!variable || isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="string">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Yes/No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!variable || isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="patient">Patient Data</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
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
                    <Input
                      {...field}
                      disabled={isSubmitting}
                      placeholder="Enter default value"
                    />
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      disabled={isSubmitting}
                      placeholder="Describe this variable"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : variable
                    ? "Update Variable"
                    : "Create Variable"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
