import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "@/env.mjs";

// For migrations
export const migrationClient = postgres(env.DATABASE_URL);

// For query building
export const db = drizzle(postgres(env.DATABASE_URL), { schema });

// Export schema for convenience
export { schema };
