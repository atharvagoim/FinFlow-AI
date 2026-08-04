# FinFlow AI — Backend

Node.js + Express + TypeScript API for the FinFlow AI finance automation platform.

## Stack

Express, TypeScript, MongoDB (Mongoose), Redis + BullMQ (job queue), JWT auth, OpenAI, Nodemailer, PDFKit.

## Folder structure

```
src/
  config/         env, MongoDB, Redis connections
  models/         Mongoose schemas (User, Workflow, Invoice, Payment, Expense, ...)
  controllers/    request handlers, thin — delegate to services
  services/       business logic (auth, invoices, payments, workflows, email, PDF)
  repositories/   (extension point) swap Mongoose for another data layer without touching services
  routes/         Express routers, one per resource
  middlewares/    auth, RBAC, validation, rate limiting, error handling
  validators/     Zod schemas per resource
  workflow-engine/
    nodes/        one executor per node type (trigger, condition, ai_decision, ...)
    registry.ts   node type -> executor lookup
    executor.ts   graph traversal engine (branching, retries, parallel fan-out, pausable delays)
  ai/             OpenAI client + all AI feature functions
  integrations/   Stripe/Razorpay adapters (mock fallback when no API key set)
  jobs/           BullMQ queue + standalone worker process
  utils/          logger, AppError, JWT helpers, asyncHandler
seed/             seed.ts — demo data (users, invoices, example workflows)
tests/            Jest unit tests
```

## Why this structure

Controllers stay thin and only translate HTTP <-> service calls, so business logic is testable without spinning up Express. The workflow engine is deliberately decoupled from HTTP: it's driven by BullMQ jobs, so it can be scaled as its own worker fleet independent of the API. Node executors follow an open/closed pattern — adding a new node type never requires touching the executor itself, only `nodes/registry.ts`.

## Setup

```bash
cp .env.example .env      # fill in MONGO_URI, JWT secrets, OPENAI_API_KEY, etc.
npm install
npm run seed               # creates demo users + sample data + example workflows
npm run dev                 # API on :5000
npm run worker              # separate terminal — required for workflows to actually execute
```

Demo logins after seeding (password `Password123!`):

| Role            | Email               |
|-----------------|----------------------|
| Admin           | admin@finflow.ai     |
| Finance Manager | manager@finflow.ai   |
| Employee        | employee@finflow.ai  |

## Running tests

```bash
npm test
```

## API documentation

See `../docs/API_DOCS.md` for the full endpoint reference.

## Notes on AI and integration keys

Every AI feature and payment integration (Stripe/Razorpay/WhatsApp) gracefully falls back to a simulated response when its API key is missing, so the whole platform is demoable with zero external credentials. Add real keys to `.env` to switch each one on — no code changes required.
