import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { config } from "dotenv";
import multer from "multer";
import { APIv1 } from "./API/v1.0.1/routes";

import CategorySchema from "./schemas/CategorySchema";
import pdfRouter from "./routers/pdfRouter";
import categoryRouter from "./routers/categoryRouter";

const server = express();
config();
const upload = multer();

server.use(cors());

server.use(express.static("images"));
server.use(express.static("users"));
server.use(express.static("invoice"));

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/neostore", (err) => {
    if (err) console.error(err);
    console.log("Connected to MONGO");
});

server.use("/api/v1.0.1", APIv1);

server.get("/categories", async (request: Request, response: Response) => {
    const categories = await CategorySchema.find({});
    response.send(categories);
})

server.use("/filter", categoryRouter);

server.use("/pdf", pdfRouter);

server.listen(8090, () => {
    console.log("server running on port 8090");
})