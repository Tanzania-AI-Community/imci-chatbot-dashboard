# IMCI Dashboard Core Concepts and Best Practices

## Next.js 15 Specific Considerations

### Breaking Changes and Important Features

1. Cookie Handling:

   - Use `Response.cookies` API instead of deprecated `cookies()` from `next/headers`
   - Always chain cookie operations with response objects

   ```typescript
   // ❌ Don't use
   const cookieStore = cookies();
   cookieStore.set("key", "value");

   // ✅ Do use
   const response = NextResponse.json({ success: true });
   response.cookies.set("key", "value");
   ```

2. Server Actions:

   - Server actions are now stable and preferred over API routes for form submissions
   - Use `use server` directive at the top of server action files
   - Return structured responses: `{ success: true, data?: T, error?: string }`

3. Route Handlers:
   - Use the new route handler format with HTTP methods as named exports
   - Always return Response objects
   ```typescript
   export async function GET() {
     return Response.json({ data: "hello" });
   }
   ```

### Common Pitfalls to Avoid

1. State Management:

   - Don't mix server and client state
   - Use `useState` for local UI state only
   - Use Zustand for complex global state
   - Server state should be managed through server actions

2. Data Fetching:

   - Prefer Server Components for data fetching
   - Use `cache()` for static data
   - Use `revalidatePath()` for dynamic updates
   - Don't fetch data in client components unless necessary

3. Component Architecture:
   - Keep components focused and single-purpose
   - Use composition over inheritance
   - Avoid prop drilling with context or state management
   - Split UI and logic concerns

## Database Management with Drizzle ORM

1. Schema Updates:

   ```typescript
   // ✅ Do use schema builder
   export const users = pgTable("users", {
     id: serial("id").primaryKey(),
     name: text("name").notNull(),
     role: text("role", { enum: ["admin", "editor", "viewer"] }).notNull(),
   });

   // ❌ Don't use raw SQL for schema changes
   ```

2. Migrations:
   - Always use Drizzle's migration tools
   - Keep migrations versioned and atomic
   - Test migrations in development first

## Security Best Practices

1. Authentication:

   - Use secure session management
   - Implement proper CSRF protection
   - Use HTTP-only cookies
   - Implement rate limiting

2. Authorization:
   - Implement role-based access control (RBAC)
   - Check permissions at both API and UI levels
   - Use middleware for route protection

## Performance Optimization

1. Component Loading:

   - Use dynamic imports for large components
   - Implement proper loading states
   - Use Suspense boundaries effectively

2. Image Optimization:
   - Always use Next.js Image component
   - Implement proper image sizes
   - Use responsive images

## Error Handling

1. Global Error Handling:

   - Implement error boundaries
   - Use structured error responses
   - Log errors properly

2. Form Validation:
   - Use Zod for schema validation
   - Implement both client and server validation
   - Show clear error messages

## Testing Strategy

1. Unit Tests:

   - Test individual components
   - Test utility functions
   - Use proper mocking

2. Integration Tests:

   - Test component interactions
   - Test data flow
   - Test user workflows

3. E2E Tests:
   - Test critical user paths
   - Test error scenarios
   - Test performance metrics

## Development Workflow

1. Code Quality:

   - Use ESLint and Prettier
   - Follow TypeScript strict mode
   - Use proper type annotations

2. Git Workflow:

   - Use feature branches
   - Write meaningful commit messages
   - Review code before merging

3. Documentation:
   - Document component APIs
   - Document configuration options
   - Keep documentation up to date
