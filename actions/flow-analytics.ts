"use server";

import { db } from "@/db";
import { flowAnalytics } from "@/db/tables/flow-analytics";
import { flows } from "@/db/tables/flows";
import { flowVersions } from "@/db/tables/flow-versions";
import { eq, and, sql, desc, asc } from "drizzle-orm";
import type { ActionResponse } from "@/types/general";

// Analytics summary for a specific flow
export interface FlowAnalyticsSummary {
  flow_id: string;
  flow_name: string;
  total_sessions: number;
  completed_sessions: number;
  finalized_sessions: number;
  completion_rate: number;
  finalization_rate: number;
  last_used: Date | null;
  last_finalized: Date | null;
  average_nodes_visited: number;
}

// Get analytics summary for a specific flow
export async function getFlowAnalytics(
  flowId: string
): Promise<ActionResponse<FlowAnalyticsSummary>> {
  try {
    const result = await db
      .select({
        flow_id: flows.id,
        flow_name: flows.name,
        total_sessions: sql<number>`count(${flowAnalytics.id})`.as(
          "total_sessions"
        ),
        completed_sessions:
          sql<number>`count(case when ${flowAnalytics.completed_at} is not null then 1 end)`.as(
            "completed_sessions"
          ),
        finalized_sessions:
          sql<number>`count(case when ${flowAnalytics.is_finalized} = 1 then 1 end)`.as(
            "finalized_sessions"
          ),
        last_used: sql<Date | null>`max(${flowAnalytics.started_at})`.as(
          "last_used"
        ),
        last_finalized: sql<Date | null>`max(${flowAnalytics.finalized_at})`.as(
          "last_finalized"
        ),
        average_nodes_visited:
          sql<number>`avg(${flowAnalytics.total_nodes_visited})`.as(
            "average_nodes_visited"
          ),
      })
      .from(flows)
      .leftJoin(flowAnalytics, eq(flowAnalytics.flow_id, flows.id))
      .where(eq(flows.id, flowId))
      .groupBy(flows.id, flows.name);

    const data = result[0];
    if (!data) {
      return { success: false, error: "Flow not found" };
    }

    const analytics: FlowAnalyticsSummary = {
      ...data,
      completion_rate:
        data.total_sessions > 0
          ? (data.completed_sessions / data.total_sessions) * 100
          : 0,
      finalization_rate:
        data.total_sessions > 0
          ? (data.finalized_sessions / data.total_sessions) * 100
          : 0,
      average_nodes_visited: Math.round(data.average_nodes_visited || 0),
    };

    return { success: true, data: analytics };
  } catch (error) {
    console.error("Failed to fetch flow analytics:", error);
    return { success: false, error: "Could not fetch flow analytics." };
  }
}

// Get analytics for all flows
export async function getAllFlowsAnalytics(): Promise<
  ActionResponse<FlowAnalyticsSummary[]>
> {
  try {
    const result = await db
      .select({
        flow_id: flows.id,
        flow_name: flows.name,
        total_sessions: sql<number>`coalesce(count(${flowAnalytics.id}), 0)`.as(
          "total_sessions"
        ),
        completed_sessions:
          sql<number>`coalesce(count(case when ${flowAnalytics.completed_at} is not null then 1 end), 0)`.as(
            "completed_sessions"
          ),
        finalized_sessions:
          sql<number>`coalesce(count(case when ${flowAnalytics.is_finalized} = 1 then 1 end), 0)`.as(
            "finalized_sessions"
          ),
        last_used: sql<Date | null>`max(${flowAnalytics.started_at})`.as(
          "last_used"
        ),
        last_finalized: sql<Date | null>`max(${flowAnalytics.finalized_at})`.as(
          "last_finalized"
        ),
        average_nodes_visited:
          sql<number>`coalesce(avg(${flowAnalytics.total_nodes_visited}), 0)`.as(
            "average_nodes_visited"
          ),
      })
      .from(flows)
      .leftJoin(flowAnalytics, eq(flowAnalytics.flow_id, flows.id))
      .groupBy(flows.id, flows.name)
      .orderBy(desc(sql`max(${flowAnalytics.started_at})`));

    const analytics: FlowAnalyticsSummary[] = result.map((data) => ({
      ...data,
      completion_rate:
        data.total_sessions > 0
          ? (data.completed_sessions / data.total_sessions) * 100
          : 0,
      finalization_rate:
        data.total_sessions > 0
          ? (data.finalized_sessions / data.total_sessions) * 100
          : 0,
      average_nodes_visited: Math.round(data.average_nodes_visited || 0),
    }));

    return { success: true, data: analytics };
  } catch (error) {
    console.error("Failed to fetch all flows analytics:", error);
    return { success: false, error: "Could not fetch flows analytics." };
  }
}

