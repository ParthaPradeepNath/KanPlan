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

- **Framework**: [Next.js 15](https://nextjs.org) (App Router) with React 19 & TypeScript
- **Backend-as-a-Service**: [Appwrite](https://appwrite.io) — authentication, databases, file storage (via `node-appwrite`)
- **API Layer**: [Hono](https://hono.dev) with `@hono/zod-validator` and Zod schemas
- **Data Fetching**: [TanStack Query](https://tanstack.com/query) v5
- **UI**: [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com), styled with **Tailwind CSS v4**
- **Forms**: [React Hook Form](https://react-hook-form.com) with Zod resolvers
- **Tables**: [TanStack Table](https://tanstack.com/table)
- **Calendars**: [react-big-calendar](https://github.com/jquense/react-big-calendar) & [react-day-picker](https://react-day-picker.js.org)
- **Charts**: [Recharts](https://recharts.org)
- **Drag & Drop**: [@hello-pangea/dnd](https://github.com/atlassian/react-beautiful-dnd)

## 📁 Project Structure

```
src/
├── app/                  # Next.js App Router pages & layouts
│   ├── (auth)/           # Sign-in / sign-up
│   ├── (dashboard)/      # Authenticated app shell & pages
│   ├── (standalone)/     # Workspace / project settings, members, joining
│   ├── api/[[...route]]/ # Hono API route handler
│   └── oauth/            # OAuth redirect handler
├── components/           # Shared UI components (shadcn/ui) & app components
├── config.ts             # Appwrite collection IDs from env
├── features/             # Feature modules (auth, workspaces, projects, tasks, members)
│   └── <feature>/
│       ├── api/          # TanStack Query hooks
│       ├── components/   # Feature-specific UI
│       ├── hooks/        # Custom hooks (modals, filters, ids)
│       ├── schemas.ts    # Zod schemas
│       ├── server/       # Hono route definitions
│       └── queries.ts    # Server-side data fetching
├── hooks/                # App-wide hooks
└── lib/                  # Appwrite clients, RPC, OAuth, utils
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.18+ (or 20+ recommended)
- An **Appwrite** instance (cloud or self-hosted) with the collections set up

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables (see below)
cp .env.example .env.local

# 3. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Environment Variables

Create a `.env.local` file and fill in your Appwrite project details:

```env
# Appwrite endpoint & project
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your_project_id

# Appwrite collection IDs (database & collections)
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_WORKSPACES_ID=your_workspaces_collection_id
NEXT_PUBLIC_APPWRITE_MEMBERS_ID=your_members_collection_id
NEXT_PUBLIC_APPWRITE_PROJECTS_ID=your_projects_collection_id
NEXT_PUBLIC_APPWRITE_TASKS_ID=your_tasks_collection_id
NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID=your_images_bucket_id

# Appwrite API key (server-side only, for admin/OAuth operations)
NEXT_APPWRITE_KEY=your_appwrite_api_key
```

> **Note:** KanPlan requires an Appwrite project with matching database collections, a storage bucket, and OAuth providers (GitHub / Google) configured. The app will not run correctly without them.

### Scripts

```bash
npm run dev      # Start the development server
npm run build    # Build for production
npm run start    # Start the production server
npm run lint     # Run ESLint
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

Built with [Next.js](https://nextjs.org), [Appwrite](https://appwrite.io), [shadcn/ui](https://ui.shadcn.com), and the amazing open-source ecosystem that powers it all.

## 📄 License

This project is for personal/educational use.
