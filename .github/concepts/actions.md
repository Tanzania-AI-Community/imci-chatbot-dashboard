# API Actions Guide

## Server Action Structure

```typescript
// actions/flows.ts
import { db } from "@/db";
import { flows } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getFlow(flowId: string): Promise<ResponseType<Flow>> {
  try {
    const result = await db.query.flows.findFirst({
      where: eq(flows.id, flowId),
      with: {
        versions: true,
      },
    });

    if (!result) {
      return { success: false, error: "Flow not found" };
    }

    // Revalidate related paths
    revalidatePath(`/dashboard/flows/${flowId}`);

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to fetch flow:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Operation failed",
    };
  }
}
```

## Response Types

```typescript
interface ResponseType<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Flow {
  id: string;
  name: string;
  description?: string;
  version: number;
  isPublished: boolean;
  publishedVersion?: number;
  status: "draft" | "published" | "archived";
  entryConditions: any;
  nodes: any[];
  variables: Record<string, any>;
  medicationConfig: any;
  advice: any[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Cache Revalidation Strategy

Always revalidate affected paths when data changes:

```typescript
// After creating/updating a flow
revalidatePath("/dashboard/flows");
revalidatePath(`/dashboard/flows/${flowId}`);

// After updating global config
revalidatePath("/dashboard/config");

// After version changes
revalidatePath(`/dashboard/flows/${flowId}/versions`);
```

## Error Handling

Always use structured error handling and return consistent response types:

```typescript
try {
  // Database operations
} catch (error) {
  console.error("Operation failed:", error);

  // Ensure error is always a string in the response
  const errorMessage =
    error instanceof Error ? error.message : "Operation failed";

  return { success: false, error: errorMessage };
}
```

## Type Safety

Use Drizzle's type inference and Zod validation:

```typescript
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

// Create Zod schema from Drizzle table
const FlowInsertSchema = createInsertSchema(flows);

// Validate input data
const result = FlowInsertSchema.safeParse(inputData);
if (!result.success) {
  return { success: false, error: "Invalid flow data" };
}
```
