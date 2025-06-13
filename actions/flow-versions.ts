"use server";

import { db } from "@/db";
import { flowVersions } from "@/db/tables/flow-versions";
import { flows } from "@/db/tables/flows";
import { eq, and, desc } from "drizzle-orm";
import { getSession } from "@/auth";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types/general";
import type { FlowVersion } from "@/db/tables/flow-versions";
import { getNodesByFlowVersion } from "./nodes";
import { getAllVariablesForFlow } from "./variables";
import { getEntryConditionsByFlowVersion } from "./conditions";
import { getDiagnosesByFlowVersion } from "./diagnosis";

export interface FlowVersionWithFlow {
  id: string;
  flow_id: string;
  status: "draft" | "published" | "archived";
  version_number: number;
  entry_conditions: any;
  created_by: string;
  created_at: Date;
  published_at: Date | null;
  published_by: string | null;
  flow_name: string;
}

export async function getFlowVersions(
  flowId: string
): Promise<ActionResponse<FlowVersionWithFlow[]>> {
  try {
    const result = await db
      .select({
        id: flowVersions.id,
        flow_id: flowVersions.flow_id,
        status: flowVersions.status,
        version_number: flowVersions.version_number,
        entry_conditions: flowVersions.entry_conditions,
        created_by: flowVersions.created_by,
        created_at: flowVersions.created_at,
        published_at: flowVersions.published_at,
        published_by: flowVersions.published_by,
        flow_name: flows.name,
      })
      .from(flowVersions)
      .innerJoin(flows, eq(flowVersions.flow_id, flows.id))
      .where(eq(flowVersions.flow_id, flowId))
      .orderBy(flowVersions.version_number);

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to fetch flow versions:", error);
    return { success: false, error: "Could not fetch flow versions." };
  }
}

export async function getAllFlowVersions(): Promise<
  ActionResponse<FlowVersionWithFlow[]>
> {
  try {
    const result = await db
      .select({
        id: flowVersions.id,
        flow_id: flowVersions.flow_id,
        status: flowVersions.status,
        version_number: flowVersions.version_number,
        entry_conditions: flowVersions.entry_conditions,
        created_by: flowVersions.created_by,
        created_at: flowVersions.created_at,
        published_at: flowVersions.published_at,
        published_by: flowVersions.published_by,
        flow_name: flows.name,
      })
      .from(flowVersions)
      .innerJoin(flows, eq(flowVersions.flow_id, flows.id))
      .orderBy(flows.name, flowVersions.version_number);

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to fetch all flow versions:", error);
    return { success: false, error: "Could not fetch flow versions." };
  }
}

export async function createInitialFlowVersion(
  flowId: string
): Promise<ActionResponse<FlowVersionWithFlow>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return {
        success: false,
        error: "You must be signed in to create a flow version",
      };
    }

    const userId = session?.user?.customUser?.id;

    if (!userId) {
      return {
        success: false,
        error: "User ID is missing. Unable to create flow version.",
      };
    }

    // Check if flow exists
    const flowResult = await db
      .select({ name: flows.name })
      .from(flows)
      .where(eq(flows.id, flowId))
      .limit(1);

    if (flowResult.length === 0) {
      return {
        success: false,
        error: "Flow not found",
      };
    }

    // Create the initial version
    const versionResult = await db
      .insert(flowVersions)
      .values({
        flow_id: flowId,
        version_number: 1,
        entry_conditions: {},
        created_by: userId,
      })
      .returning();

    const createdVersion = versionResult[0];

    // Revalidate affected paths
    revalidatePath("/dashboard/flows");
    revalidatePath(`/dashboard/flows/${flowId}`);

    return {
      success: true,
      data: {
        id: createdVersion.id,
        flow_id: createdVersion.flow_id,
        status: createdVersion.status,
        version_number: createdVersion.version_number,
        entry_conditions: createdVersion.entry_conditions,
        created_by: createdVersion.created_by,
        created_at: createdVersion.created_at,
        published_at: createdVersion.published_at,
        published_by: createdVersion.published_by,
        flow_name: flowResult[0].name,
      },
    };
  } catch (error) {
    console.error("Failed to create initial flow version:", error);
    return { success: false, error: "Could not create flow version." };
  }
}

export async function getOrCreateFlowVersion(
  flowId: string
): Promise<ActionResponse<FlowVersionWithFlow>> {
  try {
    // First try to get existing versions
    const versionsResult = await getFlowVersions(flowId);

    if (
      versionsResult.success &&
      versionsResult.data &&
      versionsResult.data.length > 0
    ) {
      // Return the latest version
      const latestVersion = versionsResult.data[versionsResult.data.length - 1];
      return { success: true, data: latestVersion };
    }

    // No versions exist, create an initial one
    return await createInitialFlowVersion(flowId);
  } catch (error) {
    console.error("Failed to get or create flow version:", error);
    return { success: false, error: "Could not get or create flow version." };
  }
}

