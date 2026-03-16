import type { Request, Response, NextFunction } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";
import { db } from "../db";
import { orderItems } from "../db/schema";
import { eq } from "drizzle-orm";

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const orders = await queries.getOrdersByUserId(userId);
        res.status(200).json({ success: true, message: "Orders retrieved successfully", data: orders });
    } catch (error) {
        next(error);
    }
}

export const createOrderFromCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const cartItems = await queries.getCartItems(userId);
        if (cartItems.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const totalAmount = cartItems.reduce((acc, item) => acc + (parseFloat(item.product.price) * item.quantity), 0);
        
        const items = cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: Math.round(parseFloat(item.product.price))
        }));

        const order = await queries.createOrder(userId, Math.round(totalAmount), items);
        
        res.status(201).json({ success: true, message: "Order created successfully", data: order });
    } catch (error) {
        next(error);
    }
}

export const confirmReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const { id } = req.params; // Item ID
        const idString = Array.isArray(id) ? id[0] : id;
        
        // We need to verify that the buyer of the order this item belongs to is the current user
        const orderItem = await db.query.orderItems.findFirst({
            where: eq(orderItems.id, idString),
            with: { order: true }
        });

        if (!orderItem) return res.status(404).json({ success: false, message: "Order item not found" });
        if (orderItem.order.userId !== userId) return res.status(403).json({ success: false, message: "Forbidden" });

        const updatedItem = await queries.updateOrderItemStatus(idString, "received");
        res.status(200).json({ success: true, message: "Item marked as received", data: updatedItem });
    } catch (error) {
        next(error);
    }
}

export const getSellerOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const orders = await queries.getOrdersForSeller(userId);
        res.status(200).json({ success: true, message: "Seller orders retrieved successfully", data: orders });
    } catch (error) {
        next(error);
    }
}

export const updateItemStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const { id } = req.params; // Item ID
        const { status } = req.body;
        const idString = Array.isArray(id) ? id[0] : id;

        // Verify seller owns the product
        const orderItem = await db.query.orderItems.findFirst({
            where: eq(orderItems.id, idString),
            with: { product: true }
        });

        if (!orderItem) return res.status(404).json({ success: false, message: "Order item not found" });
        if (orderItem.product.userId !== userId) return res.status(403).json({ success: false, message: "Forbidden" });

        const updatedItem = await queries.updateOrderItemStatus(idString, status);
        res.status(200).json({ success: true, message: "Item status updated", data: updatedItem });
    } catch (error) {
        next(error);
    }
}
