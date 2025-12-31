import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createPaypalOrder, capturePaypalOrder, createStripeSession, confirmStripePayment } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-paypal-order", protectRoute, createPaypalOrder);
router.post("/capture-paypal-order", protectRoute, capturePaypalOrder);
router.post("/create-stripe-session", protectRoute, createStripeSession);
router.post("/confirm-stripe-payment", protectRoute, confirmStripePayment);

export default router;
