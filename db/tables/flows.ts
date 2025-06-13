import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { flowStatusEnum } from "./enums";
import { flowVersions } from "./flow-versions";

// Flow table
export const flows = pgTable("flows", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: flowStatusEnum("status").notNull().default("draft"),
  created_by: uuid("created_by")
    .notNull()
    .references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const flowsRelations = relations(flows, ({ one, many }) => ({
  creator: one(users, {
    fields: [flows.created_by],
    references: [users.id],
  }),
  versions: many(flowVersions),
}));

// Types
export type Flow = typeof flows.$inferSelect;
export type NewFlow = typeof flows.$inferInsert;

// Schemas
export const insertFlowSchema = createInsertSchema(flows);
export const selectFlowSchema = createSelectSchema(flows);
