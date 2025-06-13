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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllMedications,
  getDiagnosisMedications,
  createDiagnosisMedication,
  deleteDiagnosisMedication,
} from "@/actions/diagnosis";
import type { Medication } from "@/db/schema";

interface DiagnosisMedicationsTabProps {
  diagnosisId: string;
}

type DiagnosisMedicationWithDetails = {
  id: string;
  diagnosis_id: string;
  medication_id: string;
  dosage: string;
  duration: string | null;
  instructions: string | null;
  order_index: number;
  medication_name: string | null;
  medication_unit: string | null;
  medication_generic_name: string | null;
};

export function DiagnosisMedicationsTab({
  diagnosisId,
}: DiagnosisMedicationsTabProps) {
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [diagnosisMedications, setDiagnosisMedications] = useState<
    DiagnosisMedicationWithDetails[]
  >([]);
  const [selectedMedication, setSelectedMedication] = useState<string>("");
  const [dosage, setDosage] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMedications();
    loadDiagnosisMedications();
  }, [diagnosisId]);

  const loadMedications = async () => {
    const result = await getAllMedications();
    if (result.success && result.data) {
      setMedications(result.data);
    }
  };

  const loadDiagnosisMedications = async () => {
    const result = await getDiagnosisMedications(diagnosisId);
    if (result.success && result.data) {
      setDiagnosisMedications(result.data);
    }
  };

  const handleAddMedication = async () => {
    if (!selectedMedication || !dosage.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a medication and enter dosage",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const result = await createDiagnosisMedication({
      diagnosis_id: diagnosisId,
      medication_id: selectedMedication,
      dosage: dosage.trim(),
      duration: duration.trim() || null,
      instructions: instructions.trim() || null,
      order_index: diagnosisMedications.length,
    });

    if (result.success) {
      await loadDiagnosisMedications();
      setSelectedMedication("");
      setDosage("");
      setDuration("");
      setInstructions("");
      toast({
        title: "Success",
        description: "Medication added successfully",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add medication",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleDeleteMedication = async (medicationId: string) => {
    const result = await deleteDiagnosisMedication(medicationId);

    if (result.success) {
      await loadDiagnosisMedications();
      toast({
        title: "Success",
        description: "Medication removed successfully",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to remove medication",
        variant: "destructive",
      });
    }
  };

  const selectedMedicationDetails = medications.find(
    (m) => m.id === selectedMedication
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Medication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Medication Selection */}
            <div>
              <label className="text-sm font-medium">Medication</label>
              <Select
                value={selectedMedication}
                onValueChange={setSelectedMedication}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a medication" />
                </SelectTrigger>
                <SelectContent>
                  {medications.map((medication) => (
                    <SelectItem key={medication.id} value={medication.id}>
                      <div>
                        <div>{medication.name}</div>
                        {medication.generic_name && (
                          <div className="text-xs text-muted-foreground">
                            Generic: {medication.generic_name}
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedMedicationDetails && (
                <div className="mt-2 rounded bg-muted p-2 text-sm">
                  <div>
                    <strong>Unit:</strong> {selectedMedicationDetails.unit}
                  </div>
                  {selectedMedicationDetails.category && (
                    <div>
                      <strong>Category:</strong>{" "}
                      {selectedMedicationDetails.category}
                    </div>
                  )}
                  {selectedMedicationDetails.description && (
                    <div>
                      <strong>Description:</strong>{" "}
                      {selectedMedicationDetails.description}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dosage */}
            <div>
              <label className="text-sm font-medium">Dosage *</label>
              <Input
                placeholder="e.g., 500mg twice daily"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Duration */}
            <div>
              <label className="text-sm font-medium">Duration</label>
              <Input
                placeholder="e.g., for 7 days"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Instructions */}
            <div>
              <label className="text-sm font-medium">
                Additional Instructions
              </label>
              <Textarea
                placeholder="e.g., Take with food, avoid alcohol"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <Button onClick={handleAddMedication} disabled={isLoading}>
              <Plus className="mr-2 size-4" />
              {isLoading ? "Adding..." : "Add Medication"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Medications */}
      <Card>
        <CardHeader>
          <CardTitle>Prescribed Medications</CardTitle>
        </CardHeader>
        <CardContent>
          {diagnosisMedications.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">
              No medications prescribed for this diagnosis. Add medications
              above.
            </p>
          ) : (
            <div className="space-y-3">
              {diagnosisMedications.map((medication) => (
                <div key={medication.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {medication.medication_name || "Unknown Medication"}
                        </h4>
                        {medication.medication_unit && (
                          <Badge variant="outline">
                            {medication.medication_unit}
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm">
                        <strong>Dosage:</strong> {medication.dosage}
                      </div>

                      {medication.duration && (
                        <div className="text-sm">
                          <strong>Duration:</strong> {medication.duration}
                        </div>
                      )}

                      {medication.instructions && (
                        <div className="text-sm">
                          <strong>Instructions:</strong>{" "}
                          {medication.instructions}
                        </div>
                      )}

                      {medication.medication_generic_name && (
                        <div className="text-xs text-muted-foreground">
                          Generic: {medication.medication_generic_name}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMedication(medication.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
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
