import { buildPDF } from "../service/pdfService";
import { Router } from "express";

const router = Router();

router.post("/", async (request, response) => {

    const order = JSON.parse(request.query.order as string);

    buildPDF(order);
    response.send("hit");

});

router.get("/", async (request, response) => {
    const stream = response.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment;filename=invoice.pdf"
    });

    buildPDF(request.body.order);

});

export default router;