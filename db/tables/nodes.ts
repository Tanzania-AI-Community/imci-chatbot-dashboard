import { pgTable, uuid, text, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { flowVersions } from "./flow-versions";

export const nodes = pgTable("nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  flow_version_id: uuid("flow_version_id")
    .notNull()
    .references(() => flowVersions.id),
  node_id: text("node_id").notNull(),
  type: text("type", {
    enum: ["question"],
  })
    .notNull()
    .default("question"),
  content: jsonb("content").notNull().$type<{
    text: string;
    options: Array<{
      text: string;
      variables?: Array<{
        id: string;
        value: string | number | boolean;
      }>;
    }>;
  }>(),
  order: integer("order").notNull(),
});

// Types
export type Node = typeof nodes.$inferSelect;
export type NewNode = typeof nodes.$inferInsert;

// Schemas
export const insertNodeSchema = createInsertSchema(nodes);
export const selectNodeSchema = createSelectSchema(nodes);
