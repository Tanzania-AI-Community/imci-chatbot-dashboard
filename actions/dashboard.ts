"use server";

import { db } from "@/db";
import { users } from "@/db/tables/users";
import { flows } from "@/db/tables/flows";
import { variables } from "@/db/tables/variables";
import { flowAnalytics } from "@/db/tables/flow-analytics";
import { sql } from "drizzle-orm";
import type { ActionResponse } from "@/types/general";

export async function getDashboardStats(): Promise<
  ActionResponse<{
    userCount: number;
    flowCount: number;
    variableCount: number;
    totalSessions: number;
    totalFinalizedSessions: number;
    lastUpdatedFlow: { title: string; updated_at: Date } | null;
  }>
> {
  try {
    // Get user count
    const userCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    const userCount = userCountResult[0]?.count || 0;

    // Get flow count
    const flowCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(flows);
    const flowCount = flowCountResult[0]?.count || 0;

    // Get variable count
    const variableCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(variables)
      .where(sql`${variables.is_global} = true`);
    const variableCount = variableCountResult[0]?.count || 0;

    // Get total sessions count
    const totalSessionsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(flowAnalytics);
    const totalSessions = totalSessionsResult[0]?.count || 0;

    // Get finalized sessions count
    const finalizedSessionsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(flowAnalytics)
      .where(sql`${flowAnalytics.is_finalized} = 1`);
    const totalFinalizedSessions = finalizedSessionsResult[0]?.count || 0;

    // Get last updated flow
    const lastUpdatedFlows = await db.query.flows.findMany({
      orderBy: (flows, { desc }) => [desc(flows.updated_at)],
      limit: 1,
    });

    const lastUpdatedFlow = lastUpdatedFlows.length
      ? {
          title: lastUpdatedFlows[0].name,
          updated_at: lastUpdatedFlows[0].updated_at,
        }
      : null;

    return {
      success: true,
      data: {
        userCount,
        flowCount,
        variableCount,
        totalSessions,
        totalFinalizedSessions,
        lastUpdatedFlow,
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
