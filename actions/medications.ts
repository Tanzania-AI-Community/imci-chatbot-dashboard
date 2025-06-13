"use server";

import { db } from "@/db";
import { medications } from "@/db/tables/medications";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Validation schemas
const medicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  generic_name: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
  description: z.string().optional(),
});

export type MedicationFormData = z.infer<typeof medicationSchema>;

// Get all medications
export async function getMedications() {
  try {
    const result = await db.query.medications.findMany({
      orderBy: (medications, { asc }) => [asc(medications.name)],
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching medications:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch medications",
    };
  }
}

// Get medication by ID
export async function getMedicationById(id: string) {
  try {
    const result = await db.query.medications.findFirst({
      where: eq(medications.id, id),
    });

    if (!result) {
      return {
        success: false,
        error: "Medication not found",
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching medication:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch medication",
    };
  }
}

// Create new medication
export async function createMedication(data: MedicationFormData) {
  try {
    const validated = medicationSchema.parse(data);

    const result = await db.insert(medications).values(validated).returning();

    revalidatePath("/dashboard/medications");
    revalidatePath("/dashboard/flows");

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    console.error("Error creating medication:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create medication",
    };
  }
}

// Update medication
export async function updateMedication(id: string, data: MedicationFormData) {
  try {
    const validated = medicationSchema.parse(data);

    const result = await db
      .update(medications)
      .set(validated)
      .where(eq(medications.id, id))
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: "Medication not found",
      };
    }

    revalidatePath("/dashboard/medications");
    revalidatePath("/dashboard/flows");

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    console.error("Error updating medication:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update medication",
    };
  }
}

// Delete medication
export async function deleteMedication(id: string) {
  try {
    const result = await db
      .delete(medications)
      .where(eq(medications.id, id))
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: "Medication not found",
      };
    }

    revalidatePath("/dashboard/medications");
    revalidatePath("/dashboard/flows");

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    console.error("Error deleting medication:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete medication",
    };
  }
}

// Get all medication categories
export async function getMedicationCategories() {
  try {
    const result = await db
      .selectDistinct({ category: medications.category })
      .from(medications);

    return {
      success: true,
      data: result.map((r) => r.category).filter(Boolean),
    };
  } catch (error) {
    console.error("Error fetching medication categories:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch categories",
    };
  }
}

// Get medications by category
export async function getMedicationsByCategory(category: string) {
  try {
    const result = await db.query.medications.findMany({
      where: eq(medications.category, category),
      orderBy: (medications, { asc }) => [asc(medications.name)],
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching medications by category:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch medications",
    };
  }
}
