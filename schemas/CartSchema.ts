import mongoose, {Schema} from "mongoose";
import Cart from "../interface/Cart";

const cartModel = new Schema<Cart>({
    User: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        unique: true,
        sparse: true,
        index: true
    },
    ip: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    Cart: {
        type: Array,
    }
});

export default mongoose.model<Cart>("Cart", cartModel);