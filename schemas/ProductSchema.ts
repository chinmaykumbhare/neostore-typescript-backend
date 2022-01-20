import mongoose, { Types, Schema} from "mongoose";
import Product from "../interface/Product";

const productModel = new Schema<Product>({
    name: {
        type: String,
        required: true
    },
    Category: {
        type: mongoose.Types.ObjectId,
        ref: "Category"
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
})

export default mongoose.model<Product>("Products", productModel);