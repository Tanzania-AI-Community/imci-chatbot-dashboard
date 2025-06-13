# Next.js 15 Routing Concepts

## Route Handlers

### When to Use

- For building API endpoints that need to handle HTTP methods (GET, POST, etc.)
- When you need to handle cookies or headers directly
- For external API integrations that require server-side processing

### Implementation

```typescript
// ✅ Do - Use named exports for HTTP methods
export async function GET(request: Request) {
  return Response.json({ data: "hello" });
}

// ❌ Don't - Use default exports
export default function handler(req, res) {
  res.json({ data: "hello" });
}
```

### Common Patterns

1. Cookie Management:

```typescript
// ✅ Do - Use Response.cookies API with type-safe env
import { env } from "@/env.mjs";

const response = NextResponse.json({ success: true });
response.cookies.set("key", "value", {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
});

// ❌ Don't - Use deprecated cookies() API or process.env directly
const cookies = cookies();
cookies.set("key", "value");
```

2. Error Handling:

```typescript
// ✅ Do - Use structured error responses
try {
  // ... logic
} catch (error) {
  return NextResponse.json(
    { error: "Descriptive error message" },
    { status: 400 }
  );
}
```

## Server Components

### When to Use

- For data fetching directly from the database
- When rendering static or dynamic content that doesn't need interactivity
- For components that don't need client-side state

### Implementation

```typescript
// ✅ Do - Use async components for data fetching
async function ProductList() {
  const products = await fetchProducts()
  return <div>{/* render products */}</div>
}

// ❌ Don't - Use useEffect for server-side data fetching
function ProductList() {
  useEffect(() => {
    fetchProducts()
  }, [])
}
```

## Client Components

### When to Use

- When you need interactivity (onClick, onChange, etc.)
- For components that use browser APIs
- When using hooks (useState, useEffect, etc.)

### Implementation

```typescript
// ✅ Do - Mark client components with "use client"
"use client";

export function InteractiveForm() {
  const [value, setValue] = useState("");
  // ... rest of component
}
```
