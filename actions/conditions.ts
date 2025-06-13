"use server";

import { db } from "@/db";
import { conditions, variables } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { NewCondition } from "@/db/tables/conditions";
import { VariableResponse } from "@/types/variables";

// Entry Conditions Functions
export async function getEntryConditionsByFlowVersion(flowVersionId: string) {
  try {
    const entryConditions = await db
      .select({
        id: conditions.id,
        flow_version_id: conditions.flow_version_id,
        variable_id: conditions.variable_id,
        operator: conditions.operator,
        value: conditions.value,
        type: conditions.type,
        logical_operator: conditions.logical_operator,
        group_id: conditions.group_id,
        created_at: conditions.created_at,
        variable_name: variables.name,
      })
      .from(conditions)
      .leftJoin(variables, eq(conditions.variable_id, variables.id))
      .where(
        and(
          eq(conditions.flow_version_id, flowVersionId),
          eq(conditions.type, "entry")
        )
      );

    return {
      success: true,
      data: entryConditions,
    };
  } catch (error) {
    console.error("Failed to fetch entry conditions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch entry conditions",
    };
  }
}

export async function createEntryCondition(
  data: Omit<NewCondition, "type" | "reference_id">
) {
  try {
    // Try to parse the value as JSON if it's a string
    let parsedValue: string | number | boolean | null = data.value;
    if (typeof data.value === "string") {
      // Try to convert to number if possible
      const numberValue = Number(data.value);
      if (!isNaN(numberValue)) {
        parsedValue = numberValue;
      } else if (data.value.toLowerCase() === "true") {
        parsedValue = true;
      } else if (data.value.toLowerCase() === "false") {
        parsedValue = false;
      }
      // Otherwise keep it as string
    }

    const [condition] = await db
      .insert(conditions)
      .values({
        ...data,
        value: parsedValue,
        type: "entry",
        reference_id: null,
      })
      .returning();

    revalidatePath("/dashboard/flows");

    return {
      success: true,
      data: condition,
    };
  } catch (error) {
    console.error("Failed to create entry condition:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create entry condition",
    };
  }
}

export async function deleteEntryCondition(id: string) {
  try {
    const [condition] = await db
      .delete(conditions)
      .where(and(eq(conditions.id, id), eq(conditions.type, "entry")))
      .returning();

    if (condition) {
      revalidatePath(`/dashboard/flows/${condition.flow_version_id}`);
    }

    return {
      success: true,
      data: condition,
    };
  } catch (error) {
    console.error("Failed to delete entry condition:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete entry condition",
    };
  }
}

// Diagnosis Conditions Functions
export async function getDiagnosisConditionsByDiagnosis(diagnosisId: string) {
  try {
    const diagnosisConditions = await db
      .select({
        id: conditions.id,
        flow_version_id: conditions.flow_version_id,
        variable_id: conditions.variable_id,
        operator: conditions.operator,
        value: conditions.value,
        type: conditions.type,
        reference_id: conditions.reference_id,
        logical_operator: conditions.logical_operator,
        group_id: conditions.group_id,
        created_at: conditions.created_at,
        variable_name: variables.name,
      })
      .from(conditions)
      .leftJoin(variables, eq(conditions.variable_id, variables.id))
      .where(
        and(
          eq(conditions.reference_id, diagnosisId),
          eq(conditions.type, "diagnosis")
        )
      );

    return {
      success: true,
      data: diagnosisConditions,
    };
  } catch (error) {
    console.error("Failed to fetch diagnosis conditions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch diagnosis conditions",
    };
  }
}

export async function createDiagnosisCondition(
  data: Omit<NewCondition, "type"> & { reference_id: string }
) {
  try {
    // Try to parse the value as JSON if it's a string
    let parsedValue: string | number | boolean | null = data.value;
    if (typeof data.value === "string") {
      // Try to convert to number if possible
      const numberValue = Number(data.value);
      if (!isNaN(numberValue)) {
        parsedValue = numberValue;
      } else if (data.value.toLowerCase() === "true") {
        parsedValue = true;
      } else if (data.value.toLowerCase() === "false") {
        parsedValue = false;
      }
      // Otherwise keep it as string
    }

    const [condition] = await db
      .insert(conditions)
      .values({
        ...data,
        value: parsedValue,
        type: "diagnosis",
      })
      .returning();

    revalidatePath("/dashboard/flows");

    return {
      success: true,
      data: condition,
    };
  } catch (error) {
    console.error("Failed to create diagnosis condition:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create diagnosis condition",
    };
  }
}

export async function deleteDiagnosisCondition(id: string) {
  try {
    const [condition] = await db
      .delete(conditions)
      .where(and(eq(conditions.id, id), eq(conditions.type, "diagnosis")))
      .returning();

    if (condition) {
      revalidatePath(`/dashboard/flows`);
    }

    return {
      success: true,
      data: condition,
    };
  } catch (error) {
    console.error("Failed to delete diagnosis condition:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete diagnosis condition",
    };
  }
}

// Shared Functions
export async function getGlobalVariablesForConditions(): Promise<VariableResponse> {
  try {
    const globalVars = await db
      .select()
      .from(variables)
      .where(eq(variables.is_global, true));

    console.log("Fetched global variables:", globalVars);

    return {
      success: true,
      data: globalVars,
    };
  } catch (error) {
    console.error("Failed to fetch global variables:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch global variables",
    };
  }
}
