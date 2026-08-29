# KanPlan

A lightweight, full-featured **project management (Kanban) application** built for agile teams. KanPlan lets you organize your work into workspaces and projects, manage tasks with a drag-and-drop Kanban board, track progress with data tables and analytics, and collaborate with your team — all wrapped in a modern, responsive UI.

## ✨ Features

- **Authentication** – Email/password sign-up & sign-in, plus OAuth via **GitHub** and **Google**
- **Workspaces** – Create and manage multiple workspaces, invite teammates via invite codes, and switch between them (admin/member roles)
- **Projects** – Organize work into projects within a workspace, with per-project settings and analytics
- **Kanban Board** – Drag-and-drop tasks (`@hello-pangea/dnd`) across columns: **Backlog → Todo → In Progress → In Review → Done**
- **Task Views** – Switch between a customizable **data table**, a **Kanban board**, and a **calendar** view; filter and sort tasks with ease
- **Task Management** – Create / edit / delete tasks, bulk update, assignees, due dates, priorities, and rich descriptions
- **Analytics** – Dashboard cards and charts to visualize workload, task distribution, and project progress (Recharts)
- **Team Management** – Member list with role management and member removal
- **Theming** – Light & dark mode via `next-themes`

## 🧰 Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router) with React 19 & TypeScript
- **Database**: [PostgreSQL](https://www.postgresql.org) (e.g. [Neon](https://neon.tech)) with [Prisma](https://www.prisma.io) ORM
- **Authentication**: [Better Auth](https://better-auth.com) (email/password + GitHub & Google OAuth)
- **File Storage**: [UploadThing](https://uploadthing.com) for image uploads
- **API Layer**: [Hono](https://hono.dev) with `@hono/zod-validator` and Zod schemas
- **Data Fetching**: [TanStack Query](https://tanstack.com/query) v5
- **UI**: [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com), styled with **Tailwind CSS v4**
- **Forms**: [React Hook Form](https://react-hook-form.com) with Zod resolvers
- **Tables**: [TanStack Table](https://tanstack.com/table)
- **Calendars**: [react-big-calendar](https://github.com/jquense/react-big-calendar) & [react-day-picker](https://react-day-picker.js.org)
- **Charts**: [Recharts](https://recharts.org)
- **Drag & Drop**: [@hello-pangea/dnd](https://github.com/atlassian/react-beautiful-dnd)

## 📁 Project Structure

├── prisma/              # Prisma schema & migrations
├── src/
│   ├── app/                  # Next.js App Router pages & layouts
│   │   ├── (auth)/           # Sign-in / sign-up
│   │   ├── (dashboard)/      # Authenticated app shell & pages
│   │   ├── (standalone)/     # Workspace / project settings, members, joining
│   │   ├── api/[[...route]]/ # Hono API route handler
│   │   └── api/uploadthing/  # UploadThing route handler
│   ├── components/           # Shared UI components (shadcn/ui) & app components
│   ├── features/             # Feature modules (auth, workspaces, projects, tasks, members)
│   │   └── <feature>/
│   │       ├── api/          # TanStack Query hooks
│   │       ├── components/   # Feature-specific UI
│   │       ├── hooks/        # Custom hooks (modals, filters, ids)
│   │       ├── schemas.ts    # Zod schemas
│   │       ├── server/       # Hono route definitions
│   │       └── queries.ts    # Server-side data fetching
│   ├── generated/            # Generated Prisma client
│   ├── hooks/                # App-wide hooks
│   └── lib/                  # Prisma, Better Auth, UploadThing, RPC, utils
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.18+ (or 20+ recommended)
- A **PostgreSQL** database (e.g. [Neon](https://neon.tech)) — used by both the app and Better Auth

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables (see below)
cp .env.example .env.local

# 3. Push the database schema (Postgres + Better Auth tables)
npx prisma migrate deploy

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Environment Variables

Create a `.env.local` file and fill in the values:

```env
# Public app URL (used by the Better Auth client)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Server URL trusted by Better Auth
BETTER_AUTH_URL=http://localhost:3000

# Better Auth secret (generate one, e.g. `openssl rand -base64 32`)
BETTER_AUTH_SECRET=your_better_auth_secret

# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Better Auth OAuth providers (GitHub & Google)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# UploadThing (for project/workspace image uploads)
UPLOADTHING_TOKEN=your_uploadthing_token
```

> **Note:** KanPlan requires a PostgreSQL database with the schema applied (`npx prisma migrate deploy`), a Better Auth secret, and optional GitHub/Google OAuth credentials. UploadThing credentials are only needed if you want to upload workspace/project images.

### Scripts

```bash
npm run dev          # Start the development server
npm run build        # Build for production
npm run start        # Start the production server
npm run lint         # Run ESLint
npx prisma migrate dev   # Create & apply a new migration during development
npx prisma studio        # Inspect the database
```

## 🗺️ Roadmap

- [x] Authentication (email + OAuth)
- [x] Workspaces & team management
- [x] Projects
- [x] Kanban board with drag & drop
- [x] Data table, calendar, and analytics views
- [ ] Recurring tasks & notifications
- [ ] Comments & activity feeds on tasks
- [ ] Advanced search across projects

## 🙏 Acknowledgements

Built with [Next.js](https://nextjs.org), [Better Auth](https://better-auth.com), [Prisma](https://www.prisma.io), [UploadThing](https://uploadthing.com), [Hono](https://hono.dev), [shadcn/ui](https://ui.shadcn.com), and the amazing open-source ecosystem that powers it all.

## 📄 License

This project is for personal/educational use.
