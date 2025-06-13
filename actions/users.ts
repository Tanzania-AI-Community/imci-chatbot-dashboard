"use server";

import { db } from "@/db";
import { users } from "@/db/tables/users";
import { eq } from "drizzle-orm";

export async function createUser(data: {
  username: string;
  email: string;
  passwordHash: string;
  role?: "admin" | "editor" | "viewer";
}) {
  const createdUser = await db
    .insert(users)
    .values({
      username: data.username,
      email: data.email,
      password_hash: data.passwordHash,
      role: data.role || "editor",
    })
    .returning()
    .execute();
  return createdUser[0];
}

export async function getUserByEmail(email: string) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .execute();
  return user[0];
}

export async function updateUserProfile(
  email: string,
  data: {
    username?: string;
    passwordHash?: string;
    role?: "admin" | "editor" | "viewer";
  }
) {
  await db.update(users).set(data).where(eq(users.email, email)).execute();
}
