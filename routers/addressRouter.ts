import { Request, Response, Router } from "express";
import UserSchema from "../schemas/UserSchema";

const router = Router();

router.get("/", async (request: Request, response: Response) => {
    const data = await UserSchema.find({ username: request.body.username });
    response.send(data[0].address);
})

router.post("/", async (request: Request, response: Response) => {
    const status = await UserSchema.updateOne({ _id: request.body.id }, { address: request.body.address });
    response.send(status);
})

export {router as addressRouter}