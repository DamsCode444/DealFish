import type { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { ENV } from "../config/env";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY as string);

// Stripe minimum amounts by currency (in the smallest unit, e.g., cents/yen)
const STRIPE_MIN_AMOUNTS: Record<string, number> = {
    USD: 50,
    CNY: 50,   // Stripe's minimum for CNY is 0.50
    JPY: 50,
    EUR: 50,
    GBP: 30,
    CAD: 50,
    AUD: 50,
};

export const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);
        console.log("Creating checkout session for user:", userId);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const cartItems = await queries.getCartItems(userId);
        if (cartItems.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        // Use the currency of the first product (Stripe sessions must be single-currency)
        const currency = (cartItems[0].product?.currency || "CNY").toUpperCase();
        const isZeroDecimal = ["JPY", "KRW", "VND"].includes(currency);

        const lineItems = cartItems.map((item: any) => {
            if (!item.product) {
                throw new Error("Product data missing for cart item");
            }

            const price = parseFloat(item.product.price);
            if (isNaN(price)) {
                throw new Error(`Invalid price for product: ${item.product.title}`);
            }

            // Ensure all items in cart have the same currency for Stripe
            if ((item.product.currency || "CNY").toUpperCase() !== currency) {
                throw new Error(`Multiple currencies in cart detected. Stripe checkout requires all items to be in the same currency (${currency}).`);
            }

            const images = (item.product.imageUrls || [])
                .filter((url: any) => typeof url === "string" && url.trim().length > 0);

            const productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData = {
                name: item.product.title,
            };

            if (images.length > 0) {
                const firstImage = images[0];
                if (firstImage.startsWith('http')) {
                    productData.images = [firstImage];
                }
            }

            const unitAmount = isZeroDecimal ? Math.round(price) : Math.round(price * 100);

            return {
                price_data: {
                    currency: currency.toLowerCase(),
                    product_data: productData,
                    unit_amount: unitAmount,
                },
                quantity: item.quantity,
            };
        });

        const totalAmount = lineItems.reduce((sum: number, item: any) => sum + (item.price_data.unit_amount * item.quantity), 0);
        
        // Minimum amount validation
        const minAmount = STRIPE_MIN_AMOUNTS[currency] || 50; 
        if (totalAmount < minAmount) {
            const displayMin = currency === "JPY" ? minAmount : minAmount / 100;
            return res.status(400).json({ 
                success: false, 
                message: `Total amount must be at least ${displayMin} ${currency} for Stripe payments.` 
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${ENV.FRONTEND_URL}/success`,
            cancel_url: `${ENV.FRONTEND_URL}/cart`,
            shipping_address_collection: {
                allowed_countries: ["US", "CA", "CN", "HK", "JP", "GB", "AU", "DE", "FR", "IN", "SG"], // Limit to major countries to avoid API limits
            },
            billing_address_collection: "required",
            metadata: {
                userId,
                items: JSON.stringify(cartItems.map((item: any) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    priceAtPurchase: parseFloat(item.product.price)
                })))
            },
        } as any);

        res.status(200).json({ success: true, url: session.url });
    } catch (error: any) {
        console.error("[PaymentController] CRITICAL ERROR In createCheckoutSession:", {
            errorMessage: error.message,
            errorObject: error,
            userId: getAuth(req).userId,
            stack: error.stack
        });
        res.status(500).json({ 
            success: false, 
            message: "Internal server error during payment processing",
            details: error.message 
        });
    }
};

export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = ENV.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
        console.error("[Webhook] Missing signature or webhook secret");
        return res.status(400).send("Webhook Error: Missing signature or secret");
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`[Webhook] Signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const itemsStr = session.metadata?.items;

                if (!userId || !itemsStr) {
                    console.error("[Webhook] Missing metadata in session:", session.id);
                    break;
                }

                const items = JSON.parse(itemsStr);
                const totalAmount = session.amount_total ? session.amount_total : 0;

                // Extract shipping address (use any to bypass type check if property name changed or types are outdated)
                const shipping = (session as any).shipping_details;
                let addressStr = "";
                if (shipping && shipping.address) {
                    const addr = shipping.address;
                    addressStr = [
                        shipping.name,
                        addr.line1,
                        addr.line2,
                        addr.city,
                        addr.state,
                        addr.postal_code,
                        addr.country
                    ].filter(Boolean).join(", ");
                }

                console.log(`[Webhook] Fulfilling order for user ${userId}, session ${session.id}. Address: ${addressStr}`);

                await queries.createOrder(userId, totalAmount, items, addressStr);
                break;
            }
            default:
                console.log(`[Webhook] Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (error: any) {
        console.error("[Webhook] Error processing event:", error);
        res.status(500).send("Internal Server Error");
    }
};
