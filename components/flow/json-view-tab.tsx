"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CopyIcon, DownloadIcon } from "lucide-react";
import { toast } from "sonner";
import type { Diagnosis } from "@/db/tables/diagnoses";
import type { DiagnosisMedication } from "@/db/tables/diagnosis-medications";
import type { DiagnosisAdvice } from "@/db/tables/diagnosis-advice";
import type { Condition } from "@/db/tables/conditions";
import type { Variable } from "@/db/tables/variables";

interface JsonViewTabProps {
  version: {
    id: string;
    status: "draft" | "published" | "archived";
    version_number: number;
    entry_conditions: Condition[];
    created_at: Date;
    published_at?: Date | null;
    flow_name: string;
  } | null;
  flowData?: {
    flow?: {
      id: string;
      name: string;
      description: string;
      status: "draft" | "published" | "archived";
      created_at: Date;
      updated_at: Date;
    };
    nodes?: Array<{
      id: string;
      type: string;
      content: any;
      next?: string;
      conditions?: any[];
      variables?: any[];
    }>;
    variables?: Variable[];
    conditions?: Condition[];
    diagnoses?: Array<
      Diagnosis & {
        conditions?: Condition[];
        medications?: Array<
          DiagnosisMedication & { medication: { name: string } }
        >;
        advice?: DiagnosisAdvice[];
      }
    >;
  };
}

export function JsonViewTab({ version, flowData }: JsonViewTabProps) {
  const jsonData = {
    meta: {
      id: flowData?.flow?.id || null,
      name: flowData?.flow?.name || null,
      description: flowData?.flow?.description || null,
      status: flowData?.flow?.status || null,
      created_at: flowData?.flow?.created_at || null,
      updated_at: flowData?.flow?.updated_at || null,
    },
    version: version
      ? {
          id: version.id,
          number: version.version_number,
          status: version.status,
          created_at: version.created_at,
          published_at: version.published_at,
        }
      : null,
    entry_conditions: version?.entry_conditions || [],
    variables: (flowData?.variables || []).map((variable) => ({
      id: variable.id,
      name: variable.name,
      type: variable.type,
      description: variable.description ?? undefined,
      default_value: variable.default_value,
      is_global: variable.is_global,
    })),
    diagnoses: (flowData?.diagnoses || []).map((diagnosis) => ({
      id: diagnosis.id,
      name: diagnosis.name,
      description: diagnosis.description ?? undefined,
      conditions:
        diagnosis.conditions?.map((condition) => ({
          id: condition.id,
          operator: condition.operator,
          value: condition.value,
          logical_operator: condition.logical_operator,
          variable_id: condition.variable_id,
        })) || [],
      medications:
        diagnosis.medications?.map((med) => ({
          id: med.id,
          name: med.medication.name,
          dosage: med.dosage,
          duration: med.duration,
          instructions: med.instructions,
        })) || [],
      advice:
        diagnosis.advice?.map((adv) => ({
          id: adv.id,
          content: adv.advice_text,
          category: adv.category,
          priority: adv.priority,
        })) || [],
    })),
    nodes: (flowData?.nodes || []).map((node) => ({
      id: node.id,
      type: node.type,
      content: node.content,
      next: node.next,
      conditions: node.conditions,
      variables: node.variables,
    })),
    conditions: (flowData?.conditions || []).map((condition) => ({
      id: condition.id,
      operator: condition.operator,
      value: condition.value,
      logical_operator: condition.logical_operator,
      variable_id: condition.variable_id,
      type: condition.type,
      reference_id: condition.reference_id,
    })),
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    toast.success("JSON copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flow-${version?.flow_name}-v${version?.version_number}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON file downloaded");
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex shrink-0 justify-end space-x-2">
        <Button variant="secondary" size="sm" onClick={handleCopy}>
          <CopyIcon className="mr-2 size-4" />
          Copy JSON
        </Button>
        <Button variant="secondary" size="sm" onClick={handleDownload}>
          <DownloadIcon className="mr-2 size-4" />
          Download JSON
        </Button>
      </div>

      <Card className="min-h-0 flex-1 p-4">
        <ScrollArea className="h-full">
          <pre className="whitespace-pre-wrap break-words text-sm">
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        </ScrollArea>
      </Card>
    </div>
  );
}
