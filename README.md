# IMCI Dashboard

Integrated Management of Childhood Illness (IMCI) Dashboard built with Next.js, TypeScript, Drizzle ORM, and shadcn/ui.

## Project Overview

This dashboard allows healthcare administrators to create and manage IMCI diagnosis flows, which guide healthcare workers through the process of diagnosing and treating childhood illnesses.

### Key Features

- **Flow Management**: Create and manage IMCI diagnosis flows
- **User Management**: Role-based access control (admin, editor, viewer)
- **Version Control**: Track and manage flow versions
- **Dynamic Rules Engine**: Configure diagnosis rules and conditions

## Database Implementation

The project uses Drizzle ORM with PostgreSQL for data management.

### Database Structure

```
db/
├── index.ts        # Database connection setup and configuration
├── migrate.ts      # Migration runner script
├── schema.ts       # Schema exports aggregation
├── seed.ts         # Database seeding script
├── seeds/          # Seed data files
└── tables/         # Table definitions
    ├── users.ts    # User table schema
    └── flows.ts    # Flow and FlowVersion table schemas
```

### Migrations

```
drizzle/
├── meta/
│   └── _journal.json         # Tracks migration history
└── 0000_initial_schema.sql   # Initial schema migration
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/your_database
   ```
4. Run database migrations and seed:
   ```bash
   npm run db:init
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Database Management

```bash
# Generate migrations from schema changes
npm run db:generate

# Push schema changes to database
npm run db:push

# Run migrations
npm run db:migrate

# Seed database with initial data
npm run db:seed

# Initialize database (migrate + seed)
npm run db:init

# Browse database with Drizzle Studio
npm run db:studio
```

