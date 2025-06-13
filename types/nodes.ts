export interface Node {
  id: string;
  node_id: string;
  type: "question"; // Only using question type
  content: {
    text: string;
    options: Array<{
      text: string;
      variables?: Array<{
        id: string;
        value: string | number | boolean;
      }>;
    }>;
  };
  order: number;
  flow_version_id: string;
}

export interface NodeResponse {
  success: boolean;
  data?: Node[];
  error?: string;
}

export interface NodeCreateResponse {
  success: boolean;
  data?: Node;
  error?: string;
}

export interface NodeUpdateResponse {
  success: boolean;
  data?: Node;
  error?: string;
}

export interface NodeDeleteResponse {
  success: boolean;
  error?: string;
}
