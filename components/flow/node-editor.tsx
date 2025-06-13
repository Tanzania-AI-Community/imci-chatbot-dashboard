"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { Node } from "@/types/nodes";
import { Variable } from "@/types/variables";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NodeEditorProps {
  onSave: (node: Node) => void;
  flowVariables: Variable[];
  mode?: "create" | "edit";
  initialNode?: Node;
}

export function NodeEditor({
  onSave,
  flowVariables,
  mode = "create",
  initialNode,
}: NodeEditorProps) {
  const [nodeId] = useState(
    initialNode?.node_id ||
      `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [text, setText] = useState(initialNode?.content?.text || "");
  const [options, setOptions] = useState<
    Array<{
      text: string;
      variables?: Array<{ id: string; value: string | number | boolean }>;
    }>
  >(initialNode?.content?.options || []);

  const addOption = () => {
    setOptions([...options, { text: "", variables: [] }]);
  };

  const updateOption = (
    index: number,
    field: keyof (typeof options)[0],
    value: string
  ) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  const addVariableToOption = (optionIndex: number) => {
    const updated = [...options];
    if (!updated[optionIndex].variables) {
      updated[optionIndex].variables = [];
    }
    updated[optionIndex].variables?.push({ id: "", value: "" });
    setOptions(updated);
  };

  const removeVariableFromOption = (optionIndex: number, varIndex: number) => {
    const updated = [...options];
    updated[optionIndex].variables =
      updated[optionIndex].variables?.filter((_, i) => i !== varIndex) || [];
    setOptions(updated);
  };

  const updateVariableInOption = (
    optionIndex: number,
    varIndex: number,
    field: "id" | "value",
    value: string
  ) => {
    const updated = [...options];
    if (updated[optionIndex].variables?.[varIndex]) {
      if (field === "id") {
        updated[optionIndex].variables![varIndex].id = value;
      } else {
        const variable = flowVariables.find(
          (v) => v.id === updated[optionIndex].variables![varIndex].id
        );

        let convertedValue: string | number | boolean = value;
        if (variable) {
          switch (variable.type) {
            case "number":
              convertedValue = Number(value);
              break;
            case "boolean":
              convertedValue = value.toLowerCase() === "true";
              break;
            default:
              convertedValue = value;
          }
        }

        updated[optionIndex].variables![varIndex].value = convertedValue;
      }
    }
    setOptions(updated);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!text.trim()) {
      alert("Question text is required");
      return;
    }

    if (options.length === 0) {
      alert("At least one option is required");
      return;
    }

    if (!options.every((opt) => opt.text.trim())) {
      alert("All options must have text");
      return;
    }

    const node: Node = {
      id: initialNode?.id || "", // Will be set by backend for new nodes
      node_id: nodeId,
      type: "question",
      content: {
        text,
        options: options.map((opt) => ({
          ...opt,
          variables: opt.variables?.filter(
            (v) => v.id && v.value !== undefined
          ), // Remove empty variable assignments
        })),
      },
      order: initialNode?.order || 0,
      flow_version_id: initialNode?.flow_version_id || "", // Will be set by parent component
    };

    onSave(node);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Question Text */}
      <div className="space-y-2">
        <Label htmlFor="question">Question Text</Label>
        <Textarea
          id="question"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your question..."
          className="h-24"
        />
      </div>

      {/* Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Options</Label>
          <Button variant="outline" size="sm" onClick={addOption}>
            <Plus className="mr-2 size-4" /> Add Option
          </Button>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {options.map((option, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <Label>Option Text</Label>
                      <Input
                        value={option.text}
                        onChange={(e) =>
                          updateOption(index, "text", e.target.value)
                        }
                        placeholder="Enter option text..."
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      onClick={() => removeOption(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>

                  {/* Variable Assignments */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Variable Changes</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addVariableToOption(index)}
                      >
                        <Plus className="mr-2 size-4" /> Add Variable
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {option.variables?.map((varAssignment, varIndex) => (
                        <div key={varIndex} className="flex items-start gap-2">
                          <div className="flex-1">
                            <Select
                              value={varAssignment.id}
                              onValueChange={(value) =>
                                updateVariableInOption(
                                  index,
                                  varIndex,
                                  "id",
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select variable" />
                              </SelectTrigger>
                              <SelectContent>
                                {flowVariables.map((variable) => (
                                  <SelectItem
                                    key={variable.id}
                                    value={variable.id}
                                  >
                                    {variable.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1">
                            <Input
                              value={String(varAssignment.value)}
                              onChange={(e) =>
                                updateVariableInOption(
                                  index,
                                  varIndex,
                                  "value",
                                  e.target.value
                                )
                              }
                              placeholder="Enter value..."
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              removeVariableFromOption(index, varIndex)
                            }
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Submit Button */}
      <Button className="w-full" onClick={handleSubmit}>
        {mode === "create" ? "Create Node" : "Update Node"}
      </Button>
    </div>
  );
}
