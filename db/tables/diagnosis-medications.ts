import { pgTable, uuid, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { diagnoses } from "./diagnoses";
import { medications } from "./medications";

export const diagnosisMedications = pgTable("diagnosis_medications", {
  id: uuid("id").primaryKey().defaultRandom(),
  diagnosis_id: uuid("diagnosis_id")
    .notNull()
    .references(() => diagnoses.id),
  medication_id: uuid("medication_id")
    .notNull()
    .references(() => medications.id),
  dosage: text("dosage").notNull(), // "500mg twice daily"
  duration: text("duration"), // "for 7 days"
  instructions: text("instructions"), // extra info
  order_index: integer("order_index").notNull().default(0), // for ordering
});

// Types
export type DiagnosisMedication = typeof diagnosisMedications.$inferSelect;
export type NewDiagnosisMedication = typeof diagnosisMedications.$inferInsert;

// Schemas
export const insertDiagnosisMedicationSchema =
  createInsertSchema(diagnosisMedications);
export const selectDiagnosisMedicationSchema =
  createSelectSchema(diagnosisMedications);
