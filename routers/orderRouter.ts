import { Request, Response, Router } from "express";
import UserSchema from "../schemas/UserSchema";

const router = Router();

/**
 * orders: place, history
 */

router.post("/", async (request: Request, response: Response) => {
    const status = await UserSchema.updateOne({ _id: request.body.userid }, {
        $push: { orders: { order: request.body.order } }
    });
    response.send(status);
});

router.get("/", async (request: Request, response: Response) => {
    if (request.body.userid !== undefined) {
        const orderData = await UserSchema.find({ _id: request.body.userid });
        response.send(orderData[0].orders);
    } else {
        response.send([]);
    }
})

export {router as orderRouter};