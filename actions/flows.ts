"use server";

import { db } from "@/db";
import { flows } from "@/db/tables/flows";
import { flowVersions } from "@/db/tables/flow-versions";
import { desc, count } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { getSession } from "@/auth";
import { Flow } from "@/types/flows";
import { revalidatePath } from "next/cache";

export interface FlowWithMetadata {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  created_at: Date;
  updated_at: Date;
  versions_count: number;
}

export async function getAllFlowsWithMetadata() {
  try {
    const results = await db
      .select({
        id: flows.id,
        name: flows.name,
        description: flows.description,
        status: flows.status,
        created_at: flows.created_at,
        updated_at: flows.updated_at,
        versions_count: count(flowVersions.id).as("versions_count"),
      })
      .from(flows)
      .leftJoin(flowVersions, eq(flowVersions.flow_id, flows.id))
      .groupBy(flows.id)
      .orderBy(desc(flows.updated_at));

    return { success: true, data: results };
  } catch (error) {
    console.error("Failed to fetch flows:", error);
    return { success: false, error: "Could not fetch flows." };
  }
}

interface CreateFlowInput {
  name: string;
  description: string;
}

export async function createFlow(input: CreateFlowInput) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return {
        success: false,
        error: "You must be signed in to create a flow",
      };
    }

    const userId = session?.user?.customUser?.id;

    if (!userId) {
      return {
        success: false,
        error: "User ID is missing. Unable to create flow.",
      };
    }

    // Use a transaction to create both flow and initial version
    const result = await db.transaction(async (tx) => {
      // Create the flow
      const flowResult = await tx
        .insert(flows)
        .values({
          name: input.name,
          description: input.description,
          created_by: userId,
          status: "draft",
        })
        .returning();

      const createdFlow = flowResult[0];

      // Create the initial version
      const versionResult = await tx
        .insert(flowVersions)
        .values({
          flow_id: createdFlow.id,
          version_number: 1,
          entry_conditions: {},
          created_by: userId,
        })
        .returning();

      return {
        flow: createdFlow,
        version: versionResult[0],
      };
    });

    return {
      success: true,
      data: {
        ...result.flow,
        latestVersionId: result.version.id,
      },
    };
  } catch (error) {
    console.error("Failed to create flow:", error);
    return { success: false, error: "Could not create flow." };
  }
}

export async function getFlowById(id: string) {
  try {
    const results = await db
      .select({
        id: flows.id,
        name: flows.name,
        description: flows.description,
        status: flows.status,
        created_at: flows.created_at,
        updated_at: flows.updated_at,
        created_by: flows.created_by,
        versions_count: count(flowVersions.id).as("versions_count"),
      })
      .from(flows)
      .leftJoin(flowVersions, eq(flowVersions.flow_id, flows.id))
      .where(eq(flows.id, id))
      .groupBy(flows.id);

    const flow = results[0];
    if (!flow) {
      return { success: false, error: "Flow not found" };
    }

    return { success: true, data: flow };
  } catch (error) {
    console.error("Failed to fetch flow:", error);
    return { success: false, error: "Could not fetch flow." };
  }
}

export async function updateFlowDetails(
  flowId: string,
  data: { name: string; description?: string }
) {
  return await db
    .update(flows)
    .set({
      name: data.name,
      description: data.description ?? "",
      updated_at: new Date(),
    })
    .where(eq(flows.id, flowId));
}

export async function getFlows() {
  try {
    const results = await db.select().from(flows);
    return { success: true, data: results };
  } catch (error) {
    console.error("Failed to fetch flows:", error);
    return { success: false, error: "Could not fetch flows." };
  }
}

export async function updateFlow(flowId: string, data: Partial<Flow>) {
  try {
    // Convert null description to empty string to match database schema
    const sanitizedData = {
      ...data,
      description: data.description ?? "",
    };

    const result = await db
      .update(flows)
      .set(sanitizedData)
      .where(eq(flows.id, flowId))
      .returning();

    revalidatePath("/dashboard/flows/[flowId]");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Failed to update flow:", error);
    return { success: false, error: "Could not update flow." };
  }
}

export async function publishFlow(flowId: string) {
  try {
    const result = await db
      .update(flows)
      .set({ status: "published" })
      .where(eq(flows.id, flowId))
      .returning();

    revalidatePath("/dashboard/flows/[flowId]");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Failed to publish flow:", error);
    return { success: false, error: "Could not publish flow." };
  }
}
