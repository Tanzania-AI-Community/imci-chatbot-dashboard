import { pgEnum } from "drizzle-orm/pg-core";

// Flow Status Enum
export const flowStatusEnum = pgEnum("flow_status", [
  "draft",
  "published",
  "archived",
]);

// Variable Type Enum
export const variableTypeEnum = pgEnum("variable_type", [
  "string",
  "number",
  "boolean",
]);

// Variable Category Enum
export const variableCategoryEnum = pgEnum("variable_category", [
  "patient",
  "system",
  "custom",
]);
