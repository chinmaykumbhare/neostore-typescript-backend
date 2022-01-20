import mongoose, { Types, Schema} from "mongoose";
import Category from "../interface/Category";

const categoryModel = new Schema<Category>({
    category: {
        type: String,
        required: true
    }
})

export default mongoose.model<Category>("Category", categoryModel);