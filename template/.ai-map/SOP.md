# Coding Standards & Patterns (SOP)

<!-- AUTO-FILL: PENDING — see .ai-map/INIT.md. Detect: language/framework from manifest, lint/format configs (.prettierrc, .eslintrc, ruff, black), tsconfig strict mode, test runner, and 2–3 observed conventions (import style, file naming, export style). Leave sections with no detected patterns as "(no convention detected yet)". -->

## API Route Pattern

[Show the standard pattern for writing API routes in your project. Include auth, validation, error handling.]

```typescript
// Example:
// export const GET = apiHandler({ module: "...", action: "..." }, async (req, ctx) => {
//   // your code
// });
```

## Error Handling

[How should errors be handled? Thrown? Returned? Logged?]

## Validation

[What validation library? Where do schemas live? How are they applied?]

## Permission Checking

[How are permissions checked? Server-side? Client-side? Both?]

## Component Patterns (Frontend)

[Server components vs client components? State management? Data fetching?]

## Import Rules

```typescript
// Example:
// ALWAYS use @/ alias
// NEVER use relative imports like ../../
```

## Database Queries

[Any patterns for queries? Always include org filter? Use specific helpers?]

## Testing

[How to write tests? What framework? Where do test files go?]
