import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users";
import { flowVersions } from "./flow-versions";
import { variableTypeEnum, variableCategoryEnum } from "./enums";

export const variables = pgTable("variables", {
  id: uuid("id").primaryKey().defaultRandom(),
  variable_id: varchar("variable_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: variableTypeEnum("type").notNull(),
  default_value: text("default_value").notNull(),
  is_global: boolean("is_global").notNull().default(false),
  flow_version_id: uuid("flow_version_id").references(() => flowVersions.id),
  category: variableCategoryEnum("category").notNull(),
  required: boolean("required").notNull().default(false),
  created_by: uuid("created_by")
    .notNull()
    .references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Types
export type Variable = typeof variables.$inferSelect;
export type NewVariable = typeof variables.$inferInsert;

// Schemas
export const insertVariableSchema = createInsertSchema(variables);
export const selectVariableSchema = createSelectSchema(variables);
