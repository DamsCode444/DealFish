import type { Request, Response, NextFunction } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
        const items = await queries.getCartItems(userId);
        res.status(200).json({ success: true, message: "Cart retrieved successfully", data: items });
    } catch (error) {
        next(error);
    }
}

export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
        
        const { productId, quantity = 1 } = req.body;
        if (!productId) return res.status(400).json({ success: false, message: "Product ID is required" });

        const product = await queries.getProductById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        // User cannot add their own product
        if (product.userId === userId) {
            return res.status(400).json({ success: false, message: "You cannot add your own product to the cart" });
        }

        const existingItem = await queries.getCartItemByProduct(userId, productId);
        if (existingItem) {
            const updated = await queries.updateCartItem(existingItem.id, existingItem.quantity + quantity);
            return res.status(200).json({ success: true, message: "Cart item updated", data: updated });
        }

        const newItem = await queries.addToCart({ userId, productId, quantity });
        res.status(201).json({ success: true, message: "Item added to cart", data: newItem });
    } catch (error) {
        next(error);
    }
}

export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
        
        const id = req.params.id as string;
        const { quantity } = req.body;
        
        if (quantity < 1) {
             await queries.removeFromCart(id);
             return res.status(200).json({ success: true, message: "Item removed from cart" });
        }

        const updated = await queries.updateCartItem(id, quantity);
        res.status(200).json({ success: true, message: "Cart item updated", data: updated });
    } catch (error) {
        next(error);
    }
}

export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
        
        const id = req.params.id as string;
        await queries.removeFromCart(id);
        res.status(200).json({ success: true, message: "Item removed from cart" });
    } catch (error) {
        next(error);
    }
}
