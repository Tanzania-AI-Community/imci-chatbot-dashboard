"use server";

import { variables } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/auth";
import {
  VariableResponse,
  VariableUpdateInput,
  VariableUpdateResponse,
} from "@/types/variables";

export async function getGlobalVariables(): Promise<VariableResponse> {
  try {
    const data = await db
      .select()
      .from(variables)
      .where(eq(variables.is_global, true));
    return { success: true, data };
  } catch (err) {
    console.error("getGlobalVariables error:", err);
    return { success: false, error: "Unable to fetch variables" };
  }
}

export async function getVariablesByFlowVersion(
  flowVersionId: string
): Promise<VariableResponse> {
  try {
    const data = await db
      .select()
      .from(variables)
      .where(eq(variables.flow_version_id, flowVersionId));
    return { success: true, data };
  } catch (err) {
    console.error("getVariablesByFlowVersion error:", err);
    return { success: false, error: "Unable to fetch flow variables" };
  }
}

export async function getAllVariablesForFlow(
  flowVersionId?: string
): Promise<VariableResponse> {
  try {
    let data;
    if (flowVersionId) {
      // Get global variables and flow-specific variables
      data = await db
        .select()
        .from(variables)
        .where(
          sql`${variables.is_global} = true OR ${variables.flow_version_id} = ${flowVersionId}`
        );
    } else {
      // Get only global variables
      data = await db
        .select()
        .from(variables)
        .where(eq(variables.is_global, true));
    }
    return { success: true, data };
  } catch (err) {
    console.error("getAllVariablesForFlow error:", err);
    return { success: false, error: "Unable to fetch variables" };
  }
}

export async function updateGlobalVariables(
  data: (VariableUpdateInput & { isNew?: boolean })[]
): Promise<VariableUpdateResponse> {
  try {
    // Get the current session
    const session = await getSession();
    console.log("Current session:", session);

    const userId = session?.user?.customUser?.id;

    if (!userId) {
      console.error("No user ID found in session");
      return { success: false, error: "Authentication required" };
    }

    console.log("Processing variable update with user:", userId);

    for (const variable of data) {
      if (!variable.variable_id || !variable.name) {
        console.error("Missing required fields for variable:", variable);
        return { success: false, error: "Missing required fields" };
      }

      if (variable.isNew) {
        console.log("Creating new variable:", {
          ...variable,
          created_by: userId,
        });

        // Check for duplicate variable_id
        const existing = await db.query.variables.findFirst({
          where: eq(variables.variable_id, variable.variable_id),
        });

        if (existing) {
          console.error("Variable ID already exists:", variable.variable_id);
          return {
            success: false,
            error: `Variable ID '${variable.variable_id}' already exists`,
          };
        }

        // Create new variable with user ID
        await db.insert(variables).values({
          id: variable.id,
          variable_id: variable.variable_id,
          name: variable.name,
          description: variable.description || "",
          type: variable.type || "string",
          default_value: variable.default_value || "",
          is_global: variable.is_global ?? true,
          flow_version_id: variable.is_global ? null : variable.flow_version_id,
          category: variable.category || "system",
          required: variable.required ?? false,
          created_by: userId,
          created_at: new Date(),
          updated_at: new Date(),
        });

        console.log("Variable created successfully");
      } else {
        console.log("Updating existing variable:", variable.id);

        // Verify the variable exists before updating
        const existingVariable = await db.query.variables.findFirst({
          where: eq(variables.id, variable.id),
        });

        if (!existingVariable) {
          console.error("Variable not found for update:", variable.id);
          return { success: false, error: "Variable not found" };
        }

        // Only update the allowed fields
        const updateData = {
          name: variable.name,
          description: variable.description ?? "",
          default_value: variable.default_value ?? "",
          category: variable.category,
          required: variable.required ?? false,
          is_global: variable.is_global ?? true,
          flow_version_id: variable.is_global ? null : variable.flow_version_id,
          updated_at: new Date(),
        };

        // Update existing variable
        await db
          .update(variables)
          .set(updateData)
          .where(eq(variables.id, variable.id));

        console.log("Variable updated successfully");
      }
    }

    // Revalidate the variables page after update
    revalidatePath("/dashboard/config/variables");
    return { success: true };
  } catch (err) {
    console.error("updateGlobalVariables error:", {
      error: err,
      message: err instanceof Error ? err.message : "Unknown error",
      stack: err instanceof Error ? err.stack : undefined,
    });

    return {
      success: false,
      error:
        err instanceof Error
          ? `Operation failed: ${err.message}`
          : "Operation failed: Unknown error",
    };
  }
}
