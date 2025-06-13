import { pgTable, text } from "drizzle-orm/pg-core";

export const apiConfig = pgTable("api_config", {
  id: text("id").primaryKey(), // Using 'main' as the only record ID
  apiKey: text("api_key"), // API key for authentication
  updatedAt: text("updated_at"), // Last update timestamp
});
