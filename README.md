# Next.js & Prisma Auth Starter

A Next.js boilerplate with authentication, Prisma ORM, and a local PostgreSQL database running in Docker.

## Features

- Next.js app with App Router, Server Actions & API Routes
- Authentication with [NextAuth.js v4](https://next-auth.js.org/) (sign up & log in flows)
- Prisma ORM with PostgreSQL for data modeling, migrations, and seeding
- CRUD operations for blog posts (create, view, delete)
- Pagination, filtering & relation queries

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) (for the local database)

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up your `.env` file

Create an `.env` file in the project root:

```bash
cp .env.example .env  # or create it manually
```

It should contain:

```bash
DATABASE_URL="postgres://user:password@localhost:5432/hackathon"
AUTH_SECRET="RANDOM_32_CHARACTER_STRING"
```

Generate a value for `AUTH_SECRET`:

```bash
npx auth secret
```

### 3. Start the database

Spin up the local PostgreSQL container with Docker:

```bash
pnpm db:up
```

Other database commands:

| Command | Description |
|---|---|
| `pnpm db:up` | Start the database container |
| `pnpm db:down` | Stop the container |
| `pnpm db:reset` | Wipe the volume and restart (fresh DB) |

### 4. Run migrations

Apply the Prisma schema to the database:

```bash
pnpm prisma migrate dev --name init
```

### 5. Seed the database

Add initial data:

```bash
pnpm prisma db seed
```

### 6. Run the app

```bash
pnpm dev
```

Visit `http://localhost:3000` to start using the app.

## Project structure

```
app/          # Next.js App Router pages and API routes
lib/          # Prisma client and DB utilities
prisma/       # Schema, migrations, and seed script
```

## Useful commands

```bash
pnpm prisma studio        # Open Prisma Studio (GUI for the DB)
pnpm prisma migrate dev   # Create and apply a new migration
pnpm prisma generate      # Regenerate the Prisma client
```

## Resources

- [Next.js documentation](https://nextjs.org/docs)
- [Prisma ORM documentation](https://www.prisma.io/docs/orm)
- [NextAuth.js documentation](https://next-auth.js.org/)

