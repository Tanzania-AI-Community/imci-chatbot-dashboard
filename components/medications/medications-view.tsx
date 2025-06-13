"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getMedications,
  createMedication,
  updateMedication,
  deleteMedication,
} from "@/actions/medications";
import type { Medication } from "@/db/schema";

const MEDICATION_CATEGORIES = [
  { value: "antibiotic", label: "Antibiotic" },
  { value: "analgesic", label: "Analgesic" },
  { value: "antipyretic", label: "Antipyretic" },
  { value: "antihistamine", label: "Antihistamine" },
  { value: "vitamin", label: "Vitamin" },
  { value: "supplement", label: "Supplement" },
  { value: "other", label: "Other" },
];

const MEDICATION_UNITS = [
  { value: "mg", label: "mg (milligrams)" },
  { value: "ml", label: "ml (milliliters)" },
  { value: "tablets", label: "tablets" },
  { value: "capsules", label: "capsules" },
  { value: "drops", label: "drops" },
  { value: "sachets", label: "sachets" },
  { value: "teaspoons", label: "teaspoons" },
  { value: "units", label: "units" },
];

export function MedicationsView() {
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Form state
  const [isCreating, setIsCreating] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    generic_name: "",
    category: "",
    unit: "",
    description: "",
  });

  useEffect(() => {
    loadMedications();
  }, []);

  useEffect(() => {
    filterMedications();
  }, [medications, searchTerm, selectedCategory]);

  const loadMedications: () => Promise<void> = async () => {
    const result = await getMedications();
    if (result.success && result.data) {
      setMedications(result.data);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to load medications",
        variant: "destructive",
      });
    }
  };

  const filterMedications = () => {
    let filtered = medications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (med) =>
          med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          med.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          med.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((med) => med.category === selectedCategory);
    }

    setFilteredMedications(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      generic_name: "",
      category: "",
      unit: "",
      description: "",
    });
    setEditingMedication(null);
    setIsCreating(false);
  };

  const handleEdit = (medication: Medication) => {
    setFormData({
      name: medication.name,
      generic_name: medication.generic_name || "",
      category: medication.category || "",
      unit: medication.unit,
      description: medication.description || "",
    });
    setEditingMedication(medication);
    setIsCreating(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.unit.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and unit are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const medicationData = {
        name: formData.name.trim(),
        generic_name: formData.generic_name.trim() || undefined,
        category: formData.category || undefined,
        unit: formData.unit.trim(),
        description: formData.description.trim() || undefined,
      };

      let result;
      if (editingMedication) {
        result = await updateMedication(editingMedication.id, medicationData);
      } else {
        result = await createMedication(medicationData);
      }

      if (result.success) {
        await loadMedications();
        resetForm();
        toast({
          title: "Success",
          description: `Medication ${editingMedication ? "updated" : "created"} successfully`,
        });
      } else {
        toast({
          title: "Error",
          description:
            result.error ||
            `Failed to ${editingMedication ? "update" : "create"} medication`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingMedication ? "update" : "create"} medication`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (medication: Medication) => {
    if (!confirm(`Are you sure you want to delete "${medication.name}"?`)) {
      return;
    }

    const result = await deleteMedication(medication.id);
    if (result.success) {
      await loadMedications();
      toast({
        title: "Success",
        description: "Medication deleted successfully",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete medication",
        variant: "destructive",
      });
    }
  };

  const getCategoryLabel = (category: string | null) => {
    return (
      MEDICATION_CATEGORIES.find((c) => c.value === category)?.label ||
      category ||
      "Uncategorized"
    );
  };

  const getUnitLabel = (unit: string) => {
    return MEDICATION_UNITS.find((u) => u.value === unit)?.label || unit;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medications</h1>
          <p className="text-muted-foreground">
            Manage the medications database for diagnosis prescriptions
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="mr-2 size-4" />
          Add Medication
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingMedication ? "Edit Medication" : "Add New Medication"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    placeholder="Medication name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Generic Name</label>
                  <Input
                    placeholder="Generic name (optional)"
                    value={formData.generic_name}
                    onChange={(e) =>
                      setFormData({ ...formData, generic_name: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDICATION_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Unit *</label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) =>
                      setFormData({ ...formData, unit: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDICATION_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Description (optional)"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    disabled={isSubmitting}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingMedication
                    ? "Update"
                    : "Create"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Medications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {MEDICATION_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Medications ({filteredMedications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMedications.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                {medications.length === 0
                  ? "No medications found. Add your first medication to get started."
                  : "No medications match your current filters."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Generic Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedications.map((medication) => (
                    <TableRow key={medication.id}>
                      <TableCell className="font-medium">
                        {medication.name}
                      </TableCell>
                      <TableCell>{medication.generic_name || "-"}</TableCell>
                      <TableCell>
                        {medication.category ? (
                          <Badge variant="secondary">
                            {getCategoryLabel(medication.category)}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getUnitLabel(medication.unit)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {medication.description || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(medication)}
                            disabled={isCreating}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(medication)}
                            disabled={isCreating}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
