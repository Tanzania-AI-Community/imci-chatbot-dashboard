import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { flowVersions } from "./flow-versions";

export const advice = pgTable("advice", {
  id: uuid("id").primaryKey().defaultRandom(),
  flow_version_id: uuid("flow_version_id")
    .notNull()
    .references(() => flowVersions.id),
  node_id: text("node_id").notNull(),
  content: jsonb("content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Types
export type Advice = typeof advice.$inferSelect;
export type NewAdvice = typeof advice.$inferInsert;

// Schemas
export const insertAdviceSchema = createInsertSchema(advice);
export const selectAdviceSchema = createSelectSchema(advice);

// Content validation schema
export const adviceContentSchema = z.object({
  advice_text: z.string(),
  next_steps: z.array(z.string()).optional(),
});
