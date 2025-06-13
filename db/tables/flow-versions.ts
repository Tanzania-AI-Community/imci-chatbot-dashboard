import {
  pgTable,
  uuid,
  integer,
  jsonb,
  timestamp,
  text,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { flows } from "./flows";

export const flowVersions = pgTable("flow_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  flow_id: uuid("flow_id")
    .notNull()
    .references(() => flows.id),
  version_number: integer("version_number").notNull(),
  entry_conditions: jsonb("entry_conditions").notNull(),
  created_by: uuid("created_by")
    .notNull()
    .references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  status: text("status", { enum: ["draft", "published", "archived"] })
    .notNull()
    .default("draft"),
  published_at: timestamp("published_at"),
  published_by: uuid("published_by").references(() => users.id),
});

// Relations
export const flowVersionsRelations = relations(flowVersions, ({ one }) => ({
  flow: one(flows, {
    fields: [flowVersions.flow_id],
    references: [flows.id],
  }),
  creator: one(users, {
    fields: [flowVersions.created_by],
    references: [users.id],
  }),
}));

// Types
export type FlowVersion = typeof flowVersions.$inferSelect;
export type NewFlowVersion = typeof flowVersions.$inferInsert;

// Schemas
export const insertFlowVersionSchema = createInsertSchema(flowVersions);
export const selectFlowVersionSchema = createSelectSchema(flowVersions);
