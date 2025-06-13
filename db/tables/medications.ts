import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const medications = pgTable("medications", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  generic_name: text("generic_name"),
  category: text("category"),
  unit: text("unit").notNull(), // mg, ml, tablets, etc.
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Types
export type Medication = typeof medications.$inferSelect;
export type NewMedication = typeof medications.$inferInsert;

// Schemas
export const insertMedicationSchema = createInsertSchema(medications);
export const selectMedicationSchema = createSelectSchema(medications);
