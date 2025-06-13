"use client";

import { useState, useEffect } from "react";
import { VariablesList } from "@/components/config/variables-list";
import { getAllVariablesForFlow } from "@/actions/variables";
import { Variable } from "@/types/variables";

interface VariablesTabProps {
  flowId: string;
  flowVersionId: string;
}

export function VariablesTab({ flowId, flowVersionId }: VariablesTabProps) {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVariables = async () => {
      setIsLoading(true);
      try {
        const result = await getAllVariablesForFlow(flowVersionId);
        if (result.success && result.data) {
          setVariables(result.data);
        }
      } catch (error) {
        console.error("Error fetching variables:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (flowVersionId) {
      fetchVariables();
    }
  }, [flowVersionId]);

  if (isLoading) {
    return <div>Loading variables...</div>;
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="shrink-0">
        <h3 className="text-lg font-medium">Flow Variables</h3>
        <p className="text-sm text-muted-foreground">
          Manage variables specific to this flow version, as well as global
          variables available to all flows.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <VariablesList
          initialVariables={variables}
          context="flow"
          flowVersionId={flowVersionId}
        />
      </div>
    </div>
  );
}
