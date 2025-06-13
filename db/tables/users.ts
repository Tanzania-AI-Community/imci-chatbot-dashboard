import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Define role enum type
export const userRoleEnum = pgEnum("user_role", ["admin", "editor", "viewer"]);

// Define users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("editor"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  image: text("image"),
  provider: text("provider"),
});

// Define types for this table
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Create Zod schemas for use with forms and validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// Create a separate schema with additional validations
export const userFormSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password_hash: z.string().min(8),
  role: z.enum(["admin", "editor", "viewer"]).default("editor"),
});
