import { Router } from "express";
import * as orderController from "../controller/orderController";
import { requireAuth } from "@clerk/express";

const router = Router();

router.get("/", requireAuth, orderController.getOrders);
router.get("/seller", requireAuth, orderController.getSellerOrders);
router.post("/create-from-cart", requireAuth, orderController.createOrderFromCart);
router.patch("/item/:id/status", requireAuth, orderController.updateItemStatus);
router.patch("/item/:id/confirm", requireAuth, orderController.confirmReceipt);

export default router;
