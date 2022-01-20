"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importStar(require("mongoose"));
const dotenv_1 = require("dotenv");
const nodemailer_1 = require("nodemailer");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const ProductSchema_1 = __importDefault(require("./schemas/ProductSchema"));
const CategorySchema_1 = __importDefault(require("./schemas/CategorySchema"));
const UserSchema_1 = __importDefault(require("./schemas/UserSchema"));
const CartSchema_1 = __importDefault(require("./schemas/CartSchema"));
const pdfRouter_1 = __importDefault(require("./routers/pdfRouter"));
const categoryRouter_1 = __importDefault(require("./routers/categoryRouter"));
const server = (0, express_1.default)();
(0, dotenv_1.config)();
const upload = (0, multer_1.default)();
server.use((0, cors_1.default)());
server.use(express_1.default.static("images"));
server.use(express_1.default.static("users"));
server.use(express_1.default.static("invoice"));
server.use(express_1.default.json());
server.use(express_1.default.urlencoded({ extended: false }));
mongoose_1.default.connect("mongodb://localhost:27017/neostore", (err) => {
    if (err)
        console.error(err);
    console.log("Connected to MONGO");
});
const transporter = (0, nodemailer_1.createTransport)({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});
/**
 * USERS: Add, List -> dev, verify -> dev + prod
 */
server.post("/user", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield UserSchema_1.default.find({ username: request.body.username });
    response.send(data);
}));
server.post("/otp", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = Math.floor(Math.random() * 10000);
    const sender = yield UserSchema_1.default.find({ username: request.body.username });
    const senderEmail = sender[0].email;
    if (senderEmail !== undefined) {
        let mailBody = {
            from: "NeoSTORE Devs",
            to: senderEmail,
            subject: "NeoStore OTP",
            text: "OTP is " + otp + "\n-Team NeoSTORE"
        };
        transporter.sendMail(mailBody, (err, data) => {
            if (err)
                console.error(err);
            console.log("Email sent to " + senderEmail);
        });
    }
    response.send(otp.toString());
}));
server.post("/resetpassword", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    (0, bcrypt_1.hash)(request.body.password, 10, (err, hash) => __awaiter(void 0, void 0, void 0, function* () {
        const status = yield UserSchema_1.default.updateOne({
            username: request.body.username
        }, { password: hash });
        response.send(status);
    }));
}));
server.post("/adduser", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    (0, bcrypt_1.hash)(request.body.password, 10, (err, hash) => __awaiter(void 0, void 0, void 0, function* () {
        const status = yield UserSchema_1.default.insertMany({
            username: request.body.username,
            password: hash, seller: request.body.seller,
            email: request.body.email,
            address: request.body.address
        });
        response.send(status);
    }));
}));
server.post("/login", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield UserSchema_1.default.find({ username: request.body.username });
    if (userData.length > 0) {
        (0, bcrypt_1.compare)(request.body.password, userData[0].password, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                console.error(err);
            if (result) {
                const token = yield (0, jsonwebtoken_1.sign)({
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
        }));
    }
    else {
        response.send("error");
    }
}));
server.post("/socialuser", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield UserSchema_1.default.find({ email: request.body.email });
    if (userData.length > 0) {
        const token = yield (0, jsonwebtoken_1.sign)({
            _id: userData[0]._id,
            username: userData[0].username,
            seller: userData[0].seller,
            address: userData[0].address
        }, process.env.PASSWORD_HASHED_KEY || "", { expiresIn: '3d' });
        response.send(token);
    }
    else {
        const status = yield UserSchema_1.default.insertMany({
            username: request.body.email,
            email: request.body.email
        });
        response.send(status);
    }
}));
server.post("/verify", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const token = request.body.token;
    const decodedData = (0, jsonwebtoken_1.verify)(token, process.env.PASSWORD_HASHED_KEY || "");
    response.send(decodedData);
}));
server.post("/updatepic", upload.single("file"), (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { file, body: {} } = request;
    const fileName = request.body.id + ".jpg";
    if (fileName !== undefined) {
        fs_1.default.writeFile(__dirname + "/images/users/" + fileName, (_a = file === null || file === void 0 ? void 0 : file.buffer) !== null && _a !== void 0 ? _a : "", (err) => {
            if (err) {
                throw console.error(err);
                response.send(err);
            }
            response.send("file upload successful");
        });
    }
    else {
        response.send("file upload not successful");
    }
}));
server.post("/getaddress", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield UserSchema_1.default.find({ username: request.body.username });
    response.send(data[0].address);
}));
/**
 * Add category, products => barebone url
 */
