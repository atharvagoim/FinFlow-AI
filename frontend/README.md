# FinFlow AI — Frontend

React 19 + Vite + TypeScript + Tailwind CSS SaaS dashboard for the FinFlow AI platform.

## Stack

React 19, Vite, TypeScript, Tailwind CSS, React Flow (workflow builder), React Query, React Router, Framer Motion, Recharts, Lucide Icons.

## Folder structure

```
src/
  api/            axios client with token refresh interceptor
  services/       one file per backend resource (dashboardService, workflowService, invoiceService, ...)
  context/        AuthContext (JWT session), ThemeContext (dark/light)
  routes/         ProtectedRoute (auth + role gating)
  components/
    ui/           reusable primitives — Button, Card, Input, Modal, Table, Badge
    layout/       Sidebar, Topbar, AppLayout
    dashboard/    KpiCard, RevenueChart, ExpenseBreakdownChart, RecentActivity
    workflow/     NodePalette, FlowNode, NodeConfigPanel, nodeMeta (the visual builder)
    chat/         ChatWidget — embedded AI finance assistant
  pages/          one file per route
```

## Setup

```bash
cp .env.example .env       # point VITE_API_URL at the backend (defaults to http://localhost:5000/api)
npm install
npm run dev                 # http://localhost:5173
```

Requires the backend API (and its worker process) running — see `../backend/README.md`.

## Design notes

Glassmorphism panels (`.glass-panel` / `.card-base` in `index.css`) plus a subtle dot-grid background give the SaaS-product feel the spec asked for, without a UI framework. Dark mode is class-based (`darkMode: "class"` in Tailwind config) and persisted to localStorage via `ThemeContext`. The workflow builder is React Flow with a custom node renderer (`FlowNode.tsx`) that exposes true/false handles for condition, AI-decision, and approval nodes, matching the backend engine's branching logic exactly — the config panel edits raw JSON so it stays in lockstep with whatever fields a node type's backend executor reads.