export async function publishVersion(
  versionId: string
): Promise<ActionResponse<FlowVersion>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return {
        success: false,
        error: "You must be signed in to publish a version",
      };
    }

    const userId = session.user.customUser?.id;

    if (!userId) {
      return {
        success: false,
        error: "User ID is missing. Unable to publish version.",
      };
    }

    // Get the version to publish
    const versionToPublish = await db
      .select()
      .from(flowVersions)
      .where(eq(flowVersions.id, versionId))
      .limit(1);

    if (versionToPublish.length === 0) {
      return {
        success: false,
        error: "Version not found",
      };
    }

    const flowId = versionToPublish[0].flow_id;

    // Find and archive any currently published version
    await db
      .update(flowVersions)
      .set({ status: "archived" })
      .where(
        and(
          eq(flowVersions.flow_id, flowId),
          eq(flowVersions.status, "published")
        )
      );

    // Publish the selected version
    const result = await db
      .update(flowVersions)
      .set({
        status: "published",
        published_at: new Date(),
        published_by: userId,
      })
      .where(eq(flowVersions.id, versionId))
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: "Failed to publish version",
      };
    }

    // Revalidate affected paths
    revalidatePath("/dashboard/flows");
    revalidatePath(`/dashboard/flows/${flowId}`);

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    console.error("Failed to publish version:", error);
    return { success: false, error: "Could not publish version." };
  }
}

export async function createDraftVersion(
  flowId: string
): Promise<ActionResponse<FlowVersion>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return {
        success: false,
        error: "You must be signed in to create a version",
      };
    }

    const userId = session.user.customUser?.id;

    if (!userId) {
      return {
        success: false,
        error: "User ID is missing. Unable to create version.",
      };
    }

    // Get the latest version number
    const latestVersion = await db
      .select({ version_number: flowVersions.version_number })
      .from(flowVersions)
      .where(eq(flowVersions.flow_id, flowId))
      .orderBy(desc(flowVersions.version_number))
      .limit(1);

    const nextVersionNumber =
      latestVersion.length > 0 ? latestVersion[0].version_number + 1 : 1;

    // Create new draft version
    const result = await db
      .insert(flowVersions)
      .values({
        flow_id: flowId,
        version_number: nextVersionNumber,
        status: "draft",
        entry_conditions: {},
        created_by: userId,
      })
      .returning();

    // Revalidate affected paths
    revalidatePath("/dashboard/flows");
    revalidatePath(`/dashboard/flows/${flowId}`);

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    console.error("Failed to create draft version:", error);
    return { success: false, error: "Could not create draft version." };
  }
}

export async function getPublishedVersion(
  flowId: string
): Promise<ActionResponse<FlowVersion | null>> {
  try {
    const result = await db
      .select()
      .from(flowVersions)
      .where(
        and(
          eq(flowVersions.flow_id, flowId),
          eq(flowVersions.status, "published")
        )
      )
      .limit(1);

    return {
      success: true,
      data: result.length > 0 ? result[0] : null,
    };
  } catch (error) {
    console.error("Failed to get published version:", error);
    return { success: false, error: "Could not get published version." };
  }
}

export async function archiveVersion(
  versionId: string
): Promise<ActionResponse<FlowVersion>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return {
        success: false,
        error: "You must be signed in to archive a version",
      };
    }

    // Get the version to archive
    const versionToArchive = await db
      .select()
      .from(flowVersions)
      .where(eq(flowVersions.id, versionId))
      .limit(1);

    if (versionToArchive.length === 0) {
      return {
        success: false,
        error: "Version not found",
      };
    }

    if (versionToArchive[0].status !== "published") {
      return {
        success: false,
        error: "Only published versions can be archived",
      };
    }

    // Archive the version
    const result = await db
      .update(flowVersions)
      .set({ status: "archived" })
      .where(eq(flowVersions.id, versionId))
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: "Failed to archive version",
      };
    }

    // Revalidate affected paths
    revalidatePath("/dashboard/flows");
    revalidatePath(`/dashboard/flows/${versionToArchive[0].flow_id}`);

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    console.error("Failed to archive version:", error);
    return { success: false, error: "Could not archive version." };
  }
}

