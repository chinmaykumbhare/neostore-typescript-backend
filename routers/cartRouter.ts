import { Request, Response, Router } from "express";
import CartSchema from "../schemas/CartSchema";

const router = Router();

/**
 * Cart -> getCartItems, add to cart, remove from cart
 */

router.get("/", async (request: Request, response: Response) => {
    if (request.body.userip === undefined) {
        let cart = await CartSchema.findOne({ ip: request.body.userip });
        response.send(cart);

    } else {
        let cart = await CartSchema.findOne({ User: request.body.userid });
        response.send(cart);
    }
})

router.post("/", async (request: Request, response: Response) => {

    if (request.body.userip) {
        const isPresent = await CartSchema.find({ ip: request.body.userip });
        if (isPresent.length) {
            let status = await CartSchema.updateOne({
                ip: request.body.userip
            }, { Cart: request.body.Cart });
            response.send(status);
        } else {
            let status = await CartSchema.insertMany({
                ip: request.body.userip,
                Cart: request.body.Cart
            });
            response.send(status);
        }
    } else {
        const isPresent = await CartSchema.find({ User: request.body.userid });
        if (isPresent.length) {
            let status = await CartSchema.updateOne({
                User: request.body.userid
            }, { Cart: request.body.Cart });
            response.send(status);
        } else {
            let status = await CartSchema.insertMany({
                User: request.body.userid,
                Cart: request.body.Cart
            });
            response.send(status);
        }
    }
})

export {router as cartRouter};