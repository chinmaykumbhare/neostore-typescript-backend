import { Request, Response, Router } from "express";
import { compare, hash } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import UserSchema from "../../schemas/UserSchema";
import { createTransport, Transporter } from "nodemailer";
import { passwordRouter } from "../../routers/passwordRouter";
import { verifyRoute } from "../../routers/verifyRouter";
import {profileRoutes} from "../../routers/profileRouter";
import { addressRouter } from "../../routers/addressRouter";

const router = Router();

/**
 * USERS: Add, List -> dev, verify -> dev + prod
 * UTILS: OTP, Reset, Social, UpdateProfilePic
 */

router.get("/", async (request: Request, response: Response) => {
    const data = await UserSchema.find({ username: request.body.username });
    response.send(data);
})

router.post("/otp", async (request: Request, response: Response) => {
    const otp = Math.floor(Math.random() * 10000);
    const sender = await UserSchema.find({ username: request.body.username });
    const senderEmail = sender[0].email;
    const transporter: Transporter = createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    if (senderEmail !== undefined) {
        let mailBody = {
            from: "NeoSTORE Devs",
            to: senderEmail,
            subject: "NeoStore OTP",
            text: "OTP is " + otp + "\n-Team NeoSTORE"
        }
        transporter.sendMail(mailBody, (err, data) => {
            if (err) console.error(err);
            console.log("Email sent to " + senderEmail);
        });
    }
    response.send(otp.toString());
})

router.post("/add", async (request: Request, response: Response) => {
    hash(request.body.password, 10, async (err, hash) => {
        const status = await UserSchema.insertMany({
            username: request.body.username,
            password: hash, seller: request.body.seller,
            email: request.body.email,
            address: request.body.address
        });
        response.send(status);
    })
})

router.get("/login", async (request: Request, response: Response) => {
    const userData = await UserSchema.find({ username: request.body.username });
    if (userData.length > 0) {
        compare(request.body.password, userData[0].password, async (err, result) => {
            if (err) console.error(err);
            if (result) {
                const token = await sign({
                    _id: userData[0]._id,
                    username: userData[0].username,
                    seller: userData[0].seller,
                    address: userData[0].address
                }, process.env.PASSWORD_HASHED_KEY || "", { expiresIn: '3d' });
                response.send(token);

            }
            if (!result) {
                response.send("error");
            }
        });
    } else {
        response.send("error");
    }
})

router.post("/social", async(request: Request, response: Response) => {
    const userData = await UserSchema.find({ email: request.body.email });
    if (userData.length > 0) {
        const token = await sign({
            _id: userData[0]._id,
            username: userData[0].username,
            seller: userData[0].seller,
            address: userData[0].address
        }, process.env.PASSWORD_HASHED_KEY || "", { expiresIn: '3d' });
        response.send(token);
    } else {
        const status = await UserSchema.insertMany({
            username: request.body.email,
            email: request.body.email
        });
        response.send(status);
    }
})

router.use("/password", passwordRouter);
router.use("/verify", verifyRoute);
router.use("/profile", profileRoutes);
router.use("/address", addressRouter);

export { router as userRoutes };