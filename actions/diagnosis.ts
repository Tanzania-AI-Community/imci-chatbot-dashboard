"use server";

import { db } from "@/db";
import {
  diagnoses,
  medications,
  diagnosisMedications,
  diagnosisAdvice,
  conditions,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type {
  NewDiagnosis,
  NewDiagnosisMedication,
  NewDiagnosisAdvice,
  Diagnosis,
} from "@/db/schema";

// Types for the response
interface DiagnosisWithDetails extends Diagnosis {
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

// Diagnosis CRUD
export async function getDiagnosesByFlowVersion(flowVersionId: string) {
  try {
    // First, get all diagnoses for this version
    const diagnosesList = await db
      .select()
      .from(diagnoses)
      .where(eq(diagnoses.flow_version_id, flowVersionId))
      .orderBy(diagnoses.created_at);

    // Then get all details in parallel for better performance
    const diagnosesWithDetails = await Promise.all(
      diagnosesList.map(async (diagnosis): Promise<DiagnosisWithDetails> => {
        // Get diagnosis-specific conditions
        const diagnosisConditions = await db
          .select({
            id: conditions.id,
            type: conditions.type,
            variable_id: conditions.variable_id,
            flow_version_id: conditions.flow_version_id,
            operator: conditions.operator,
            value: conditions.value,
            reference_id: conditions.reference_id,
            logical_operator: conditions.logical_operator,
            group_id: conditions.group_id,
            created_at: conditions.created_at,
          })
          .from(conditions)
          .where(
            and(
              eq(conditions.type, "diagnosis"),
              eq(conditions.reference_id, diagnosis.id)
            )
          )
          .then((conditions) =>
            conditions.filter(
              (c): c is Extract<typeof c, { type: "diagnosis" }> =>
                c.type === "diagnosis"
            )
          );

        // Get medications with medication names
        const diagnosisMedicationsList = await db
          .select({
            id: diagnosisMedications.id,
            diagnosis_id: diagnosisMedications.diagnosis_id,
            medication_id: diagnosisMedications.medication_id,
            dosage: diagnosisMedications.dosage,
            duration: diagnosisMedications.duration,
            instructions: diagnosisMedications.instructions,
            order_index: diagnosisMedications.order_index,
            medication: {
              name: medications.name,
            },
          })
          .from(diagnosisMedications)
          .where(eq(diagnosisMedications.diagnosis_id, diagnosis.id))
          .leftJoin(
            medications,
            eq(diagnosisMedications.medication_id, medications.id)
          )
          .orderBy(diagnosisMedications.order_index)
          .then((meds) =>
            meds.filter(
              (
                med
              ): med is (typeof meds)[0] & { medication: { name: string } } =>
                med.medication?.name != null
            )
          );

        // Get advice for this diagnosis
        const diagnosisAdviceList = await db
          .select({
            id: diagnosisAdvice.id,
            diagnosis_id: diagnosisAdvice.diagnosis_id,
            advice_text: diagnosisAdvice.advice_text,
            priority: diagnosisAdvice.priority,
            category: diagnosisAdvice.category,
          })
          .from(diagnosisAdvice)
          .where(eq(diagnosisAdvice.diagnosis_id, diagnosis.id))
          .orderBy(diagnosisAdvice.priority)
          .then((advice) =>
            advice.map((a) => ({
              ...a,
              category: a.category ?? undefined,
            }))
          );

        return {
          ...diagnosis,
          conditions: diagnosisConditions,
          medications: diagnosisMedicationsList,
          advice: diagnosisAdviceList,
        };
      })
    );

    return {
      success: true,
      data: diagnosesWithDetails,
    };
  } catch (error) {
    console.error("Failed to fetch diagnoses:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch diagnoses",
    };
  }
}

export async function createDiagnosis(data: NewDiagnosis) {
  try {
    const [diagnosis] = await db
      .insert(diagnoses)
      .values({
        ...data,
        updated_at: new Date(),
      })
      .returning();

    revalidatePath("/dashboard/flows");

    return {
      success: true,
      data: diagnosis,
    };
  } catch (error) {
    console.error("Failed to create diagnosis:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create diagnosis",
    };
  }
}

export async function updateDiagnosis(id: string, data: Partial<NewDiagnosis>) {
  try {
    const [diagnosis] = await db
      .update(diagnoses)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(diagnoses.id, id))
      .returning();

    revalidatePath("/dashboard/flows");

    return {
      success: true,
      data: diagnosis,
    };
  } catch (error) {
    console.error("Failed to update diagnosis:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update diagnosis",
    };
  }
}

export async function deleteDiagnosis(id: string) {
  try {
    // Delete related data first
    await db
      .delete(diagnosisMedications)
      .where(eq(diagnosisMedications.diagnosis_id, id));
    await db
      .delete(diagnosisAdvice)
      .where(eq(diagnosisAdvice.diagnosis_id, id));

    const [diagnosis] = await db
      .delete(diagnoses)
      .where(eq(diagnoses.id, id))
      .returning();

    revalidatePath("/dashboard/flows");

    return {
      success: true,
      data: diagnosis,
    };
  } catch (error) {
    console.error("Failed to delete diagnosis:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete diagnosis",
    };
  }
}

// Medication management
export async function getAllMedications() {
  try {
    const result = await db
      .select()
      .from(medications)
      .orderBy(medications.name);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Failed to fetch medications:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch medications",
    };
  }
}

