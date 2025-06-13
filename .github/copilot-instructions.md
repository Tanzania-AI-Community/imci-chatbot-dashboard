# IMCI Dashboard Project Patterns

We use Next.js 15 with TypeScript for an Integrated Management of Childhood Illness (IMCI) dashboard, featuring shadcn/ui components and Tailwind CSS for styling. The application uses Drizzle ORM with a Postgres database for data management.

> **Important**: This project uses Next.js 15. Reference the following concept files based on your current task:
>
> ### Reference `routing.md` when:
>
> - Building new API endpoints or route handlers
> - Working with cookies or authentication
> - Deciding between server/client components
> - Setting up middleware or protected routes
> - Implementing data fetching in components
>
> ### Reference `state-management.md` when:
>
> - Setting up global state with Zustand
> - Managing form state or UI interactions
> - Implementing feature-specific state with Context
> - Sharing state between components
> - Building complex state workflows
>
> ### Reference `database.md` when:
>
> - Creating or modifying database schemas
> - Writing queries with Drizzle ORM
> - Setting up database migrations
> - Implementing data relationships
> - Working with transactions

## Technical Stack Details

- Next.js 15 (App Router)
- TypeScript 5.x (Strict Mode)
- Tailwind CSS
- shadcn/ui
- Drizzle ORM
- PostgreSQL
- Zustand for State Management
- t3-env for Type-safe Environment Variables

## Required Development Tools

- Node.js >= 18.17
- pnpm (preferred package manager)
- PostgreSQL >= 15

### Data Fetching Pattern

In this project, we follow React Server Components best practices by keeping data fetching on the server. Here's our pattern:

1. Page Components (Server):

   ```typescript
   // app/some-route/page.tsx
   export default async function Page() {
     // Fetch data on the server
     const data = await fetchData();
     return <ClientComponent initialData={data} />;
   }
   ```

2. Layout Components (Server):

   ```typescript
   // components/layout/some-layout.tsx
   export function Layout({ data, children }) {
     return (
       <div>
         <DataDisplay data={data} />
         {children}
       </div>
     );
   }
   ```

3. Client Components:

   ```typescript
   // components/some-client-component.tsx
   "use client";

   interface Props {
     data: Data; // Data fetched from server
   }

   export function ClientComponent({ data }: Props) {
     // No need to maintain local state for server-fetched data
     // Server actions will trigger revalidation automatically
     return (
       <div>
         <DataDisplay data={data} />
         <Button onClick={() => updateData()}>Update</Button>
       </div>
     );
   }
   ```

Key principles:

- Pages and layouts fetch initial data
- Client components are pure UI with props
- Server actions handle mutations and trigger revalidation
- No duplicate state management needed
- Next.js handles cache invalidation automatically

Key Features:

- Flow Management: Create and manage IMCI diagnosis flows
- User Management: Role-based access control (admin, editor, viewer)
- Version Control: Track and manage flow versions
- Dynamic Rules Engine: Configure diagnosis rules and conditions

## Naming Conventions

1. Files and Components:

   The pattern we follow is:

   ```
   components/
   ├── flow/                          # Folder: kebab-case
   │   ├── flow-editor.tsx           # File: kebab-case
   │   └── flow-preview.tsx          # File: kebab-case
   ├── diagnosis/                     # Folder: kebab-case
   │   └── diagnosis-rules.tsx       # File: kebab-case
   └── ui/                           # Common components
       └── button.tsx                # File: kebab-case

   // While components inside use PascalCase
   export function DataTable() { ... }
   export function DataTablePagination() { ... }
   export function Button() { ... }
   ```

   The rules are:

   - Component Files: kebab-case (e.g., `button.tsx` contains `Button` component)
   - Component Names: PascalCase (e.g., `export function Button`)
   - Component Folders: kebab-case (e.g., `data-table/`, `customer-properties/`)
   - Utility Files: kebab-case (e.g., `date-utils.ts`)
   - Hook Files: camelCase prefixed with 'use' (e.g., `useCustomHook.ts`)
   - Test Files: Same name as file being tested with `.test` suffix

2. Components:

   - Component names: PascalCase
   - Props interfaces: Suffix with 'Props' (e.g., `interface TableProps`)
   - Event handlers: Prefix with 'handle' (e.g., `handleClick`)

3. Variables:
   - Boolean variables: Prefix with 'is', 'has', 'should' (e.g., `isLoading`)
   - Arrays: Plural nouns (e.g., `items`, `users`)
   - Event handlers: Prefix with 'on' (e.g., `onClick`)

## Project Structure

```
app/                    # Next.js app router pages
├── dashboard/         # Dashboard routes
│   ├── config/       # Configuration pages
│   ├── settings/     # Settings pages
│   └── versions/     # Version management
├── auth/             # Authentication routes
└── api/              # API routes

actions/               # Server actions
  ├── {domain}.ts     # Domain-specific server actions

components/            # React components
├── {domain}/         # Domain-specific components
│  ├── index.ts      # Public exports
│  └── internal/     # Internal components
└── ui/              # Shared UI components
   └── {component}/  # Component with variants

hooks/                # Custom hooks
├── use-{feature}.ts # Feature-specific hooks
└── use-{utility}.ts # Utility hooks

lib/                  # Utilities and helpers
├── utils/           # General utilities
└── {domain}/        # Domain-specific utilities

types/                # TypeScript types
├── {domain}.ts      # Domain models
└── index.ts         # Common types

contexts/             # React contexts
└── {domain}-context.tsx   # Context providers

store/               # State management
└── use{Domain}Store.ts   # Zustand stores
```

