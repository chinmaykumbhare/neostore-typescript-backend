import {Request, response, Response, Router} from "express";
import ProductSchema from "../schemas/ProductSchema";

const router = Router();

router.get("/all", async (request, response) => {
    const data = await ProductSchema.find({}).populate({ path: "Category", model: "Category" });
    response.send(data);
})

router.get("/", async (request: Request, response: Response) => {
    const page = parseInt(request.query.page as string);
    const limit = parseInt(request.query.limit as string);
    let queryData: any = request.query.category;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let data = [];

    if (page === 1) {
        data = await ProductSchema.find({}).limit(limit).populate({ path: "Category", model: "Category" });
    } else {
        data = await ProductSchema.find({}).limit(limit).skip(startIndex).populate({ path: "Category", model: "Category" });
    }
    const filter = data.filter((item: any) => queryData.includes(item.Category.category));
    response.send(filter);
})

export default router;