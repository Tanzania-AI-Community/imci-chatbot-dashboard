import { Variable as DrizzleVariable } from "@/db/tables/variables";

// Base type for a variable from the database
export type Variable = DrizzleVariable;

// Type for the form state in the UI
export interface VariableFormState
  extends Pick<
    Variable,
    | "id"
    | "variable_id"
    | "name"
    | "description"
    | "default_value"
    | "type"
    | "category"
    | "required"
  > {}

// Type for updating variables
export interface VariableUpdateInput {
  id: string;
  variable_id: string;
  name: string;
  description: string | null;
  default_value: string;
  type: "string" | "number" | "boolean";
  category: "custom" | "patient" | "system";
  required: boolean;
  is_global: boolean;
  // flow_version_id is optional - only present for non-global variables
  flow_version_id?: string | null;
}

// API response types
export interface VariableResponse {
  success: boolean;
  data?: Variable[];
  error?: string;
}

export interface VariableUpdateResponse {
  success: boolean;
  error?: string;
}
