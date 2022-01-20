"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdfService_1 = require("../service/pdfService");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const order = JSON.parse(request.query.order);
    (0, pdfService_1.buildPDF)(order);
    response.send("hit");
}));
router.get("/", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const stream = response.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment;filename=invoice.pdf"
    });
    (0, pdfService_1.buildPDF)(request.body.order);
}));
exports.default = router;
