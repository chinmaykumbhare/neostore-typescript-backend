import {Document, Types} from "mongoose";

export default interface Product extends Document {
    name: string,
    Category: Types.ObjectId,
    image: string,
    price: number
}