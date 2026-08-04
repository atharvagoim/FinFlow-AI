# FinFlow AI — API Reference

Base URL: `http://localhost:5000/api`. All authenticated routes require `Authorization: Bearer <accessToken>`.

Every response follows `{ success: boolean, data?, message?, code? }`.

## Auth — `/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/signup` | — | `{ name, email, password, role? }` → creates account, sends verification email |
| GET/POST | `/verify-email?token=` | — | Verifies email from the link sent on signup |
| POST | `/login` | — | `{ email, password }` → `{ accessToken, refreshToken, user }` |
| POST | `/refresh` | — | `{ refreshToken }` → rotates and returns a new token pair |
| POST | `/logout` | — | `{ refreshToken }` → revokes it |
| POST | `/forgot-password` | — | `{ email }` → sends reset link (always 200, doesn't leak existence) |
| POST | `/reset-password` | — | `{ token, password }` |
| GET | `/me` | ✓ | Returns the decoded JWT payload |

## Workflows — `/workflows`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ✓ | List all workflows |
| POST | `/` | ✓ | Create a workflow `{ name, nodes, edges, triggerType, status }` |
| POST | `/generate` | ✓ | `{ prompt }` → AI generates a full workflow graph and saves it as a draft |
| GET | `/executions` | ✓ | List executions, optional `?workflowId=` |
| GET | `/executions/:id` | ✓ | Execution detail incl. per-node logs |
| GET | `/:id` | ✓ | Get one workflow |
| PUT | `/:id` | ✓ | Update a workflow (nodes/edges/status/etc.) |
| DELETE | `/:id` | admin, finance_manager | Delete a workflow |
| POST | `/:id/trigger` | ✓ | `{ input }` → queues an execution, returns immediately with the execution record |

## AI — `/ai`

| Method | Path | Description |
|---|---|---|
| POST | `/categorize-expense` | `{ description, amount }` |
| POST | `/extract-invoice` | `{ rawText }` |
| POST | `/summarize-invoice` | `{ invoiceDetails }` |
| POST | `/payment-reminder` | `{ customerName, invoiceNumber, amount, daysOverdue }` |
| POST | `/classify-email` | `{ emailBody }` |
| POST | `/detect-duplicate-invoice` | `{ candidate, recent[] }` |
| POST | `/detect-fraud` | `{ description, amount, employee, category }` |
| POST | `/suggest-approval` | `{ type, amount, requester, history? }` |
| POST | `/generate-report` | `{ ...any metrics }` |
| POST | `/chat` | `{ message }` → embedded finance assistant, grounded in live DB queries for overdue invoices / revenue / expenses / duplicate payments / failed workflows |

All AI endpoints fall back to a safe mocked response if `OPENAI_API_KEY` isn't configured.

## Invoices — `/invoices`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ✓ | List, optional `?status=` |
| POST | `/` | ✓ | `{ customer, items[], dueDate, notes? }` |
| GET | `/:id` | ✓ | Get one |
| PUT | `/:id` | ✓ | Update items/dueDate/notes |
| DELETE | `/:id` | admin, finance_manager | Delete |
| POST | `/:id/approve` | admin, finance_manager | Approve |
| POST | `/:id/generate-pdf` | ✓ | Generates PDF + AI summary, returns updated invoice with `pdfUrl` |

## Payments — `/payments`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ✓ | List, optional `?status=` |
| POST | `/` | ✓ | `{ invoiceId, provider: "stripe"\|"razorpay"\|"manual", source? }` |
| GET | `/:id` | ✓ | Get one |
| POST | `/:id/refund` | admin, finance_manager | `{ amount? }` — full refund if omitted |

## Expenses — `/expenses`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ✓ | Employees see only their own; managers/admins see all |
| POST | `/` | ✓ | `{ category, amount, description?, receiptUrl? }` — AI auto-categorizes and fraud-scores on submit |
| POST | `/:id/approve` | admin, finance_manager | `{ approve: boolean }` |

## Dashboard — `/dashboard`

| Method | Path | Description |
|---|---|---|
| GET | `/summary` | Revenue, expenses, pending/paid invoice counts, automation run stats, monthly revenue series, expense breakdown, recent activity |

## Webhooks — `/webhooks`

| Method | Path | Description |
|---|---|---|
| POST | `/:workflowId` | Unauthenticated inbound webhook. Triggers the given workflow (must be `status: active`, `triggerType: webhook`) with the request body as trigger input. |

## Admin — `/admin` (all routes require `admin` role)

`GET /users`, `PATCH /users/:id/role`, `PATCH /users/:id/status`, `GET /audit-logs`, `GET /executions`

## Customers / Vendors

`GET|POST /customers`, `GET|POST /vendors` — basic CRUD, authenticated.
