"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/flow/overview-tab";
import { NodesTab } from "@/components/flow/nodes-tab";
import { VariablesTab } from "@/components/flow/variables-tab";
import { ConditionsTab } from "@/components/flow/conditions-tab";
import { DiagnosisTab } from "@/components/flow/diagnosis-tab";
import { JsonViewTab } from "@/components/flow/json-view-tab";
import { VersionsTab } from "@/components/flow/versions-tab";
import { AnalyticsTab } from "@/components/flow/analytics-tab";
import { getNodesByFlowVersion } from "@/actions/nodes";
import { getAllVariablesForFlow } from "@/actions/variables";
import { getFlowVersions, publishVersion } from "@/actions/flow-versions";
import { VersionSelector } from "@/components/flow/version-selector";
import { toast } from "sonner";
import { getEntryConditionsByFlowVersion } from "@/actions/conditions";
import { getDiagnosesByFlowVersion } from "@/actions/diagnosis";
import type { Node } from "@/types/nodes";
import type { Variable } from "@/db/tables/variables";
import type { Diagnosis } from "@/db/tables/diagnoses";
import type { DiagnosisMedication } from "@/db/tables/diagnosis-medications";
import type { DiagnosisAdvice } from "@/db/tables/diagnosis-advice";
import type { Condition } from "@/db/tables/conditions";

// Type for the server action return - this matches what getDiagnosesByFlowVersion actually returns
type ServerDiagnosisWithDetails = Diagnosis & {
  conditions: Array<{
    id: string;
    type: "diagnosis";
    variable_id: string;
    flow_version_id: string;
    operator: string;
    value: string | number | boolean | null;
    reference_id: string | null;
    logical_operator: "AND" | "OR" | null;
    group_id: string | null;
    created_at: Date;
  }>;
  medications: Array<{
    id: string;
    diagnosis_id: string;
    medication_id: string;
    dosage: string;
    duration: string | null;
    instructions: string | null;
    order_index: number;
    medication: {
      name: string;
    };
  }>;
  advice: Array<{
    id: string;
    diagnosis_id: string;
    advice_text: string;
    priority: number;
    category?: "warning" | "instruction" | "follow-up" | "general";
  }>;
};

// Type for diagnoses formatted for JSON view (matches JsonViewTab expectations)
type DiagnosisForJsonView = Diagnosis & {
  conditions?: Condition[];
  medications?: Array<DiagnosisMedication & { medication: { name: string } }>;
  advice?: DiagnosisAdvice[];
};

// Flow Editor Types
interface FlowEditorProps {
  flow: {
    id: string;
    name: string;
    description: string;
    status: "draft" | "published" | "archived";
    created_at: Date;
    updated_at: Date;
    created_by: string;
  };
  latestVersionId?: string;
}

// Condition Types
type ConditionOperator =
  | "equals"
  | "not_equals"
  | "greater_than"
  | "less_than"
  | "greater_than_equals"
  | "less_than_equals"
  | "contains"
  | "not_contains";

interface ConditionBase {
  id: string;
  flow_version_id: string;
  variable_id: string;
  operator: ConditionOperator;
  value: string | number | boolean | null;
  reference_id: string | null;
  logical_operator: "AND" | "OR" | null;
  group_id: string | null;
  created_at: Date;
  variable_name?: string | null;
}

interface DiagnosisCondition extends ConditionBase {
  type: "diagnosis";
}

interface EntryCondition extends ConditionBase {
  type: "entry";
}

// Version Types
interface FlowVersion {
  id: string;
  flow_id: string;
  status: "draft" | "published" | "archived";
  created_by: string;
  created_at: Date;
  version_number: number;
  entry_conditions: unknown;
  published_at: Date | null;
  published_by: string | null;
}

