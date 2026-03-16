import { Router } from "express";
import * as paymentController from "../controller/paymentController";
import { requireAuth } from "@clerk/express";

const router = Router();

router.post("/create-checkout-session", requireAuth, paymentController.createCheckoutSession);

export default router;
