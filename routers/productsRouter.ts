import { Request, Response, Router } from "express";
import ProductSchema from "../schemas/ProductSchema";

const router = Router();

/**
 * Get Products => populate category, return
 */

router.get("/", async (request: Request, response: Response) => {
    const products = await ProductSchema
        .find({})
        .populate({ path: "Category", model: "Category" });
    response.send(products);
})

//guard

router.post("/", async (request: Request, response: Response) => {
    const id = request.body.id;
    if (id !== undefined) {
        const product = await ProductSchema
            .find({ _id: id })
            .populate({ path: "Category", model: "Category" });
        response.send(product);
    } else {
        response.send("Error!");
    }
});

export {router as productsRouter};