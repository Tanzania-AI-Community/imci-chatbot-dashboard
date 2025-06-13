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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getDiagnosisAdvice,
  createDiagnosisAdvice,
  deleteDiagnosisAdvice,
} from "@/actions/diagnosis";
import type { DiagnosisAdvice } from "@/db/schema";

interface DiagnosisAdviceTabProps {
  diagnosisId: string;
}

const ADVICE_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "warning", label: "Warning" },
  { value: "instruction", label: "Instruction" },
  { value: "follow-up", label: "Follow-up" },
];

const getCategoryColor = (category: string | null) => {
  switch (category) {
    case "warning":
      return "destructive";
    case "instruction":
      return "default";
    case "follow-up":
      return "secondary";
    default:
      return "outline";
  }
};

export function DiagnosisAdviceTab({ diagnosisId }: DiagnosisAdviceTabProps) {
  const { toast } = useToast();
  const [advice, setAdvice] = useState<DiagnosisAdvice[]>([]);
  const [adviceText, setAdviceText] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("general");
  const [priority, setPriority] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);

  const loadAdvice = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getDiagnosisAdvice(diagnosisId);
      if (response.success && response.data) {
        setAdvice(response.data);
      } else if (!response.success) {
        toast({
          title: "Error",
          description: response.error || "Failed to load advice",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading advice:", error);
      toast({
        title: "Error",
        description: "Failed to load advice",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [diagnosisId, toast]);

  useEffect(() => {
    loadAdvice();
  }, [loadAdvice]);

  const handleAddAdvice = async () => {
    if (!adviceText.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter advice text",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const result = await createDiagnosisAdvice({
      diagnosis_id: diagnosisId,
      advice_text: adviceText.trim(),
      category: selectedCategory as any,
      priority: parseInt(priority) || 0,
    });

    if (result.success) {
      await loadAdvice();
      setAdviceText("");
      setSelectedCategory("general");
      setPriority("0");
      toast({
        title: "Success",
        description: "Advice added successfully",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add advice",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleDeleteAdvice = async (adviceId: string) => {
    const result = await deleteDiagnosisAdvice(adviceId);

    if (result.success) {
      await loadAdvice();
      toast({
        title: "Success",
        description: "Advice deleted successfully",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete advice",
        variant: "destructive",
      });
    }
  };

  const getCategoryLabel = (category: string | null) => {
    return (
      ADVICE_CATEGORIES.find((c) => c.value === category)?.label || "General"
    );
  };

  // Sort advice by priority
  const sortedAdvice = [...advice].sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Advice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Advice Text */}
            <div>
              <label className="text-sm font-medium">Advice Text *</label>
              <Textarea
                placeholder="Enter advice for this diagnosis..."
                value={adviceText}
                onChange={(e) => setAdviceText(e.target.value)}
                disabled={isLoading}
                rows={4}
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {ADVICE_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Input
                type="number"
                placeholder="0"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={isLoading}
                min="0"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Lower numbers appear first (0 = highest priority)
              </p>
            </div>

            <Button onClick={handleAddAdvice} disabled={isLoading}>
              <Plus className="mr-2 size-4" />
              {isLoading ? "Adding..." : "Add Advice"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Advice */}
      <Card>
        <CardHeader>
          <CardTitle>Current Advice</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedAdvice.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">
              No advice added for this diagnosis. Add advice above to provide
              guidance.
            </p>
          ) : (
            <div className="space-y-3">
              {sortedAdvice.map((item) => (
                <div key={item.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getCategoryColor(item.category) as any}>
                          {getCategoryLabel(item.category)}
                        </Badge>
                        <Badge variant="outline">
                          Priority: {item.priority}
                        </Badge>
                      </div>

                      <p className="text-sm leading-relaxed">
                        {item.advice_text}
                      </p>
                    </div>

                    <div className="ml-4 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAdvice(item.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
