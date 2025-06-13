"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useToast } from "@/hooks/use-toast";
import type { Variable } from "@/db/tables/variables";
import type { Condition } from "@/db/tables/conditions";
import {
  createEntryCondition,
  deleteEntryCondition,
  getEntryConditionsByFlowVersion,
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

interface ConditionsTabProps {
  flowId: string;
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

export function ConditionsTab({
  flowId,
  flowVersionId,
  variables,
}: ConditionsTabProps) {
  const { toast } = useToast();
  const [conditions, setConditions] = useState<ConditionWithVariable[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<string>("");
  const [selectedOperator, setSelectedOperator] = useState<string>("equals");
  const [conditionValue, setConditionValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const loadConditions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getEntryConditionsByFlowVersion(flowId);
      if (response.success && response.data) {
        setConditions(response.data);
      } else if (!response.success) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error loading conditions:", error);
      toast({
        title: "Error",
        description: "Failed to load conditions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [flowId, toast]);

  useEffect(() => {
    loadConditions();
  }, [loadConditions]);

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

    const result = await createEntryCondition({
      flow_version_id: flowVersionId,
      variable_id: selectedVariable,
      operator: selectedOperator as any,
      value: conditionValue,
    });

    if (result.success) {
      toast({
        title: "Success",
        description: "Entry condition added successfully",
      });
      loadConditions();
      // Reset form
      setSelectedVariable("");
      setSelectedOperator("equals");
      setConditionValue("");
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add entry condition",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleDeleteCondition = async (conditionId: string) => {
    const result = await deleteEntryCondition(conditionId);
    if (result.success) {
      toast({
        title: "Success",
        description: "Entry condition deleted successfully",
      });
      loadConditions();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete entry condition",
        variant: "destructive",
      });
    }
  };

  // Filter for global variables only
  const globalVariables = variables.filter((v) => v.is_global);

  const getVariableName = (variableId: string) => {
    return (
      variables.find((v) => v.id === variableId)?.name || "Unknown Variable"
    );
  };

  // Add debug logging for variables and conditions
  useEffect(() => {
    console.log("All variables passed to ConditionsTab:", variables);
    console.log("Filtered global variables:", globalVariables);
    console.log("Current flow version ID:", flowVersionId);
    console.log("Current conditions:", conditions);
  }, [variables, globalVariables, flowVersionId, conditions]);

  const getOperatorLabel = (operatorValue: string) => {
    return (
      OPERATORS.find((op) => op.value === operatorValue)?.label || operatorValue
    );
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="shrink-0">
        <Card>
          <CardHeader>
            <CardTitle>Add Entry Condition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                <Select
                  value={selectedVariable}
                  onValueChange={setSelectedVariable}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Variable" />
                  </SelectTrigger>
                  <SelectContent>
                    {variables
                      .filter((variable) => variable.is_global)
                      .map((variable) => (
                        <SelectItem key={variable.id} value={variable.id}>
                          {variable.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedOperator}
                  onValueChange={setSelectedOperator}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((operator) => (
                      <SelectItem key={operator.value} value={operator.value}>
                        {operator.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Value"
                  value={conditionValue}
                  onChange={(e) => setConditionValue(e.target.value)}
                />
              </div>
              <Button onClick={handleAddCondition} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Condition"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>Entry Current Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conditions.length === 0 ? (
                <p className="text-muted-foreground">No entry conditions set</p>
              ) : (
                conditions.map((condition) => (
                  <div
                    key={condition.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <span>
                      {getVariableName(condition.variable_id)}{" "}
                      {getOperatorLabel(condition.operator)}{" "}
                      {condition.value?.toString()}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCondition(condition.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
