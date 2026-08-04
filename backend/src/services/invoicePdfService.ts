import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { IInvoice } from "../models/Invoice";

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Generates a simple, clean invoice/receipt PDF and saves it to disk.
// In production this would upload to S3/GCS and return a signed URL; the
// local file + static route pattern here keeps the demo self-contained.
export async function generateInvoicePdf(invoice: IInvoice & { customer: any }): Promise<{ url: string; filePath: string }> {
  const fileName = `invoice-${invoice.invoiceNumber}.pdf`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).fillColor("#4f46e5").text("FinFlow AI", { align: "left" });
    doc.fontSize(10).fillColor("#666").text("Automated Finance Platform", { align: "left" });
    doc.moveDown(1.5);

    doc.fontSize(16).fillColor("#111").text(`Invoice ${invoice.invoiceNumber}`);
    doc.fontSize(10).fillColor("#666").text(`Issue Date: ${new Date(invoice.issueDate).toDateString()}`);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toDateString()}`);
    doc.text(`Status: ${invoice.status.toUpperCase()}`);
    doc.moveDown();

    doc.fontSize(12).fillColor("#111").text(`Bill To: ${invoice.customer?.name || "N/A"}`);
    doc.fontSize(10).fillColor("#666").text(invoice.customer?.email || "");
    doc.moveDown();

    doc.fontSize(11).fillColor("#111").text("Items", { underline: true });
    doc.moveDown(0.5);
    invoice.items.forEach((item) => {
      doc
        .fontSize(10)
        .fillColor("#333")
        .text(`${item.description}  x${item.quantity}  @ ${item.unitPrice}  (tax ${item.taxRate}%)  =  ${item.amount.toFixed(2)}`);
    });

    doc.moveDown();
    doc.fontSize(10).fillColor("#333").text(`Subtotal: ${invoice.subtotal.toFixed(2)} ${invoice.currency}`);
    doc.text(`Tax: ${invoice.taxTotal.toFixed(2)} ${invoice.currency}`);
    doc.fontSize(13).fillColor("#111").text(`Total: ${invoice.total.toFixed(2)} ${invoice.currency}`, { underline: true });

    if (invoice.aiSummary) {
      doc.moveDown();
      doc.fontSize(9).fillColor("#666").text(`AI Summary: ${invoice.aiSummary}`);
    }

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return { url: `/uploads/${fileName}`, filePath };
}
