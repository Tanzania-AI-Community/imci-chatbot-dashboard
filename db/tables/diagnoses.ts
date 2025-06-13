import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { flowVersions } from "./flow-versions";

export const diagnoses = pgTable("diagnoses", {
  id: uuid("id").primaryKey().defaultRandom(),
  flow_version_id: uuid("flow_version_id")
    .notNull()
    .references(() => flowVersions.id),
  name: text("name").notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Types
export type Diagnosis = typeof diagnoses.$inferSelect;
export type NewDiagnosis = typeof diagnoses.$inferInsert;

// Schemas
export const insertDiagnosisSchema = createInsertSchema(diagnoses);
export const selectDiagnosisSchema = createSelectSchema(diagnoses);