export function FlowEditor({ flow, latestVersionId }: FlowEditorProps) {
  const [currentTab, setCurrentTab] = useState("overview");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [versions, setVersions] = useState<FlowVersion[]>([]);
  const [conditions, setConditions] = useState<EntryCondition[]>([]);
  const [diagnoses, setDiagnoses] = useState<ServerDiagnosisWithDetails[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string>(
    latestVersionId || ""
  );

  // Load versions when the flow changes
  useEffect(() => {
    const loadVersions = async () => {
      if (flow?.id) {
        const result = await getFlowVersions(flow.id);
        if (result.success && result.data) {
          setVersions(result.data);
        }
      }
    };
    loadVersions();
  }, [flow?.id]);

  const handleVersionSelect = async (versionId: string) => {
    setCurrentVersionId(versionId);
  };

  const handlePublish = async (versionId: string) => {
    // Update version status and refresh list
    const publishResult = await publishVersion(versionId);

    if (publishResult.success) {
      // Refresh versions list after publishing
      const result = await getFlowVersions(flow.id);
      if (result.success && result.data) {
        setVersions(result.data);
        // Find and select the newly published version
        const publishedVersion = result.data.find((v) => v.id === versionId);
        if (publishedVersion) {
          setCurrentVersionId(publishedVersion.id);
        }
      }
    } else {
      toast.error(publishResult.error || "Failed to publish version");
    }
  };

  // Fetch data when version or tab changes
  useEffect(() => {
    const loadData = async () => {
      if (currentVersionId) {
        if (currentTab === "nodes" || currentTab === "json") {
          const result = await getNodesByFlowVersion(currentVersionId);
          if (result.success && result.data) {
            setNodes(result.data);
          }
        }

        if (
          currentTab === "variables" ||
          currentTab === "conditions" ||
          currentTab === "diagnosis" ||
          currentTab === "json"
        ) {
          const result = await getAllVariablesForFlow(currentVersionId);
          if (result.success && result.data) {
            setVariables(result.data);
          }
        }

        if (currentTab === "json") {
          // Load conditions data
          const conditionsResult =
            await getEntryConditionsByFlowVersion(currentVersionId);
          if (conditionsResult.success && conditionsResult.data) {
            setConditions(
              conditionsResult.data.map((c) => ({
                id: c.id,
                flow_version_id: c.flow_version_id,
                variable_id: c.variable_id,
                operator: c.operator as ConditionOperator,
                value: c.value,
                reference_id: null, // Entry conditions don't have reference_id
                logical_operator: c.logical_operator || null,
                group_id: c.group_id || null,
                created_at: c.created_at || new Date(),
                type: "entry" as const,
                variable_name: c.variable_name || null,
              }))
            );
          }

          // Load diagnoses data
          const diagnosesResult =
            await getDiagnosesByFlowVersion(currentVersionId);
          if (diagnosesResult.success && diagnosesResult.data) {
            setDiagnoses(diagnosesResult.data);
          }
        }
      }
    };

    loadData();
  }, [currentVersionId, currentTab]);

  const currentVersion = currentVersionId
    ? versions.find((v) => v.id === currentVersionId)
    : null;

  const jsonViewVersion = currentVersion
    ? {
        id: currentVersion.id,
        status: currentVersion.status,
        version_number: currentVersion.version_number,
        entry_conditions: conditions,
        created_at: currentVersion.created_at,
        published_at: currentVersion.published_at,
        flow_name: flow.name,
      }
    : null;

  return (
    <div className="flex min-h-0 flex-col space-y-4">
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="text-2xl font-bold">Flow Editor</h2>
        <VersionSelector
          versions={versions}
          currentVersionId={currentVersionId}
          onVersionSelect={handleVersionSelect}
          onPublish={handlePublish}
        />
      </div>

      <Tabs
        value={currentTab}
        onValueChange={setCurrentTab}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList className="shrink-0">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="nodes">Nodes</TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="min-h-0 flex-1 overflow-auto">
          <OverviewTab flow={flow} />
        </TabsContent>
        <TabsContent value="nodes" className="min-h-0 flex-1 overflow-auto">
          <NodesTab nodes={nodes} flowVersionId={currentVersionId || flow.id} />
        </TabsContent>
        <TabsContent value="variables" className="min-h-0 flex-1 overflow-auto">
          <VariablesTab
            flowId={flow.id}
            flowVersionId={currentVersionId || flow.id}
          />
        </TabsContent>
        <TabsContent
          value="conditions"
          className="min-h-0 flex-1 overflow-auto"
        >
          <ConditionsTab
            flowId={flow.id}
            flowVersionId={currentVersionId || flow.id}
            variables={variables}
          />
        </TabsContent>
        <TabsContent value="diagnosis" className="min-h-0 flex-1 overflow-auto">
          <DiagnosisTab
            flowId={flow.id}
            flowVersionId={currentVersionId || flow.id}
            variables={variables}
          />
        </TabsContent>
        <TabsContent value="analytics" className="min-h-0 flex-1 overflow-auto">
          <AnalyticsTab flowId={flow.id} flowName={flow.name} />
        </TabsContent>
        <TabsContent value="versions" className="min-h-0 flex-1 overflow-auto">
          <VersionsTab
            flowId={flow.id}
            versions={versions}
            currentVersionId={currentVersionId}
            onVersionSelect={handleVersionSelect}
            onVersionsChange={async () => {
              const result = await getFlowVersions(flow.id);
              if (result.success && result.data) {
                setVersions(result.data);
              }
            }}
          />
        </TabsContent>
        <TabsContent value="json" className="min-h-0 flex-1 overflow-auto">
          {currentVersionId ? (
            <JsonViewTab
              version={jsonViewVersion}
              flowData={{
                nodes,
                variables,
                conditions,
                diagnoses: diagnoses.map(
                  (d): DiagnosisForJsonView => ({
                    // Base diagnosis properties
                    ...d,
                    // Transform nested conditions to match expected format
                    conditions: (d.conditions || []).map((c: any) => ({
                      ...c,
                      operator: c.operator as ConditionOperator,
                      type: c.type as "entry" | "diagnosis",
                    })),
                    medications: d.medications || [],
                    advice: (d.advice || []).map((a: any) => ({
                      ...a,
                      category: a.category ?? null,
                    })),
                  })
                ),
                flow: {
                  id: flow.id,
                  name: flow.name,
                  description: flow.description,
                  status: flow.status,
                  created_at: flow.created_at,
                  updated_at: flow.updated_at,
                },
              }}
            />
          ) : (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Select a version to view JSON data
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
