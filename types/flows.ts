import { Node } from "./nodes";
import { Variable } from "./variables";

export interface Flow {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  created_at: Date;
  updated_at: Date;
  version?: number;
  nodes: Node[];
  variables?: Variable[];
}

export interface FlowResponse {
  success: boolean;
  data?: Flow;
  error?: string;
}

export interface FlowsResponse {
  success: boolean;
  data?: Flow[];
  error?: string;
}

export interface FlowUpdateResponse {
  success: boolean;
  data?: Flow;
  error?: string;
}
