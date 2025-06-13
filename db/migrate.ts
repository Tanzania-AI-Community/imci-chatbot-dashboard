import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

// Get the DATABASE_URL from process.env directly for migrations
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in the environment");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const db = drizzle(pool);

async function runMigration(retryCount = 0) {
  try {
    console.log("Migration started...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);

    if (retryCount < 3) {
      console.log(`Retrying migration (attempt ${retryCount + 1}/3)...`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      return runMigration(retryCount + 1);
    } else {
      throw error;
    }
  }
}

async function main() {
  try {
    await runMigration();
  } catch (error) {
    console.error("Migration failed after all retries:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