## Core Patterns

### Server Actions

Server actions must be marked with 'use server' directive and follow the standard response format:

```typescript
"use server";

import { db } from "@/db";
import { flows } from "@/lib/schema";
import { revalidatePath } from "next/cache";

export async function actionName(params: ParamType): Promise<ResponseType> {
  try {
    const result = await db.query.flows.findMany({
      where: eq(flows.id, params.id),
      with: {
        versions: true,
      },
    });

    // Revalidate affected paths after data changes
    revalidatePath("/dashboard/flows");

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

### API Routes

All API routes must use the new Next.js 15 route handlers format:

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Always validate input
    const schema = z.object({
      // ... schema definition
    });

    const validated = schema.parse(body);

    // Important: In Next.js 15, cookies() returns a Promise
    const cookieStore = await cookies();

    // Set cookies through response
    const response = NextResponse.json({ success: true });
    response.cookies.set("key", "value", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
```

> **Note**: In Next.js 15, the `cookies()` function from 'next/headers' returns a Promise and must be awaited:
>
> ```typescript
> // ❌ Wrong - will cause TypeScript errors
> const cookieStore = cookies();
> const token = cookieStore.get("auth-token");
>
> // ✅ Correct - await the Promise
> const cookieStore = await cookies();
> const token = cookieStore.get("auth-token");
> ```

### Page Structure

```typescript
interface PageProps {
  params: { flowId?: string };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}
```

## Key Conventions

- Dashboard routes: `dashboard/*`
- Structured API responses: `{ success, data, error }`
- Global state: React Context with custom hooks
- UI Design: Mobile-first with Tailwind CSS

## File Organization Principles

1. Component Organization:

   - One component per file
   - Index files for public exports
   - Internal components in `internal/` subfolder
   - Shared UI components in `components/ui/`

2. Code Organization:

   - Import order: React, Next.js, third-party, project modules
   - Group related functionality in domain folders
   - Keep files focused and single-purpose
   - Use index files for clean public APIs

3. Styles Organization:

   - Use Tailwind CSS utility classes
   - Component-specific styles via cn utility
   - Theme variables in tailwind.config.ts
   - Maintain mobile-first approach

4. State Management:
   - Local state with useState/useReducer
   - Global state with Zustand stores
   - Context for feature-specific state
   - Props for component-specific state

### Environment Variables

All environment variables must be accessed through our type-safe `env` object:

```typescript
// ✅ Do - Use type-safe env
import { env } from "@/env.mjs";

const isProduction = env.NODE_ENV === "production";
const databaseUrl = env.DATABASE_URL;

// ❌ Don't - Use process.env directly
const isProduction = process.env.NODE_ENV === "production"; // No type safety!
const databaseUrl = process.env.DATABASE_URL; // Could be undefined!
```

Key principles:

- Always import from `@/env.mjs`
- Never use `process.env` directly
- All env vars are validated at startup
- Server-side vars are not exposed to the client
- Client-side vars must be prefixed with `NEXT_PUBLIC_`

## Database Management

### Schema Organization

Database schemas are organized in the following structure:

```
db/
├── tables/           # Individual table definitions
│   ├── users.ts
│   ├── flows.ts
│   └── global-variables.ts
├── index.ts         # Database connection and configuration
├── schema.ts        # Exports all table definitions
├── migrate.ts       # Migration runner
└── seed.ts         # Seeding logic
```

### Migration Workflow

When making database changes:

1. Create/modify table definitions in `db/tables/`
2. Export new tables in `db/schema.ts`
3. Run migration scripts:

```bash
# Generate migration files
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Optional: Seed the database
pnpm db:seed

# Or run both migrate and seed
pnpm db:init
```

### Database Scripts

- `db:generate`: Generate new migration files
- `db:push`: Push schema changes directly (development only)
- `db:migrate`: Run pending migrations
- `db:seed`: Seed the database with initial data
- `db:studio`: Open Drizzle Studio for database management
- `db:init`: Run migrations and seed the database

### Form Implementation

Required patterns for all forms:

```tsx
export function MyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitForm();
      toast.success("Changes saved");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form>
      <Input disabled={isSubmitting} />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
```

Key requirements:

- Track submission state with `isSubmitting`
- Disable controls during submission
- Show loading indicators
- Use try/catch with finally
- Validate before submit

### Toast Notifications

Use Sonner for consistent user feedback:

```tsx
import { toast } from "sonner";

// Basic toasts
toast.success("Created successfully");
toast.error("Failed to save");

// Async operations
toast.promise(saveData(), {
  loading: "Saving...",
  success: "Saved",
  error: "Failed",
});

// With action
toast("Confirm delete?", {
  action: {
    label: "Delete",
    onClick: handleDelete,
  },
});
```

Requirements:

- Success: Concise, positive messages
- Error: Clear message with resolution steps
- Loading: Use promise for async tasks
- Actions: For undoable operations
