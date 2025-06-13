import { pgTable, uuid, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { diagnoses } from "./diagnoses";

export const diagnosisAdvice = pgTable("diagnosis_advice", {
  id: uuid("id").primaryKey().defaultRandom(),
  diagnosis_id: uuid("diagnosis_id")
    .notNull()
    .references(() => diagnoses.id),
  advice_text: text("advice_text").notNull(),
  priority: integer("priority").notNull().default(0), // for ordering
  category: text("category", {
    enum: ["warning", "instruction", "follow-up", "general"],
  }), // optional categorization
});

// Types
export type DiagnosisAdvice = typeof diagnosisAdvice.$inferSelect;
export type NewDiagnosisAdvice = typeof diagnosisAdvice.$inferInsert;

// Schemas
export const insertDiagnosisAdviceSchema = createInsertSchema(diagnosisAdvice);
export const selectDiagnosisAdviceSchema = createSelectSchema(diagnosisAdvice);
