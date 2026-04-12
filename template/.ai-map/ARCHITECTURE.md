# System Architecture

## Directory Structure

```
src/
├── [map your directory tree here]
└── ...
```

## Data Models

[Describe your key data models, their relationships, and any important enums or patterns.]

## Authentication Flow

```
[Describe how auth works in your system — JWT, sessions, API keys, etc.]
```

## Authorization / Roles

| Role | Scope |
|------|-------|
| [Role 1] | [What they can access] |
| [Role 2] | [What they can access] |

## Database

- **ORM**: [Prisma / TypeORM / Drizzle / raw SQL]
- **Database**: [PostgreSQL / MySQL / SQLite / MongoDB]
- **Key patterns**: [soft delete, multi-tenancy, RLS, etc.]

## Event System (if applicable)

[Describe how events flow through your system — pub/sub, webhooks, cron jobs, etc.]
