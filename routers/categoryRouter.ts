import { Request, response, Response, Router } from "express";
import multer from "multer";
import fs from "fs";
import CategorySchema from "../schemas/CategorySchema";
import ProductSchema from "../schemas/ProductSchema";
import { Types } from "mongoose";

const router = Router();

/**
 * Add category, products => barebone url
 */

router.get("/all", async (request, response) => {
    const data = await ProductSchema
        .find({})
        .populate({ path: "Category", model: "Category" });
    response.send(data);
})

router.get("/", async (request: Request, response: Response) => {
    const page = parseInt(request.query.page as string);
    const limit = parseInt(request.query.limit as string);
    let queryData: any = request.query.category;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let data = [];

    if (page) {
        data = await ProductSchema.find({})
            .limit(limit)
            .populate({ path: "Category", model: "Category" });
    } else {
        data = await ProductSchema.find({})
            .limit(limit)
            .skip(startIndex)
            .populate({ path: "Category", model: "Category" });
    }
    const filter = data.filter((item: any) => {
        return queryData.includes(item.Category.category);
    });
    response.send(filter);
})

router.post("/add", async (request: Request, response: Response) => {
    CategorySchema.insertMany(request.body);
    response.send("hit");
})

router.post("/upload", multer().single("file"), async (request: Request, response: Response) => {

    const {
        file,
        body: { }
    } = request;

    fs.writeFile(__dirname + "/images/products/" + file?.originalname ?? new Date().toLocaleString(), file?.buffer ?? "", (err) => {
        if (err) {
            console.error(err);
            response.send(err);
        } else {
            if (request.body.catid !== undefined) {
                const catid = new Types.ObjectId(request.body.catid);
                ProductSchema.insertMany({ 
                    name: request.body.name, 
                    Category: catid, image: file?.originalname ?? "", 
                    price: request.body.price 
                });
                response.send("File Upload Successful");
            } else {
                response.send("Uh-Oh! Please check the corresponding category ID");
            }
        };
    })
});

export default router;