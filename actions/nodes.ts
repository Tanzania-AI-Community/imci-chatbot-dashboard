"use server";

import { db } from "@/db";
import { nodes } from "@/db/tables/nodes";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type {
  Node,
  NodeResponse,
  NodeCreateResponse,
  NodeUpdateResponse,
} from "@/types/nodes";

export async function getNodesByFlowVersion(
  flowVersionId: string
): Promise<NodeResponse> {
  try {
    const result = await db.query.nodes.findMany({
      where: eq(nodes.flow_version_id, flowVersionId),
      orderBy: nodes.order,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to fetch nodes:", error);
    return { success: false, error: "Could not fetch nodes." };
  }
}

export async function createNode(
  nodeData: Partial<Node>
): Promise<NodeCreateResponse> {
  try {
    // Ensure required fields are present
    if (!nodeData.node_id || !nodeData.flow_version_id) {
      throw new Error("Missing required fields");
    }

    // Set default values and validate node data
    const validatedNode = {
      node_id: nodeData.node_id,
      type: "question" as const,
      content: {
        text: nodeData.content?.text || "",
        options: Array.isArray(nodeData.content?.options)
          ? nodeData.content.options
          : [],
      },
      order: nodeData.order || 0,
      flow_version_id: nodeData.flow_version_id,
    };

    const result = await db.insert(nodes).values(validatedNode).returning();

    revalidatePath("/dashboard/flows/[flowId]");
    return { success: true, data: result[0] as Node };
  } catch (error) {
    console.error("Failed to create node:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not create node.",
    };
  }
}

export async function updateNode(
  nodeId: string,
  nodeData: Partial<Node>
): Promise<NodeUpdateResponse> {
  try {
    // Validate node data
    if (!nodeData.content?.text) {
      throw new Error("Question text is required");
    }

    const result = await db
      .update(nodes)
      .set({
        node_id: nodeData.node_id,
        content: {
          text: nodeData.content.text,
          options: Array.isArray(nodeData.content.options)
            ? nodeData.content.options
            : [],
        },
        order: nodeData.order,
      })
      .where(eq(nodes.id, nodeId))
      .returning();

    revalidatePath("/dashboard/flows/[flowId]");
    return { success: true, data: result[0] as Node };
  } catch (error) {
    console.error("Failed to update node:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not update node.",
    };
  }
}

export async function deleteNode(nodeId: string) {
  try {
    await db.delete(nodes).where(eq(nodes.id, nodeId));
    revalidatePath("/dashboard/flows/[flowId]");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete node:", error);
    return { success: false, error: "Could not delete node." };
  }
}
