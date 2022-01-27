import { hash } from "bcrypt";
import { Request, Response, Router } from "express";

import UserSchema from "../schemas/UserSchema";

const router = Router();

router.post("/reset", async(request: Request, response: Response) => {
    hash(request.body.password, 10, async (err, hash) => {
        const status = await UserSchema.updateOne({
            username: request.body.username
        }, { password: hash });
        response.send(status);
    })
});

export {router as passwordRouter};