// Get recent sessions for a flow
export interface FlowSession {
  id: string;
  session_id: string;
  started_at: Date;
  completed_at: Date | null;
  is_finalized: boolean;
  finalized_at: Date | null;
  total_nodes_visited: number;
  duration_minutes: number | null;
}

export async function getFlowRecentSessions(
  flowId: string,
  limit: number = 20
): Promise<ActionResponse<FlowSession[]>> {
  try {
    const result = await db
      .select({
        id: flowAnalytics.id,
        session_id: flowAnalytics.session_id,
        started_at: flowAnalytics.started_at,
        completed_at: flowAnalytics.completed_at,
        is_finalized: flowAnalytics.is_finalized,
        finalized_at: flowAnalytics.finalized_at,
        total_nodes_visited: flowAnalytics.total_nodes_visited,
        duration_minutes: sql<
          number | null
        >`case when ${flowAnalytics.completed_at} is not null then extract(epoch from (${flowAnalytics.completed_at} - ${flowAnalytics.started_at})) / 60 else null end`.as(
          "duration_minutes"
        ),
      })
      .from(flowAnalytics)
      .where(eq(flowAnalytics.flow_id, flowId))
      .orderBy(desc(flowAnalytics.started_at))
      .limit(limit);

    const sessions: FlowSession[] = result.map((row) => ({
      ...row,
      is_finalized: row.is_finalized === 1,
      duration_minutes: row.duration_minutes
        ? Math.round(row.duration_minutes)
        : null,
    }));

    return { success: true, data: sessions };
  } catch (error) {
    console.error("Failed to fetch flow sessions:", error);
    return { success: false, error: "Could not fetch flow sessions." };
  }
}

// Track a new flow session
export async function trackFlowSession(
  flowId: string,
  flowVersionId?: string,
  sessionId?: string,
  userId?: string
): Promise<ActionResponse<string>> {
  try {
    const sessionIdentifier =
      sessionId ||
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(flowAnalytics).values({
      flow_id: flowId,
      flow_version_id: flowVersionId || null,
      session_id: sessionIdentifier,
      user_id: userId || null,
      started_at: new Date(),
    });

    return { success: true, data: sessionIdentifier };
  } catch (error) {
    console.error("Failed to track flow session:", error);
    return { success: false, error: "Could not track flow session." };
  }
}

// Update session completion
export async function completeFlowSession(
  sessionId: string
): Promise<ActionResponse<boolean>> {
  try {
    await db
      .update(flowAnalytics)
      .set({ completed_at: new Date() })
      .where(eq(flowAnalytics.session_id, sessionId));

    return { success: true, data: true };
  } catch (error) {
    console.error("Failed to complete flow session:", error);
    return { success: false, error: "Could not complete flow session." };
  }
}

// Update session finalization
export async function finalizeFlowSession(
  sessionId: string
): Promise<ActionResponse<boolean>> {
  try {
    await db
      .update(flowAnalytics)
      .set({
        is_finalized: 1,
        finalized_at: new Date(),
        completed_at: new Date(), // Ensure completed_at is also set
      })
      .where(eq(flowAnalytics.session_id, sessionId));

    return { success: true, data: true };
  } catch (error) {
    console.error("Failed to finalize flow session:", error);
    return { success: false, error: "Could not finalize flow session." };
  }
}

// Update nodes visited count
export async function updateSessionNodesVisited(
  sessionId: string,
  nodesCount: number
): Promise<ActionResponse<boolean>> {
  try {
    await db
      .update(flowAnalytics)
      .set({ total_nodes_visited: nodesCount })
      .where(eq(flowAnalytics.session_id, sessionId));

    return { success: true, data: true };
  } catch (error) {
    console.error("Failed to update session nodes visited:", error);
    return { success: false, error: "Could not update session nodes visited." };
  }
}
