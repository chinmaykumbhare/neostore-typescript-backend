import { Router } from "express";
import { cartRouter } from "../../routers/cartRouter";
import { orderRouter } from "../../routers/orderRouter";
import { productsRouter } from "../../routers/productsRouter";
import { userRoutes } from "./userRouter";

const router = Router();

router.use("/user", userRoutes);
router.use("/products", productsRouter);
router.use("/cart", cartRouter);
router.use("/orders", orderRouter);

export { router as APIv1 };