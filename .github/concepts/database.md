# Database Concepts with Drizzle ORM

## Schema Definition

### When to Use

- When defining new database tables
- When modifying existing table structures
- When setting up relationships between tables
- When defining indexes and constraints

### Implementation

```typescript
// ✅ Do - Use schema builder with proper types
import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "editor", "viewer"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ❌ Don't - Use raw SQL for schema definitions
const createTableSQL = `
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE
  )
`;
```

## Migrations and Schema Management

### When to Use

- When you need to update the database schema
- After making changes to table definitions
- When adding new tables or relationships
- Before deploying schema changes to production

### Schema Organization

```typescript
// tables/users.ts, tables/flows.ts, etc.
// Individual table definitions in separate files
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  // ... table columns
});

// db/schema.ts
// Export all tables and their relationships
export * from "./tables/users";
export * from "./tables/flows";
export * from "./tables/global-variables";
// ... other table exports
```

### Migration Workflow

1. Create or update table definitions in `db/tables/`
2. Export them in `db/schema.ts`
3. Generate migrations:

```bash
pnpm db:generate
```

4. Review generated migrations in `drizzle/` directory
5. Apply migrations:

```bash
pnpm db:migrate
```

6. Optional: Seed the database

```bash
pnpm db:seed
```

### Migration Scripts

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push:pg",
    "db:migrate": "dotenv -e .env -- tsx db/migrate.ts",
    "db:seed": "dotenv -e .env -- tsx db/seed.ts",
    "db:studio": "drizzle-kit studio",
    "db:init": "pnpm run db:migrate && pnpm run db:seed"
  }
}
```

### Implementation

## Queries

### When to Use

- When fetching data in server components
- In server actions for data modifications
- In API routes for data operations
- When implementing complex data operations

### Implementation

```typescript
// ✅ Do - Use type-safe queries
export async function getUser(id: number) {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      profile: true,
    },
  });
}

// ❌ Don't - Use raw SQL queries
export async function getUser(id: number) {
  return await sql`SELECT * FROM users WHERE id = ${id}`;
}
```

## Transactions

### When to Use

- When performing multiple related database operations
- When data consistency is critical
- When implementing complex business logic
- When multiple tables need to be updated atomically

### Implementation

```typescript
// ✅ Do - Use transactions for related operations
await db.transaction(async (tx) => {
  const user = await tx.insert(users).values({ name: "John" }).returning();
  await tx.insert(profiles).values({ userId: user.id });
});

// ❌ Don't - Perform related operations without transactions
const user = await db.insert(users).values({ name: "John" }).returning();
await db.insert(profiles).values({ userId: user.id });
```

## Table Definition Pattern

When defining new tables, follow this pattern:

```typescript
// db/tables/example.ts
import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Define enums if needed
export const statusEnum = pgEnum("status", ["active", "inactive"]);

// Define the table
export const example = pgTable("example", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  status: statusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relationships if needed
export const exampleRelations = relations(example, ({ one, many }) => ({
  // Define your relations here
}));

// Types for use in the application
export type Example = typeof example.$inferSelect;
export type NewExample = typeof example.$inferInsert;

// Zod schemas for validation
export const insertExampleSchema = createInsertSchema(example);
export const selectExampleSchema = createSelectSchema(example);

// Export the table for use in schema.ts
export default example;
```

### Key Principles

1. File Organization:

   - One table per file in `db/tables/`
   - Export from `schema.ts`
   - Include types and validation schemas

2. Naming Conventions:

   - Table names: lowercase, plural (e.g., `users`, `posts`)
   - Column names: camelCase in code, snake_case in DB
   - Enum types: camelCase + 'Enum' suffix
   - Relation methods: describe the relationship

3. Best Practices:
   - Always include `id`, `createdAt`, and `updatedAt`
   - Use proper column types and constraints
   - Define foreign key relationships
   - Include Zod validation schemas
   - Document complex columns or relationships
