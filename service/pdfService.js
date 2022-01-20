"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPDF = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
function buildPDF(order) {
    const doc = new pdfkit_1.default();
    doc.pipe(fs_1.default.createWriteStream("E:\\Assignments\\typescript-server-neostore\\neostore-backend-ts\\invoice\\invoice.pdf"));
    doc.fontSize(24).text("Invoice");
    doc.text("                                                                      ", { underline: true });
    order.map((item) => {
        doc.fontSize(18).text("" + item.product.name + ": ", { continued: true }).text("Qty: " + item.quantity);
    });
    doc.text("                                                                                             ", { underline: true });
    doc.end();
}
exports.buildPDF = buildPDF;
