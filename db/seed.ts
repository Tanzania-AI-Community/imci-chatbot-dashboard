import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { users } from "./tables/users";
import { medications } from "./tables/medications";
import { eq } from "drizzle-orm";

// Get the DATABASE_URL from process.env directly for seeding
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in the environment");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const db = drizzle(pool, { schema: { users, medications } });

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function createUser(
  username: string,
  email: string,
  password: string,
  role: "admin" | "editor" | "viewer"
) {
  try {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      console.log(`User ${email} already exists, skipping...`);
      return;
    }

    const hashedPassword = await hashPassword(password);
    await db.insert(users).values({
      username,
      email,
      password_hash: hashedPassword,
      role,
    });
    console.log(`✅ Created ${role} user: ${email}`);
  } catch (error) {
    console.error(`Failed to create user ${email}:`, error);
    throw error;
  }
}

async function seedMedications() {
  console.log("🌱 Seeding medications...");

  const medicationsData = [
    {
      name: "Paracetamol",
      generic_name: "Acetaminophen",
      category: "antipyretic",
      unit: "mg",
      description: "Pain reliever and fever reducer",
    },
    {
      name: "Ibuprofen",
      generic_name: "Ibuprofen",
      category: "analgesic",
      unit: "mg",
      description: "Anti-inflammatory pain reliever",
    },
    {
      name: "Amoxicillin",
      generic_name: "Amoxicillin",
      category: "antibiotic",
      unit: "mg",
      description: "Penicillin antibiotic",
    },
    {
      name: "ORS",
      generic_name: "Oral Rehydration Salts",
      category: "supplement",
      unit: "sachets",
      description: "For dehydration treatment",
    },
    {
      name: "Vitamin A",
      generic_name: "Retinol",
      category: "vitamin",
      unit: "units",
      description: "Essential vitamin for immune function",
    },
    {
      name: "Zinc Sulfate",
      generic_name: "Zinc",
      category: "supplement",
      unit: "mg",
      description: "Mineral supplement for diarrhea treatment",
    },
    {
      name: "Cotrimoxazole",
      generic_name: "Trimethoprim-Sulfamethoxazole",
      category: "antibiotic",
      unit: "mg",
      description: "Antibiotic for bacterial infections",
    },
    {
      name: "Cetirizine",
      generic_name: "Cetirizine",
      category: "antihistamine",
      unit: "mg",
      description: "Antihistamine for allergic reactions",
    },
  ];

  for (const medicationData of medicationsData) {
    try {
      // Check if medication already exists
      const existing = await db.query.medications.findFirst({
        where: eq(medications.name, medicationData.name),
      });

      if (!existing) {
        await db.insert(medications).values(medicationData);
        console.log(`✅ Created medication: ${medicationData.name}`);
      } else {
        console.log(`⏭️  Medication already exists: ${medicationData.name}`);
      }
    } catch (error) {
      console.error(
        `❌ Failed to create medication ${medicationData.name}:`,
        error
      );
    }
  }
}

// This script seeds the database with initial data
async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Create users in parallel
    await Promise.all([
      createUser("admin", "admin@example.com", "admin123", "admin"),
      createUser("editor", "editor@example.com", "editor123", "editor"),
      createUser("viewer", "viewer@example.com", "viewer123", "viewer"),
    ]);

    await seedMedications();

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Fatal error during seeding:", error);
    pool.end().finally(() => process.exit(1));
  });
