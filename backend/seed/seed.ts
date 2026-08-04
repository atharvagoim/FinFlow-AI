import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB, disconnectDB } from "../src/config/db";
import { User } from "../src/models/User";
import { Customer } from "../src/models/Customer";
import { Vendor } from "../src/models/Vendor";
import { Invoice } from "../src/models/Invoice";
import { Payment } from "../src/models/Payment";
import { Expense } from "../src/models/Expense";
import { Workflow } from "../src/models/Workflow";
import { AuditLog } from "../src/models/AuditLog";
import { logger } from "../src/utils/logger";

async function seed() {
  await connectDB();
  logger.info("Seeding database...");

  await Promise.all([
    User.deleteMany({}),
    Customer.deleteMany({}),
    Vendor.deleteMany({}),
    Invoice.deleteMany({}),
    Payment.deleteMany({}),
    Expense.deleteMany({}),
    Workflow.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("12345678", 10);

  const [admin, manager, employee] = await User.create([
    { name: "Atharva Admin", email: "admin@finflow.ai", passwordHash, role: "admin", isEmailVerified: true },
    { name: "Priya Finance", email: "manager@finflow.ai", passwordHash, role: "finance_manager", isEmailVerified: true },
    { name: "Employee Demo", email: "employee@finflow.ai", passwordHash, role: "employee", isEmailVerified: true },
  ]);

  const customers = await Customer.create([
    { name: "Acme Corp", email: "billing@acme.com", company: "Acme Corp", gstin: "27AACCA1234F1Z5", createdBy: admin._id },
    { name: "Globex Inc", email: "ap@globex.com", company: "Globex Inc", createdBy: admin._id },
    { name: "Initech", email: "accounts@initech.com", company: "Initech", createdBy: admin._id },
  ]);

  await Vendor.create([
    { name: "CloudHost Ltd", email: "billing@cloudhost.com", category: "Software", createdBy: admin._id },
    { name: "OfficeMart", email: "sales@officemart.com", category: "Office Supplies", createdBy: admin._id },
  ]);

  const invoices = await Invoice.create([
    {
      invoiceNumber: "INV-2026-00001",
      customer: customers[0]._id,
      items: [{ description: "Consulting Services - July", quantity: 40, unitPrice: 2500, taxRate: 18, amount: 100000 }],
      subtotal: 100000, taxTotal: 18000, total: 118000, currency: "INR",
      status: "paid", dueDate: new Date("2026-07-15"), issueDate: new Date("2026-07-01"),
      createdBy: admin._id, approvedBy: manager._id,
    },
    {
      invoiceNumber: "INV-2026-00002",
      customer: customers[1]._id,
      items: [{ description: "Software License - Annual", quantity: 1, unitPrice: 60000, taxRate: 18, amount: 60000 }],
      subtotal: 60000, taxTotal: 10800, total: 70800, currency: "INR",
      status: "sent", dueDate: new Date("2026-06-30"), issueDate: new Date("2026-06-01"),
      createdBy: admin._id,
    },
    {
      invoiceNumber: "INV-2026-00003",
      customer: customers[2]._id,
      items: [{ description: "Implementation Support", quantity: 10, unitPrice: 5000, taxRate: 18, amount: 50000 }],
      subtotal: 50000, taxTotal: 9000, total: 59000, currency: "INR",
      status: "pending_approval", dueDate: new Date("2026-08-20"), issueDate: new Date("2026-08-01"),
      createdBy: manager._id,
    },
  ]);

  await Payment.create([
    { invoice: invoices[0]._id, provider: "razorpay", providerRef: "sim_rzp_seed_1", amount: 118000, currency: "INR", status: "succeeded", paidAt: new Date("2026-07-10") },
  ]);

  await Expense.create([
    { employee: employee._id, category: "Travel", amount: 4500, description: "Client visit - cab + flight", status: "pending_approval", aiCategory: "Travel", aiFraudScore: 0.05, incurredAt: new Date("2026-07-20") },
    { employee: employee._id, category: "Software", amount: 1999, description: "Figma subscription", status: "approved", aiCategory: "Software", aiFraudScore: 0.02, approvedBy: manager._id, incurredAt: new Date("2026-07-18") },
  ]);

  // The canonical example workflow from the product spec:
  // Invoice Paid -> Verify Payment -> Generate Receipt -> Update Accounting
  // -> Notify Customer -> Notify Finance Team -> Save Execution Logs
  await Workflow.create({
    name: "Invoice Paid Automation",
    description: "Verifies payment, generates a receipt, updates accounting, and notifies everyone when an invoice is paid.",
    owner: admin._id,
    status: "active",
    triggerType: "event",
    triggerConfig: { event: "invoice.paid" },
    tags: ["example", "invoices"],
    nodes: [
      { id: "n1", type: "trigger", label: "Invoice Paid", position: { x: 0, y: 200 }, config: { event: "invoice.paid" } },
      { id: "n2", type: "payment", label: "Verify Payment", position: { x: 260, y: 200 }, config: { action: "verify", paymentId: "{{trigger.paymentId}}" } },
      { id: "n3", type: "invoice", label: "Generate Receipt", position: { x: 520, y: 200 }, config: { action: "generate_receipt", invoiceId: "{{trigger.invoiceId}}" } },
      { id: "n4", type: "database", label: "Update Accounting", position: { x: 780, y: 200 }, config: { collection: "invoice", operation: "update", filter: { _id: "{{trigger.invoiceId}}" }, update: { status: "paid" } } },
      { id: "n5", type: "email", label: "Notify Customer", position: { x: 1040, y: 100 }, config: { to: "{{trigger.customerEmail}}", subject: "Payment received", body: "Thanks! We've received your payment and generated a receipt." } },
      { id: "n6", type: "slack", label: "Notify Finance Team", position: { x: 1040, y: 300 }, config: { message: "Invoice {{trigger.invoiceId}} was paid and processed automatically." } },
      { id: "n7", type: "action", label: "Save Execution Logs", position: { x: 1300, y: 200 }, config: { action: "log_execution", payload: { invoiceId: "{{trigger.invoiceId}}" } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4" },
      { id: "e4", source: "n4", target: "n5" },
      { id: "e5", source: "n4", target: "n6" },
      { id: "e6", source: "n5", target: "n7" },
      { id: "e7", source: "n6", target: "n7" },
    ],
  });

  // Second example workflow, demonstrating AI-generated conditional approval
  // routing (mirrors the natural-language example from the product spec).
  await Workflow.create({
    name: "High-Value Invoice Approval",
    description: "Whenever an invoice above ₹50,000 is created, request manager approval and notify Slack.",
    owner: admin._id,
    status: "active",
    triggerType: "event",
    triggerConfig: { event: "invoice.created" },
    tags: ["ai-generated", "approvals"],
    nodes: [
      { id: "n1", type: "trigger", label: "Invoice Created", position: { x: 0, y: 150 }, config: { event: "invoice.created" } },
      { id: "n2", type: "approval", label: "Amount > 50,000?", position: { x: 260, y: 150 }, config: { amount: "{{trigger.total}}", threshold: 50000 } },
      { id: "n3", type: "slack", label: "Notify Slack - Needs Approval", position: { x: 520, y: 60 }, config: { message: "Invoice {{trigger.invoiceId}} needs manager approval (₹{{trigger.total}})." } },
      { id: "n4", type: "action", label: "Auto-Approved", position: { x: 520, y: 240 }, config: { action: "auto_approve" } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3", sourceHandle: "true" },
      { id: "e3", source: "n2", target: "n4", sourceHandle: "false" },
    ],
  });

  await AuditLog.create([
    { actor: admin._id, action: "invoice.approve", resourceType: "invoice", resourceId: invoices[0]._id.toString() },
    { actor: manager._id, action: "expense.approve", resourceType: "expense" },
  ]);

  logger.info("Seed complete.");
  logger.info("Login with: admin@finflow.ai / manager@finflow.ai / employee@finflow.ai — password: Password123!");
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  logger.error(`Seed failed: ${err.message}`);
  process.exit(1);
});
