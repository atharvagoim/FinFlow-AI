# FinFlow AI — AI-Powered Finance Automation Platform

A Zapier/Make.com-style automation builder purpose-built for finance teams: drag-and-drop workflows, an AI decision engine, invoicing, payments, expense management, and an embedded finance chat assistant.

This is a **scoped MVP build**, not the entire 15-module spec fully fleshed out — see "What's fully built vs. scaffolded" below for an honest breakdown before you rely on any part of it.

## Monorepo layout

```
finflow-ai/
  backend/     Express + TypeScript API, workflow engine, AI services  (see backend/README.md)
  frontend/    React 19 + Vite SaaS dashboard + visual workflow builder (see frontend/README.md)
  docs/        API reference
  docker-compose.yml
```

## Quick start (local, no Docker)

You need MongoDB and Redis running locally (or point `.env` at hosted instances).

```bash
# 1. Backend
cd backend
cp .env.example .env         # add OPENAI_API_KEY if you want real AI responses
npm install
npm run seed                  # demo users, invoices, and two example workflows
npm run dev                   # API on :5000
# in a second terminal:
npm run worker                # required — this is what actually executes workflows

# 2. Frontend
cd ../frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173
```

Log in with `admin@finflow.ai` / `manager@finflow.ai` / `employee@finflow.ai`, password `Password123!`.

## Quick start (Docker)

```bash
cp backend/.env.example backend/.env   # fill in secrets/keys
docker compose up --build
# frontend: http://localhost:8080   backend: http://localhost:5000
```

Run `docker compose run backend npm run seed` once to load demo data.

## What's fully built vs. scaffolded

**Fully implemented, working end-to-end:**
JWT auth (signup/login/refresh/forgot-reset password/email verification) with role-based access (admin / finance_manager / employee); the visual workflow builder (React Flow) with all 15 node types from the spec, save/load, and natural-language "generate a workflow from a prompt" via OpenAI; the workflow execution engine (BullMQ-backed, branching, parallel fan-out, retries, pausable delays, full execution logs) — the "Invoice Paid → ... → Save Execution Logs" example from the spec is seeded and runnable; 9 AI features (categorize expense, extract invoice info, summarize invoice, payment reminders, classify email, duplicate invoice detection, fraud detection, approval suggestions, report generation) plus the embedded chat assistant; invoices (create/approve/PDF generation), payments (initiate/refund with mock Stripe+Razorpay adapters), expenses (submit/AI-categorize/AI-fraud-score/approve); the live dashboard with real aggregated metrics and charts; an admin panel for users, roles, audit logs, and all workflow executions.

**Deliberately out of scope for this pass** (structure/models exist, but no dedicated UI or deep logic): purchase orders, budgets, GST/tax summary reports, vendor management UI, real QuickBooks/Google Sheets/Microsoft Teams/WhatsApp provider integrations (WhatsApp and Slack have working adapters that simulate when no API key is set — same pattern would extend to the others), OCR for receipt uploads (the field exists on the Expense model; wiring a real OCR provider is a small, isolated addition), and refresh-token device management UI. Every one of these was designed with the same modular pattern (service + controller + route) so adding them doesn't require restructuring anything.

## Why these architectural choices

Controllers stay thin and delegate to services, so business logic is unit-testable without an HTTP server. The workflow engine runs as a separate BullMQ worker process from the API — execution load never competes with request handling, and you can scale worker replicas independently under automation load. Every AI feature and payment integration has a graceful mock fallback when its API key is absent, so the entire platform — including AI decisioning and duplicate-invoice detection — is demoable with zero external credentials, and flips to real behavior the moment you add a key to `.env`. Node executors in the workflow engine are looked up from a single registry (`workflow-engine/registry.ts`); adding a 16th node type never touches the graph-traversal engine itself.

## Docs

- [`docs/API_DOCS.md`](./docs/API_DOCS.md) — REST API reference
- [`backend/README.md`](./backend/README.md) — backend architecture, folder structure, testing
- [`frontend/README.md`](./frontend/README.md) — frontend architecture, folder structure, design system
