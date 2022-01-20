import pdfkit from "pdfkit";
import fs from "fs";

export function buildPDF(order: { product: { name: string; }; quantity: string; }[]) {
    const doc = new pdfkit();
    doc.pipe(fs.createWriteStream("E:\\Assignments\\typescript-server-neostore\\neostore-backend-ts\\invoice\\invoice.pdf"));
    doc.fontSize(24).text("Invoice");
    doc.text("                                                                      ", { underline: true });
    order.map((item: { product: { name: string; }; quantity: string; }) => {
        doc.fontSize(18).text("" + item.product.name + ": ", { continued: true }).text("Qty: " + item.quantity);
    })
    doc.text("                                                                                             ", { underline: true });
    doc.end();
}