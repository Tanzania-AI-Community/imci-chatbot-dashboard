import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { flowVersions } from "./flow-versions";
import { variables } from "./variables";

export const conditions = pgTable("conditions", {
  id: uuid("id").primaryKey().defaultRandom(),
  flow_version_id: uuid("flow_version_id")
    .notNull()
    .references(() => flowVersions.id),
  variable_id: uuid("variable_id")
    .notNull()
    .references(() => variables.id),
  operator: text("operator", {
    enum: [
      "equals",
      "not_equals",
      "greater_than",
      "less_than",
      "greater_than_equals",
      "less_than_equals",
      "contains",
      "not_contains",
    ],
  }).notNull(),
  value: jsonb("value").$type<string | number | boolean | null>().notNull(),
  type: text("type", {
    enum: ["entry", "diagnosis"],
  }).notNull(),
  reference_id: uuid("reference_id"), // references diagnosis.id when type='diagnosis', null when type='entry'
  logical_operator: text("logical_operator", {
    enum: ["AND", "OR"],
  }), // for combining multiple conditions
  group_id: uuid("group_id"), // for grouping conditions together
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Types
export type Condition = typeof conditions.$inferSelect;
export type NewCondition = typeof conditions.$inferInsert;

// Schemas
export const insertConditionSchema = createInsertSchema(conditions);
export const selectConditionSchema = createSelectSchema(conditions);

// Helper types for specific condition types
export type EntryCondition = Condition & { type: "entry" };
export type DiagnosisCondition = Condition & { type: "diagnosis" };
