import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";

async function createUser() {
  const hashedPassword = await bcrypt.hash("admin123", 12);

  try {
    const [user] = await db
      .insert(users)
      .values({
        username: "admin",
        email: "admin@example.com",
        password_hash: hashedPassword,
        role: "admin",
      })
      .returning();

    console.log("Created user:", {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Failed to create user:", error);
  }

  process.exit(0);
}

createUser();
