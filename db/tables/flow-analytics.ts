import { pgTable, uuid, timestamp, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { flows } from "./flows";
import { flowVersions } from "./flow-versions";
import { users } from "./users";

// Flow Analytics table - tracks usage statistics for flows
export const flowAnalytics = pgTable("flow_analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  flow_id: uuid("flow_id")
    .notNull()
    .references(() => flows.id),
  flow_version_id: uuid("flow_version_id").references(() => flowVersions.id),
  session_id: text("session_id").notNull(), // Unique session identifier for tracking
  user_id: uuid("user_id").references(() => users.id),
  started_at: timestamp("started_at").defaultNow().notNull(),
  completed_at: timestamp("completed_at"), // null if session not completed
  is_finalized: integer("is_finalized").default(0).notNull(), // 0 = not finalized, 1 = finalized
  finalized_at: timestamp("finalized_at"), // when the flow session was finalized
  total_nodes_visited: integer("total_nodes_visited").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const flowAnalyticsRelations = relations(flowAnalytics, ({ one }) => ({
  flow: one(flows, {
    fields: [flowAnalytics.flow_id],
    references: [flows.id],
  }),
  flowVersion: one(flowVersions, {
    fields: [flowAnalytics.flow_version_id],
    references: [flowVersions.id],
  }),
  user: one(users, {
    fields: [flowAnalytics.user_id],
    references: [users.id],
  }),
}));

// Types
export type FlowAnalytics = typeof flowAnalytics.$inferSelect;
export type NewFlowAnalytics = typeof flowAnalytics.$inferInsert;

// Schemas
export const insertFlowAnalyticsSchema = createInsertSchema(flowAnalytics);
export const selectFlowAnalyticsSchema = createSelectSchema(flowAnalytics);
