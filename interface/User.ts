import { Document, AnyArray, SchemaDefinitionProperty} from "mongoose";

export default interface User extends Document {
    username: string,
    password: string,
    seller: boolean,
    address: SchemaDefinitionProperty<ArrayConstructor>,
    orders: SchemaDefinitionProperty<ArrayConstructor>,
    email: string
}