server.post("/addcategory", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    CategorySchema_1.default.insertMany(request.body);
    response.send("hit");
}));
server.post("/upload", upload.single("file"), (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const { file, body: {} } = request;
    fs_1.default.writeFile((_b = __dirname + "/images/products/" + (file === null || file === void 0 ? void 0 : file.originalname)) !== null && _b !== void 0 ? _b : new Date().toLocaleString(), (_c = file === null || file === void 0 ? void 0 : file.buffer) !== null && _c !== void 0 ? _c : "", (err) => {
        var _a;
        if (err) {
            console.error(err);
            response.send(err);
        }
        else {
            if (request.body.catid !== undefined) {
                const catid = new mongoose_1.Types.ObjectId(request.body.catid);
                ProductSchema_1.default.insertMany({ name: request.body.name, Category: catid, image: (_a = file === null || file === void 0 ? void 0 : file.originalname) !== null && _a !== void 0 ? _a : "", price: request.body.price });
                response.send("File Upload Successful");
            }
            else {
                response.send("Uh-Oh! Please check the corresponding category ID");
            }
        }
        ;
    });
}));
/**
 * Get Products => populate category, return
 */
server.get("/products", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield ProductSchema_1.default.find({}).populate({ path: "Category", model: "Category" });
    response.send(products);
}));
server.post("/product", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const id = request.body.id;
    if (id !== undefined) {
        const product = yield ProductSchema_1.default.find({ _id: id }).populate({ path: "Category", model: "Category" });
        response.send(product);
    }
    else {
        response.send("Error!");
    }
}));
server.get("/categories", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield CategorySchema_1.default.find({});
    response.send(categories);
}));
/**
 * Cart -> getCartItems, add to cart, remove from cart
 */
server.get("/cart", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    if (request.body.userip === undefined) {
        let cart = yield CartSchema_1.default.findOne({ ip: request.body.userip });
        response.send(cart);
    }
    else {
        let cart = yield CartSchema_1.default.findOne({ User: request.body.userid });
        response.send(cart);
    }
}));
server.post("/cart", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    if (request.body.userip) {
        const isPresent = yield CartSchema_1.default.find({ ip: request.body.userip });
        if (isPresent.length) {
            let status = yield CartSchema_1.default.updateOne({
                ip: request.body.userip
            }, { Cart: request.body.Cart });
            response.send(status);
        }
        else {
            let status = yield CartSchema_1.default.insertMany({
                ip: request.body.userip,
                Cart: request.body.Cart
            });
            response.send(status);
        }
    }
    else {
        const isPresent = yield CartSchema_1.default.find({ User: request.body.userid });
        if (isPresent.length) {
            let status = yield CartSchema_1.default.updateOne({
                User: request.body.userid
            }, { Cart: request.body.Cart });
            response.send(status);
        }
        else {
            let status = yield CartSchema_1.default.insertMany({
                User: request.body.userid,
                Cart: request.body.Cart
            });
            response.send(status);
        }
    }
}));
/**
 * orders: place, history
 */
server.post("/order", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const status = yield UserSchema_1.default.updateOne({ _id: request.body.userid }, {
        $push: { orders: { order: request.body.order } }
    });
    response.send(status);
}));
server.post("/orders", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    if (request.body.userid !== undefined) {
        const orderData = yield UserSchema_1.default.find({ _id: request.body.userid });
        response.send(orderData[0].orders);
    }
    else {
        response.send([]);
    }
}));
/**
 * Filter
 */
server.use("/filter", categoryRouter_1.default);
/**
 * PDF
 */
server.use("/pdf", pdfRouter_1.default);
server.listen(8090, () => {
    console.log("server running on port 8090");
});
