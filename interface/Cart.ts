import { Document, SchemaDefinitionProperty, Types } from "mongoose";

export default interface Cart extends Document {
    User: Types.ObjectId,
    ip: string,
    Cart: SchemaDefinitionProperty<ArrayConstructor>
}