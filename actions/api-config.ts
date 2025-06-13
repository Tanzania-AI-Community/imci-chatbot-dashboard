"use server";

import { db } from "@/db";
import { apiConfig } from "@/db/tables/api-config";
import { revalidatePath } from "next/cache";
import { env } from "@/env.mjs";
import { and, eq } from "drizzle-orm";
import { encryptApiKey, decryptApiKey } from "@/lib/api-auth";

export interface ApiConfigData {
  apiKey: string;
  baseUrl: string;
}

type ApiConfigResult =
  | {
      success: true;
      data: ApiConfigData;
    }
  | {
      success: false;
      error: string;
    };

export async function getApiConfig(): Promise<ApiConfigResult> {
  try {
    const result = await db.query.apiConfig.findFirst({
      where: eq(apiConfig.id, "main"),
    });

    const baseUrl = env.API_BASE_URL;
    let decryptedApiKey = "";

    if (result?.apiKey) {
      try {
        decryptedApiKey = decryptApiKey(result.apiKey);
      } catch (error) {
        console.error("Failed to decrypt API key:", error);
        // Return empty string if decryption fails
        decryptedApiKey = "";
      }
    }

    return {
      success: true,
      data: {
        apiKey: decryptedApiKey,
        baseUrl,
      },
    };
  } catch (error) {
    console.error("Failed to fetch API config:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch API config",
    };
  }
}

export async function updateApiConfig(data: { apiKey: string }) {
  try {
    const encryptedApiKey = encryptApiKey(data.apiKey);

    await db
      .insert(apiConfig)
      .values({
        id: "main",
        apiKey: encryptedApiKey,
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: apiConfig.id,
        set: {
          apiKey: encryptedApiKey,
          updatedAt: new Date().toISOString(),
        },
      });

    revalidatePath("/dashboard/config/api");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to update API config:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update API config",
    };
  }
}

export async function getEncryptedApiKey(): Promise<string | null> {
  try {
    const result = await db.query.apiConfig.findFirst({
      where: eq(apiConfig.id, "main"),
    });

    return result?.apiKey || null;
  } catch (error) {
    console.error("Failed to fetch encrypted API key:", error);
    return null;
  }
}
