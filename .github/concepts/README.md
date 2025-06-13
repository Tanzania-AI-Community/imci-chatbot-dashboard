# IMCI Dashboard Concepts Guide

This guide helps you understand when to use specific concepts and patterns in the IMCI Dashboard project.

## Quick Reference

### Routing (`routing.md`)

Reference this when:

- Building new API endpoints
- Implementing cookie-based authentication
- Working with server vs client components
- Handling HTTP requests and responses
- Managing server-side data fetching

### State Management (`state-management.md`)

Reference this when:

- Managing global application state
- Implementing feature-specific state
- Working with forms and UI state
- Sharing state between components
- Implementing complex state logic

### Database Operations (`database.md`)

Reference this when:

- Defining new database tables
- Modifying database schema
- Writing database queries
- Implementing transactions
- Setting up relationships between tables

## Common Use Cases

### Authentication Flow

1. Reference `routing.md` for:

   - Setting up auth API routes
   - Managing cookies and sessions
   - Implementing protected routes

2. Reference `state-management.md` for:
   - Managing auth state globally
   - Implementing login/logout UI

### Flow Management

1. Reference `database.md` for:

   - Storing flow definitions
   - Managing flow versions
   - Implementing flow queries

2. Reference `state-management.md` for:
   - Managing flow editor state
   - Handling flow preview state
   - Managing user interactions

### User Management

1. Reference `database.md` for:

   - User table schema
   - Role management
   - User queries and mutations

2. Reference `routing.md` for:
   - User API endpoints
   - Protected routes
   - Role-based access control

## Best Practices

1. Always start with the relevant concept document before implementing new features
2. Follow the "When to Use" sections to make informed decisions
3. Use the provided examples as templates for implementation
4. Refer to the "Don't" examples to avoid common pitfalls
5. Combine concepts when building complex features

## Getting Help

If you're unsure which concept to use:

1. Identify the type of feature you're building
2. Check the Quick Reference section
3. Review the Common Use Cases
4. Refer to specific concept documents for detailed guidance
