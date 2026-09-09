# Momentum

**A lightweight project management app for agile teams.**

Organize work into workspaces and projects, manage tasks with a drag-and-drop Kanban board, track progress with data tables and analytics, and collaborate with your team — all wrapped in a modern, responsive UI.

---

## Features

| Feature | Description |
|---------|-------------|
| Authentication | Email/password sign-up & sign-in, plus OAuth via GitHub and Google |
| Workspaces | Create and manage multiple workspaces, invite teammates via invite codes, and switch between them (admin/member roles) |
| Projects | Organize work into projects within a workspace, with per-project settings and analytics |
| Kanban Board | Drag-and-drop tasks across columns: Backlog → Todo → In Progress → In Review → Done |
| Task Views | Switch between a customizable data table, Kanban board, and calendar view |
| Task Management | Create, edit, and delete tasks; bulk update; assignees, due dates, priorities, and rich descriptions |
| Analytics | Dashboard cards and charts to visualize workload, task distribution, and project progress |
| Team Management | Member list with role management and member removal |
| Theming | Light & dark mode |

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Next.js](https://nextjs.org) (App Router) with React 19 & TypeScript |
| Database | [PostgreSQL](https://www.postgresql.org) (e.g. [Neon](https://neon.tech)) with [Prisma](https://www.prisma.io) ORM |
| Authentication | [Better Auth](https://better-auth.com) (email/password + GitHub & Google OAuth) |
| File Storage | [UploadThing](https://uploadthing.com) for image uploads |
| API Layer | [Hono](https://hono.dev) with `@hono/zod-validator` and Zod schemas |
| Data Fetching | [TanStack Query](https://tanstack.com/query) v5 |
| UI | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com), styled with **Tailwind CSS v4** |
| Forms | [React Hook Form](https://react-hook-form.com) with Zod resolvers |
| Tables | [TanStack Table](https://tanstack.com/table) |
| Calendars | [react-big-calendar](https://github.com/jquense/react-big-calendar) & [react-day-picker](https://react-day-picker.js.org) |
| Charts | [Recharts](https://recharts.org) |
| Drag & Drop | [@hello-pangea/dnd](https://github.com/atlassian/react-beautiful-dnd) |

## Project Structure

```
prisma/               # Prisma schema & migrations
src/
├── app/              # Next.js App Router pages & layouts
│   ├── (auth)/       # Sign-in / sign-up
│   ├── (dashboard)/  # Authenticated app shell & pages
│   ├── (standalone)/ # Workspace / project settings, members, joining
│   ├── api/[[...route]]/  # Hono API route handler
│   └── api/uploadthing/   # UploadThing route handler
├── components/       # Shared UI components (shadcn/ui) & app components
├── features/         # Feature modules (auth, workspaces, projects, tasks, members)
│   └── <feature>/
│       ├── api/      # TanStack Query hooks
│       ├── components/   # Feature-specific UI
│       ├── hooks/    # Custom hooks (modals, filters, ids)
│       ├── schemas.ts    # Zod schemas
│       ├── server/   # Hono route definitions
│       └── queries.ts    # Server-side data fetching
├── generated/        # Generated Prisma client
├── hooks/            # App-wide hooks
└── lib/              # Prisma, Better Auth, UploadThing, RPC, utils
```

## Getting Started

### Prerequisites

- **Node.js** 20.9+ (required by Next.js 16)
- **npm** (or pnpm/yarn)
- A **PostgreSQL** database (e.g. [Neon](https://neon.tech))
- *(Optional)* [Docker](https://www.docker.com) with Docker Compose

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env

# 3. Generate the Prisma client
npx prisma generate

# 4. Push the database schema (Postgres + Better Auth tables)
npx prisma migrate deploy

# 5. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm test` | Run Vitest unit + component tests |
| `npm run test:watch` | Re-run tests on file change |
| `npm run test:coverage` | Run tests with V8 coverage report |
| `npm run typecheck` | Static type check (tsc --noEmit) |
| `npx prisma generate` | Generate the Prisma client |
| `npx prisma migrate dev` | Create & apply a new migration during development |
| `npx prisma migrate deploy` | Apply pending migrations (production) |
| `npx prisma studio` | Inspect the database |

### Testing

Tests use [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com)
and live next to the source as `*.test.ts` / `*.test.tsx` files.

See [docs/TESTING.md](docs/TESTING.md) for the full testing guide.

### Docker

The app ships with a multi-stage `Dockerfile` (Next.js standalone output) and a `docker-compose.yml`. The image is self-contained except for the database.

```bash
# Build and run (reads env vars from .env)
docker compose up -d --build

# Open http://localhost:3000
```

**Notes:**

- **Build-time:** `NEXT_PUBLIC_APP_URL` is inlined into the client bundle. For a real deployment, pass the public URL as a build arg:
  ```bash
  docker compose build --build-arg NEXT_PUBLIC_APP_URL=https://yourdomain.com
  ```
- **Runtime:** secrets (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `UPLOADTHING_TOKEN`, OAuth keys, etc.) are injected from `.env` via `env_file` — they are **not** baked into the image.
- **Migrations:** the container doesn't run migrations automatically. Apply them once against your database before starting:
  ```bash
  npx prisma migrate deploy
  ```
- **Port:** change the host port in `docker-compose.yml` (e.g. `"3001:3000"`) if port 3000 is already in use.

## Acknowledgements

Built with [Next.js](https://nextjs.org), [Better Auth](https://better-auth.com), [Prisma](https://www.prisma.io), [UploadThing](https://uploadthing.com), [Hono](https://hono.dev), [shadcn/ui](https://ui.shadcn.com), and the amazing open-source ecosystem that powers it all.

## License

This project is for personal/educational use.
