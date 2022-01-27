import multer from "multer";
import { Router, Request, Response } from "express";
import fs from "fs";
const router = Router();

router.post("/update", multer().single("file"), async (request: Request, response: Response) => {

    const {
        file,
        body: { }
    } = request;

    const fileName = request.body.id + ".jpg";

    if (fileName !== undefined) {
        fs.writeFile(__dirname + "/images/users/" + fileName, file?.buffer ?? "", (err) => {
            if (err) {
                throw console.error(err);
                response.send(err);
            }
            response.send("file upload successful");
        })
    } else {
        response.send("file upload not successful");
    }

});

export {router as profileRoutes};