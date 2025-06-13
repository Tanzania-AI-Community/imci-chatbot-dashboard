"use server";

import { db } from "@/db";
import { flowAnalytics } from "@/db/tables/flow-analytics";
import { flows } from "@/db/tables/flows";

// Seed some sample analytics data for testing
export async function seedAnalyticsData() {
  try {
    // Get existing flows
    const existingFlows = await db
      .select({ id: flows.id })
      .from(flows)
      .limit(5);

    if (existingFlows.length === 0) {
      console.log("No flows found to seed analytics data");
      return;
    }

    const sampleData = [];

    for (const flow of existingFlows) {
      // Create some sample sessions for each flow
      const sessionCount = Math.floor(Math.random() * 10) + 5; // 5-15 sessions per flow

      for (let i = 0; i < sessionCount; i++) {
        const startedAt = new Date();
        startedAt.setDate(startedAt.getDate() - Math.floor(Math.random() * 30)); // Last 30 days

        const isCompleted = Math.random() > 0.3; // 70% completion rate
        const isFinalized = isCompleted && Math.random() > 0.4; // 60% of completed sessions are finalized

        const completedAt = isCompleted
          ? new Date(startedAt.getTime() + Math.random() * 3600000)
          : null; // Within 1 hour
        const finalizedAt = isFinalized ? completedAt : null;

        sampleData.push({
          flow_id: flow.id,
          session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          started_at: startedAt,
          completed_at: completedAt,
          is_finalized: isFinalized ? 1 : 0,
          finalized_at: finalizedAt,
          total_nodes_visited: Math.floor(Math.random() * 15) + 3, // 3-18 nodes
        });
      }
    }

    // Insert the sample data
    await db.insert(flowAnalytics).values(sampleData);

    console.log(`Seeded ${sampleData.length} analytics records`);
    return { success: true, count: sampleData.length };
  } catch (error) {
    console.error("Failed to seed analytics data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
