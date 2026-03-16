import { Router } from "express";
import * as cartController from "../controller/cartController";
import { requireAuth } from "@clerk/express";

const router = Router();

router.get("/", requireAuth, cartController.getCart);
router.post("/", requireAuth, cartController.addToCart);
router.patch("/:id", requireAuth, cartController.updateCartItem);
router.delete("/:id", requireAuth, cartController.removeFromCart);

export default router;
