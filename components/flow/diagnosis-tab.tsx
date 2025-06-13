"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DiagnosisConditionsTab } from "./diagnosis-conditions-tab";
import { DiagnosisMedicationsTab } from "./diagnosis-medications-tab";
import { DiagnosisAdviceTab } from "./diagnosis-advice-tab";
import {
  getDiagnosesByFlowVersion,
  createDiagnosis,
  updateDiagnosis,
  deleteDiagnosis,
} from "@/actions/diagnosis";
import type { Variable } from "@/db/tables/variables";
import type { Diagnosis } from "@/db/schema";

// Type for what the server action returns (with all details)
interface DiagnosisWithServerDetails extends Diagnosis {
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
}

interface DiagnosisTabProps {
  flowId: string;
  flowVersionId: string;
  variables: Variable[];
}

export function DiagnosisTab({
  flowId,
  flowVersionId,
  variables,
}: DiagnosisTabProps) {
  const { toast } = useToast();
  const [diagnoses, setDiagnoses] = useState<DiagnosisWithServerDetails[]>([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDiagnosisName, setNewDiagnosisName] = useState("");
  const [newDiagnosisDescription, setNewDiagnosisDescription] = useState("");

  useEffect(() => {
    loadDiagnoses();
  }, [flowVersionId]);

  const loadDiagnoses = async () => {
    const result = await getDiagnosesByFlowVersion(flowVersionId);
    if (result.success && result.data) {
      setDiagnoses(result.data);
      if (result.data.length > 0 && !selectedDiagnosis) {
        setSelectedDiagnosis(result.data[0]);
      }
    }
  };

  const handleCreateDiagnosis = async () => {
    if (!newDiagnosisName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a diagnosis name",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createDiagnosis({
        flow_version_id: flowVersionId,
        name: newDiagnosisName.trim(),
        description: newDiagnosisDescription.trim() || undefined,
      });

      if (result.success && result.data) {
        // Transform the basic diagnosis to include empty arrays for details
        const newDiagnosisWithDetails: DiagnosisWithServerDetails = {
          ...result.data,
          conditions: [],
          medications: [],
          advice: [],
        };
        setDiagnoses((prev) => [...prev, newDiagnosisWithDetails]);
        setSelectedDiagnosis(result.data);
        setNewDiagnosisName("");
        setNewDiagnosisDescription("");
        setIsCreating(false);
        toast({
          title: "Success",
          description: "Diagnosis created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create diagnosis",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create diagnosis",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDiagnosis = async () => {
    if (!selectedDiagnosis || !newDiagnosisName.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await updateDiagnosis(selectedDiagnosis.id, {
        name: newDiagnosisName.trim(),
        description: newDiagnosisDescription.trim() || undefined,
      });

      if (result.success && result.data) {
        setDiagnoses((prev) =>
          prev.map((d) => {
            if (d.id === result.data.id) {
              // Preserve existing details when updating
              return {
                ...result.data,
                conditions: d.conditions,
                medications: d.medications,
                advice: d.advice,
              };
            }
            return d;
          })
        );
        setSelectedDiagnosis(result.data);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Diagnosis updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update diagnosis",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update diagnosis",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDiagnosis = async (diagnosis: Diagnosis) => {
    if (
      !confirm(
        `Are you sure you want to delete "${diagnosis.name}"? This will also delete all associated conditions, medications, and advice.`
      )
    ) {
      return;
    }

    const result = await deleteDiagnosis(diagnosis.id);
    if (result.success) {
      setDiagnoses((prev) => prev.filter((d) => d.id !== diagnosis.id));
      if (selectedDiagnosis?.id === diagnosis.id) {
        const remaining = diagnoses.filter((d) => d.id !== diagnosis.id);
        setSelectedDiagnosis(remaining.length > 0 ? remaining[0] : null);
      }
      toast({
        title: "Success",
        description: "Diagnosis deleted successfully",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete diagnosis",
        variant: "destructive",
      });
    }
  };

  const startEditing = (diagnosis: Diagnosis) => {
    setNewDiagnosisName(diagnosis.name);
    setNewDiagnosisDescription(diagnosis.description || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setIsCreating(false);
    setNewDiagnosisName("");
    setNewDiagnosisDescription("");
  };

  return (
    <div className="space-y-6">
      {/* Diagnosis List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Diagnoses</CardTitle>
            <Button
              onClick={() => setIsCreating(true)}
              size="sm"
              disabled={isCreating || isEditing}
            >
              <Plus className="mr-2 size-4" />
              Add Diagnosis
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Create/Edit Form */}
          {(isCreating || isEditing) && (
            <div className="mb-6 space-y-4 rounded-lg border p-4">
              <Input
                placeholder="Diagnosis name"
                value={newDiagnosisName}
                onChange={(e) => setNewDiagnosisName(e.target.value)}
                disabled={isSubmitting}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newDiagnosisDescription}
                onChange={(e) => setNewDiagnosisDescription(e.target.value)}
                disabled={isSubmitting}
              />
              <div className="flex gap-2">
                <Button
                  onClick={
                    isEditing ? handleUpdateDiagnosis : handleCreateDiagnosis
                  }
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelEditing}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Diagnosis List */}
          <div className="space-y-2">
            {diagnoses.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                No diagnoses created yet. Click &quot;Add Diagnosis&quot; to get
                started.
              </p>
            ) : (
              diagnoses.map((diagnosis) => (
                <div
                  key={diagnosis.id}
                  className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                    selectedDiagnosis?.id === diagnosis.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedDiagnosis(diagnosis)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{diagnosis.name}</h4>
                      {diagnosis.description && (
                        <p className="text-sm text-muted-foreground">
                          {diagnosis.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(diagnosis);
                        }}
                        disabled={isCreating || isEditing}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDiagnosis(diagnosis);
                        }}
                        disabled={isCreating || isEditing}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diagnosis Configuration */}
      {selectedDiagnosis && (
        <Card className="flex h-[600px] flex-col">
          <CardHeader className="shrink-0">
            <CardTitle>Configure: {selectedDiagnosis.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <Tabs defaultValue="conditions" className="flex h-full flex-col">
              <TabsList className="shrink-0">
                <TabsTrigger value="conditions">Conditions</TabsTrigger>
                <TabsTrigger value="medications">Medications</TabsTrigger>
                <TabsTrigger value="advice">Advice</TabsTrigger>
              </TabsList>

              <TabsContent
                value="conditions"
                className="flex-1 overflow-y-auto"
              >
                <DiagnosisConditionsTab
                  diagnosisId={selectedDiagnosis.id}
                  flowVersionId={flowVersionId}
                  variables={variables}
                />
              </TabsContent>

              <TabsContent
                value="medications"
                className="flex-1 overflow-y-auto"
              >
                <DiagnosisMedicationsTab diagnosisId={selectedDiagnosis.id} />
              </TabsContent>

              <TabsContent value="advice" className="flex-1 overflow-y-auto">
                <DiagnosisAdviceTab diagnosisId={selectedDiagnosis.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
