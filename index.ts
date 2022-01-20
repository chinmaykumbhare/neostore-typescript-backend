import express, { Request, Response } from "express";
import cors from "cors";
import mongoose, { Error, NativeError, Types, UpdateWriteOpResult } from "mongoose";
import { config } from "dotenv";
import { createTransport } from "nodemailer";
import { compare, hash } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import multer from "multer";
import fs from "fs";

import ProductSchema from "./schemas/ProductSchema";
import CategorySchema from "./schemas/CategorySchema";
import UserSchema from "./schemas/UserSchema";
import CartSchema from "./schemas/CartSchema";
import pdfRouter from "./routers/pdfRouter";
import categoryRouter from "./routers/categoryRouter";

const server = express();
config();
const upload = multer();

server.use(cors());

server.use(express.static("images"));
server.use(express.static("users"));
server.use(express.static("invoice"));

server.use(express.json());
server.use(express.urlencoded({ extended: false }));

mongoose.connect("mongodb://localhost:27017/neostore", (err) => {
    if (err) console.error(err);
    console.log("Connected to MONGO");
});

const transporter = createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * USERS: Add, List -> dev, verify -> dev + prod
 * UTILS: OTP, Reset, Social, UpdateProfilePic
 */

server.post("/user", async (request: Request, response: Response) => {
    const data = await UserSchema.find({ username: request.body.username });
    response.send(data);
})

server.post("/otp", async (request: Request, response: Response) => {
    const otp = Math.floor(Math.random() * 10000);
    const sender = await UserSchema.find({ username: request.body.username });
    const senderEmail = sender[0].email;
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

server.post("/resetpassword", async (request: Request, response: Response) => {
    hash(request.body.password, 10, async (err, hash) => {
        const status = await UserSchema.updateOne({
            username: request.body.username
        }, { password: hash });
        response.send(status);
    })
})

server.post("/adduser", async (request: Request, response: Response) => {
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

server.post("/login", async (request: Request, response: Response) => {
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

server.post("/socialuser", async (request: Request, response: Response) => {
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

server.post("/verify", async (request: Request, response: Response) => {
    const token = request.body.token;
    const decodedData = verify(token, process.env.PASSWORD_HASHED_KEY || "");
    response.send(decodedData);
})

server.post("/updatepic", upload.single("file"), async (request: Request, response: Response) => {

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

/**
 * address -> get, add
 * get -> checkout
 * add -> myaccount
 */

server.post("/getaddress", async (request: Request, response: Response) => {
    const data = await UserSchema.find({username: request.body.username});
    response.send(data[0].address);
})

server.post("/addaddress", async (request: Request, response: Response) => {
    const status = await UserSchema.updateOne({_id: request.body.id}, {address: request.body.address});
    response.send(status);
})

/**
 * Add category, products => barebone url
 */

server.post("/addcategory", async (request: Request, response: Response) => {
    CategorySchema.insertMany(request.body);
    response.send("hit");
})

server.post("/upload", upload.single("file"), async (request: Request, response: Response) => {

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
                ProductSchema.insertMany({ name: request.body.name, Category: catid, image: file?.originalname ?? "", price: request.body.price });
                response.send("File Upload Successful");
            } else {
                response.send("Uh-Oh! Please check the corresponding category ID");
            }
        };
    })
});

/**
 * Get Products => populate category, return
 */

server.get("/products", async (request: Request, response: Response) => {
    const products = await ProductSchema.find({}).populate({ path: "Category", model: "Category" });
    response.send(products);
})

server.post("/product", async (request: Request, response: Response) => {
    const id = request.body.id;
    if (id !== undefined) {
        const product = await ProductSchema.find({ _id: id }).populate({ path: "Category", model: "Category" });
        response.send(product);
    } else {
        response.send("Error!");
    }
});

server.get("/categories", async (request: Request, response: Response) => {
    const categories = await CategorySchema.find({});
    response.send(categories);
})

/**
 * Cart -> getCartItems, add to cart, remove from cart
 */

server.get("/cart", async (request: Request, response: Response) => {
    if (request.body.userip === undefined) {
        let cart = await CartSchema.findOne({ ip: request.body.userip });
        response.send(cart);

    } else {
        let cart = await CartSchema.findOne({ User: request.body.userid });
        response.send(cart);
    }
})

server.post("/cart", async (request: Request, response: Response) => {

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

/**
 * orders: place, history
 */

server.post("/order", async (request: Request, response: Response) => {
    const status = await UserSchema.updateOne({ _id: request.body.userid }, {
        $push: { orders: { order: request.body.order } }
    });
    response.send(status);
});

server.post("/orders", async (request: Request, response: Response) => {
    if (request.body.userid !== undefined) {
        const orderData = await UserSchema.find({ _id: request.body.userid });
        response.send(orderData[0].orders);
    } else {
        response.send([]);
    }
})

/**
 * Filter
 */

 server.use("/filter", categoryRouter);

 /**
  * PDF
  */
 
 server.use("/pdf", pdfRouter);

server.listen(8090, () => {
    console.log("server running on port 8090");
})