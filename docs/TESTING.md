# Testing Guide

This project uses [Vitest](https://vitest.dev) with [Testing Library](https://testing-library.com)
for unit and component tests. Tests are colocated with the source files they cover
(`*.test.ts` / `*.test.tsx`) so related code and tests stay together.

## Commands

```bash
npm test              # run the full suite once (CI mode)
npm run test:watch    # re-run affected tests on file change (development)
npm run test:coverage # run with V8 coverage (text + html + lcov)
npm run typecheck     # static type check (tsc --noEmit)
```

## Layout

```text
vitest.config.ts          # jsdom env, @/* alias, setup file, coverage rules
vitest.setup.ts           # loads @testing-library/jest-dom matchers
src/lib/utils.test.ts
src/features/auth/schemas.test.ts
src/features/workspaces/schemas.test.ts
src/features/projects/schemas.test.ts
src/features/tasks/schemas.test.ts
src/features/types.test.ts
src/features/tasks/components/kanban-utils.test.ts
src/components/analytics-card.test.tsx
src/components/dotted-separator.test.tsx
src/features/tasks/components/task-date.test.tsx
```

## What is covered (and why)

| Area                                                | File(s)                                               | Strategy                                                                                                                       |
| --------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Class-name merging, invite codes, enum labels       | `src/lib/utils.ts`                                    | Pure unit tests, including `it.each` tables                                                                                    |
| Form validation (auth, workspaces, projects, tasks) | `src/features/*/schemas.ts`                           | Zod `safeParse` tests for valid, boundary and invalid inputs                                                                   |
| Bulk-update payload shape                           | inline schema in `src/features/tasks/server/route.ts` | Mirrored schema test guarding the `1000..1_000_000` position contract                                                          |
| Kanban board transitions                            | `src/features/tasks/components/kanban-utils.ts`       | Pure-function tests: grouping, sorting, cross-column moves, same-column reorder, invalid drops, immutability, position capping |
| Domain enums                                        | `TaskStatus`, `MemberRole`                            | Guards the five-column workflow contract                                                                                       |
| UI components                                       | `AnalyticsCard`, `DottedSeparator`, `TaskDate`        | `@testing-library/react` render tests (variants, styles, date thresholds)                                                      |

Database-backed code (Hono routes, Prisma queries, Better Auth middleware)
is intentionally **not** covered by unit tests — it needs a live Postgres
instance and is better served by integration/E2E tests.

## Conventions for new tests

1. **Colocate** the test next to the source: `foo.ts` → `foo.test.ts`.
2. **Prefer pure functions.** If logic is buried in a component or route,
   extract it (as was done with `kanban-utils.ts`) so it can be tested
   without mocks.
3. **Test behavior, not implementation** for components: query by visible
   text/role and assert user-visible outcomes.
4. **Cover the unhappy path**: invalid schema input, out-of-range indexes,
   unknown columns, null dates.
5. Keep tests **deterministic** — no network, no random assertions
   (the invite-code uniqueness test relies on a 62⁶ space, not timing).
6. Run `npm test`, `npm run typecheck` and `npx eslint <files>` before pushing.

## Coverage

Coverage uses the V8 provider and focuses on testable application logic:

```ts
// vitest.config.ts (excerpt)
coverage: {
  provider: 'v8',
  include: [
    'src/lib/**/*.ts',
    'src/features/**/schemas.ts',
    'src/features/**/types.ts',
    'src/features/tasks/components/kanban-utils.ts',
    'src/components/**/*.tsx',
  ],
}
```

View the HTML report after `npm run test:coverage` at `coverage/index.html`.
