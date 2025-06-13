"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Variable } from "@/db/tables/variables";
import {
  createDiagnosisCondition,
  deleteDiagnosisCondition,
  getDiagnosisConditionsByDiagnosis,
} from "@/actions/conditions";

// Type for condition with joined variable data (matches the query return type)
type ConditionWithVariable = {
  id: string;
  flow_version_id: string;
  variable_id: string;
  operator:
    | "equals"
    | "not_equals"
    | "greater_than"
    | "less_than"
    | "greater_than_equals"
    | "less_than_equals"
    | "contains"
    | "not_contains";
  value: string | number | boolean | null;
  type: "entry" | "diagnosis";
  logical_operator: "AND" | "OR" | null;
  group_id: string | null;
  created_at: Date;
  variable_name: string | null;
};

interface DiagnosisConditionsTabProps {
  diagnosisId: string;
  flowVersionId: string;
  variables: Variable[];
}

const OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
  { value: "greater_than_equals", label: "Greater Than or Equal" },
  { value: "less_than_equals", label: "Less Than or Equal" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Does Not Contain" },
];

const LOGICAL_OPERATORS = [
  { value: "AND", label: "AND" },
  { value: "OR", label: "OR" },
];

export function DiagnosisConditionsTab({
  diagnosisId,
  flowVersionId,
  variables,
}: DiagnosisConditionsTabProps) {
  const { toast } = useToast();
  const [conditions, setConditions] = useState<ConditionWithVariable[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<string>("");
  const [selectedOperator, setSelectedOperator] = useState<string>("equals");
  const [conditionValue, setConditionValue] = useState<string>("");
  const [selectedLogicalOperator, setSelectedLogicalOperator] =
    useState<string>("AND");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadConditions();
  }, [diagnosisId]);

  const loadConditions = async () => {
    const result = await getDiagnosisConditionsByDiagnosis(diagnosisId);
    if (result.success && result.data) {
      setConditions(result.data);
    }
  };

  const handleAddCondition = async () => {
    if (!selectedVariable || !selectedOperator || !conditionValue) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const result = await createDiagnosisCondition({
      flow_version_id: flowVersionId,
      variable_id: selectedVariable,
      operator: selectedOperator as any,
      value: conditionValue,
      reference_id: diagnosisId,
      logical_operator:
        conditions.length > 0
          ? (selectedLogicalOperator as "AND" | "OR")
          : null,
    });

    if (result.success) {
      await loadConditions();
      setSelectedVariable("");
      setConditionValue("");
      setSelectedOperator("equals");
      toast({
        title: "Success",
        description: "Condition added successfully",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add condition",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleDeleteCondition = async (conditionId: string) => {
    const result = await deleteDiagnosisCondition(conditionId);

    if (result.success) {
      await loadConditions();
      toast({
        title: "Success",
        description: "Condition deleted successfully",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete condition",
        variant: "destructive",
      });
    }
  };

  const getOperatorLabel = (operator: string) => {
    return OPERATORS.find((op) => op.value === operator)?.label || operator;
  };

  const getVariableName = (variableId: string) => {
    return (
      variables.find((v) => v.id === variableId)?.name || "Unknown Variable"
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Condition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Logical Operator Selection (only show if there are existing conditions) */}
            {conditions.length > 0 && (
              <div>
                <label className="text-sm font-medium">Logical Operator</label>
                <Select
                  value={selectedLogicalOperator}
                  onValueChange={setSelectedLogicalOperator}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select logical operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOGICAL_OPERATORS.map((operator) => (
                      <SelectItem key={operator.value} value={operator.value}>
                        {operator.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Variable Selection */}
            <div>
              <label className="text-sm font-medium">Variable</label>
              <Select
                value={selectedVariable}
                onValueChange={setSelectedVariable}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a variable" />
                </SelectTrigger>
                <SelectContent>
                  {variables.map((variable) => (
                    <SelectItem key={variable.id} value={variable.id}>
                      {variable.name} ({variable.is_global ? "Global" : "Local"}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operator Selection */}
            <div>
              <label className="text-sm font-medium">Operator</label>
              <Select
                value={selectedOperator}
                onValueChange={setSelectedOperator}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an operator" />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((operator) => (
                    <SelectItem key={operator.value} value={operator.value}>
                      {operator.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Value Input */}
            <div>
              <label className="text-sm font-medium">Value</label>
              <Input
                placeholder="Enter condition value"
                value={conditionValue}
                onChange={(e) => setConditionValue(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button onClick={handleAddCondition} disabled={isLoading}>
              <Plus className="mr-2 size-4" />
              {isLoading ? "Adding..." : "Add Condition"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Entry Current Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          {conditions.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">
              No conditions set for this diagnosis. Add conditions above to
              define when this diagnosis should be triggered.
            </p>
          ) : (
            <div className="space-y-3">
              {conditions.map((condition, index) => (
                <div
                  key={condition.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-2">
                    {/* Show logical operator for conditions after the first one */}
                    {index > 0 && condition.logical_operator && (
                      <Badge variant="outline" className="mr-2">
                        {condition.logical_operator}
                      </Badge>
                    )}
                    <span className="font-medium">
                      {condition.variable_name ||
                        getVariableName(condition.variable_id)}
                    </span>
                    <Badge variant="secondary">
                      {getOperatorLabel(condition.operator)}
                    </Badge>
                    <span className="rounded bg-muted px-2 py-1 font-mono text-sm">
                      {String(condition.value)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCondition(condition.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