export async function deleteVersion(
  versionId: string
): Promise<ActionResponse<boolean>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return {
        success: false,
        error: "You must be signed in to delete a version",
      };
    }

    // Get the version to delete
    const versionToDelete = await db
      .select()
      .from(flowVersions)
      .where(eq(flowVersions.id, versionId))
      .limit(1);

    if (versionToDelete.length === 0) {
      return {
        success: false,
        error: "Version not found",
      };
    }

    if (versionToDelete[0].status !== "draft") {
      return {
        success: false,
        error: "Only draft versions can be deleted",
      };
    }

    // Check if this is the only version for the flow
    const flowVersionsCount = await db
      .select({ count: flowVersions.id })
      .from(flowVersions)
      .where(eq(flowVersions.flow_id, versionToDelete[0].flow_id));

    if (flowVersionsCount.length <= 1) {
      return {
        success: false,
        error: "Cannot delete the only version of a flow",
      };
    }

    // Delete the version
    await db.delete(flowVersions).where(eq(flowVersions.id, versionId));

    // Revalidate affected paths
    revalidatePath("/dashboard/flows");
    revalidatePath(`/dashboard/flows/${versionToDelete[0].flow_id}`);

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    console.error("Failed to delete version:", error);
    return { success: false, error: "Could not delete version." };
  }
}

export async function duplicateVersion(
  versionId: string,
  notes?: string
): Promise<ActionResponse<FlowVersion>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return {
        success: false,
        error: "You must be signed in to duplicate a version",
      };
    }

    const userId = session.user.customUser?.id;

    if (!userId) {
      return {
        success: false,
        error: "User ID is missing. Unable to duplicate version.",
      };
    }

    // Get the version to duplicate
    const versionToDuplicate = await db
      .select()
      .from(flowVersions)
      .where(eq(flowVersions.id, versionId))
      .limit(1);

    if (versionToDuplicate.length === 0) {
      return {
        success: false,
        error: "Version not found",
      };
    }

    const sourceVersion = versionToDuplicate[0];

    // Get the latest version number for this flow
    const latestVersion = await db
      .select({ version_number: flowVersions.version_number })
      .from(flowVersions)
      .where(eq(flowVersions.flow_id, sourceVersion.flow_id))
      .orderBy(desc(flowVersions.version_number))
      .limit(1);

    const nextVersionNumber =
      latestVersion.length > 0 ? latestVersion[0].version_number + 1 : 1;

    // Create new draft version with duplicated data
    const result = await db
      .insert(flowVersions)
      .values({
        flow_id: sourceVersion.flow_id,
        version_number: nextVersionNumber,
        status: "draft",
        entry_conditions: sourceVersion.entry_conditions,
        created_by: userId,
      })
      .returning();

    // Revalidate affected paths
    revalidatePath("/dashboard/flows");
    revalidatePath(`/dashboard/flows/${sourceVersion.flow_id}`);

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    console.error("Failed to duplicate version:", error);
    return { success: false, error: "Could not duplicate version." };
  }
}

export async function getAllPublishedFlowVersionsWithData(): Promise<
  ActionResponse<
    Array<{
      version: FlowVersionWithFlow;
      nodes: any[];
      variables: any[];
      conditions: any[];
      diagnoses: any[];
    }>
  >
> {
  try {
    // Get all published flow versions
    const publishedVersionsResult = await db
      .select({
        id: flowVersions.id,
        flow_id: flowVersions.flow_id,
        status: flowVersions.status,
        version_number: flowVersions.version_number,
        entry_conditions: flowVersions.entry_conditions,
        created_by: flowVersions.created_by,
        created_at: flowVersions.created_at,
        published_at: flowVersions.published_at,
        published_by: flowVersions.published_by,
        flow_name: flows.name,
      })
      .from(flowVersions)
      .innerJoin(flows, eq(flowVersions.flow_id, flows.id))
      .where(eq(flowVersions.status, "published"))
      .orderBy(flows.name, flowVersions.version_number);

    if (publishedVersionsResult.length === 0) {
      return { success: true, data: [] };
    }

    // For each published version, get all related data
    const versionsWithData = await Promise.all(
      publishedVersionsResult.map(async (version) => {
        // Get nodes
        const nodesResult = await getNodesByFlowVersion(version.id);
        const nodes = nodesResult.success ? nodesResult.data || [] : [];

        // Get variables
        const variablesResult = await getAllVariablesForFlow(version.id);
        const variables = variablesResult.success
          ? variablesResult.data || []
          : [];

        // Get conditions
        const conditionsResult = await getEntryConditionsByFlowVersion(
          version.id
        );
        const conditions = conditionsResult.success
          ? conditionsResult.data || []
          : [];

        // Get diagnoses with medications and advice
        const diagnosesResult = await getDiagnosesByFlowVersion(version.id);
        const diagnoses = diagnosesResult.success
          ? diagnosesResult.data || []
          : [];

        return {
          version,
          nodes,
          variables,
          conditions,
          diagnoses,
        };
      })
    );

    return { success: true, data: versionsWithData };
  } catch (error) {
    console.error("Failed to fetch published flow versions with data:", error);
    return {
      success: false,
      error: "Could not fetch published flow versions with data.",
    };
  }
}
