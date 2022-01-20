import mongoose, {Types, Schema} from "mongoose";
import User from "../interface/User";
 
const userSchema = new Schema<User>({
    username: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
        required: true
    },
    password: {
        type: String,
    },
    seller: {
        type: Boolean,
        default: false
    },
    address: {
        type: Array,
        default: []
    },
    orders: {
        type: Array
    },
    email : {
        type: String,
        required: true
    }
});

export default mongoose.model<User>("users", userSchema);