// Diagnosis medications
export async function getDiagnosisMedications(diagnosisId: string) {
  try {
    const result = await db
      .select({
        id: diagnosisMedications.id,
        diagnosis_id: diagnosisMedications.diagnosis_id,
        medication_id: diagnosisMedications.medication_id,
        dosage: diagnosisMedications.dosage,
        duration: diagnosisMedications.duration,
        instructions: diagnosisMedications.instructions,
        order_index: diagnosisMedications.order_index,
        medication_name: medications.name,
        medication_unit: medications.unit,
        medication_generic_name: medications.generic_name,
      })
      .from(diagnosisMedications)
      .leftJoin(
        medications,
        eq(diagnosisMedications.medication_id, medications.id)
      )
      .where(eq(diagnosisMedications.diagnosis_id, diagnosisId))
      .orderBy(diagnosisMedications.order_index);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Failed to fetch diagnosis medications:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch diagnosis medications",
    };
  }
}

export async function createDiagnosisMedication(data: NewDiagnosisMedication) {
  try {
    const [medication] = await db
      .insert(diagnosisMedications)
      .values(data)
      .returning();

    revalidatePath("/dashboard/flows");

    return {
      success: true,
      data: medication,
    };
  } catch (error) {
    console.error("Failed to create diagnosis medication:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create diagnosis medication",
    };
  }
}

export async function deleteDiagnosisMedication(id: string) {
  try {
    const [medication] = await db
      .delete(diagnosisMedications)
      .where(eq(diagnosisMedications.id, id))
      .returning();

    revalidatePath("/dashboard/flows");

    return {
      success: true,
      data: medication,
    };
  } catch (error) {
    console.error("Failed to delete diagnosis medication:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete diagnosis medication",
    };
  }
}

// Diagnosis advice
export async function getDiagnosisAdvice(diagnosisId: string) {
  try {
    const result = await db
      .select()
      .from(diagnosisAdvice)
      .where(eq(diagnosisAdvice.diagnosis_id, diagnosisId))
      .orderBy(diagnosisAdvice.priority);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Failed to fetch diagnosis advice:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch diagnosis advice",
    };
  }
}

export async function createDiagnosisAdvice(data: NewDiagnosisAdvice) {
  try {
    const [advice] = await db.insert(diagnosisAdvice).values(data).returning();

    revalidatePath("/dashboard/flows");

    return {
      success: true,
      data: advice,
    };
  } catch (error) {
    console.error("Failed to create diagnosis advice:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create diagnosis advice",
    };
  }
}

export async function deleteDiagnosisAdvice(id: string) {
  try {
    const [advice] = await db
      .delete(diagnosisAdvice)
      .where(eq(diagnosisAdvice.id, id))
      .returning();

    revalidatePath("/dashboard/flows");

    return {
      success: true,
      data: advice,
    };
  } catch (error) {
    console.error("Failed to delete diagnosis advice:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete diagnosis advice",
    };
  }
}
