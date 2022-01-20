"use strict";
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
const express_1 = require("express");
const ProductSchema_1 = __importDefault(require("../schemas/ProductSchema"));
const router = (0, express_1.Router)();
router.get("/all", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield ProductSchema_1.default.find({}).populate({ path: "Category", model: "Category" });
    response.send(data);
}));
router.get("/", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(request.query.page);
    const limit = parseInt(request.query.limit);
    let queryData = request.query.category;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data = [];
    if (page === 1) {
        data = yield ProductSchema_1.default.find({}).limit(limit).populate({ path: "Category", model: "Category" });
    }
    else {
        data = yield ProductSchema_1.default.find({}).limit(limit).skip(startIndex).populate({ path: "Category", model: "Category" });
    }
    const filter = data.filter((item) => queryData.includes(item.Category.category));
    response.send(filter);
}));
exports.default = router;
