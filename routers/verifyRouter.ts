import { Response, Request, Router } from "express";
import { verify } from "jsonwebtoken";
const router = Router();

router.post("/", async (request: Request, response: Response) => {
    const token = request.body.token;
    const decodedData = verify(token, process.env.PASSWORD_HASHED_KEY || "");
    response.send(decodedData);
})

export {router as verifyRoute};