import { db } from "./index";
import { eq, ilike, or, and } from "drizzle-orm";

import { users, products, comments, cartItems, orders, orderItems, type NewComment, type NewUser, type NewProduct, type NewCartItem } from "./schema";

//User Queries
export const createUser = async (data: NewUser) => {
    const [user] = await db.insert(users).values(data).returning();
    return user;
}

export const getUserById = async (id: string) => {
    return db.query.users.findFirst({
        where: eq(users.id, id)
    });
}

export const updateUser = async (id: string, data: Partial<NewUser>) => {
    const existingUser = await getUserById(id);
    if (!existingUser) {
        throw new Error("User not found");
    }
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
}

//upsertUser is a function that will either create a new user if the user does not exist, or update the existing user if it does exist. 
// It first checks if a user with the given id exists, and if it does, it updates the user with the new data. 
// If it does not exist, it creates a new user with the provided data.
export const upsertUser = async (data: NewUser) => {
    const [user] = await db.insert(users).values(data).onConflictDoUpdate({
        target: users.id,
        set: data
    }).returning();

    return user;
}

export const deleteUser = async (id: string) => {
    await db.delete(users).where(eq(users.id, id));
}


//Product Queries
export const createProduct = async (data: NewProduct) => {
    const [product] = await db.insert(products).values(data).returning();
    return product;
}

export const getAllProducts = async () => {
    return db.query.products.findMany({
        with: { user: true },
        orderBy: (products, { desc }) => [desc(products.createdAt)]//desc means descending order, so the most recently created products will be returned first.
        //square brackets are used to return an array of products, even if there is only one product that matches the query.
    });
}

export const searchProducts = async (query: string) => {
    return db.query.products.findMany({
        where: or(
            ilike(products.title, `%${query}%`),
            ilike(products.description, `%${query}%`)
        ),
        with: { user: true },
        orderBy: (products, { desc }) => [desc(products.createdAt)]
    });
}

export const getProductById = async (id: string) => {
    return db.query.products.findFirst({
        where: eq(products.id, id),
        with: {
            user: true,
            comments: {
                with: { user: true },
                orderBy: (comments, { desc }) => [desc(comments.createdAt)]
            }
        }
    });
}

export const getProductsByUserId = async (userId: string) => {
    return db.query.products.findMany({
        where: eq(products.userId, userId),
        with: { user: true },
        orderBy: (products, { desc }) => [desc(products.createdAt)]
    });
}

export const updateProduct = async (id: string, data: Partial<NewProduct>) => {
    const existingProduct = await getProductById(id);
    if (!existingProduct) {
        throw new Error("Product not found");
    }
    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return product;
}

export const deleteProduct = async (id: string) => {
    const existingProduct = await getProductById(id);
    if (!existingProduct) {
        throw new Error("Product not found");
    }
    await db.delete(products).where(eq(products.id, id));
}

//Comment Queries
export const createComment = async (data: NewComment) => {
    const [comment] = await db.insert(comments).values(data).returning();
    return comment;
}

export const deleteComment = async (id: string) => {
    const existingComment = await getCommentById(id);
    if (!existingComment) {
        throw new Error("Comment not found");
    }
    await db.delete(comments).where(eq(comments.id, id));
}

export const getCommentById = async (id: string) => {
    return db.query.comments.findFirst({
        where: eq(comments.id, id),
        with: { user: true }
    });
}

//Cart Queries
export const getCartItems = async (userId: string) => {
    return db.query.cartItems.findMany({
        where: eq(cartItems.userId, userId),
        with: { product: { with: { user: true } } },
        orderBy: (cartItems, { desc }) => [desc(cartItems.createdAt)]
    });
}

export const getCartItemByProduct = async (userId: string, productId: string) => {
    return db.query.cartItems.findFirst({
        where: and(
            eq(cartItems.userId, userId),
            eq(cartItems.productId, productId)
        )
    });
}

export const addToCart = async (data: NewCartItem) => {
    const [cartItem] = await db.insert(cartItems).values(data).returning();
    return cartItem;
}

export const updateCartItem = async (id: string, quantity: number) => {
    const [cartItem] = await db.update(cartItems)
        .set({ quantity, updatedAt: new Date() })
        .where(eq(cartItems.id, id))
        .returning();
    return cartItem;
}

export const removeFromCart = async (id: string) => {
    await db.delete(cartItems).where(eq(cartItems.id, id));
}

export const clearCart = async (userId: string) => {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

//Order Queries
export const createOrder = async (userId: string, totalAmount: number, items: { productId: string, quantity: number, priceAtPurchase: number }[], shippingAddress?: string) => {
    return await db.transaction(async (tx) => {
        const [order] = await tx.insert(orders).values({
            userId,
            totalAmount,
            shippingAddress
        }).returning();

        const orderItemsToInsert = items.map(item => ({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
            status: "paid" as const
        }));

        await tx.insert(orderItems).values(orderItemsToInsert);
        
        // Clear cart after order creation
        await tx.delete(cartItems).where(eq(cartItems.userId, userId));

        return order;
    });
}

export const getOrdersByUserId = async (userId: string) => {
    return db.query.orders.findMany({
        where: eq(orders.userId, userId),
        with: {
            items: {
                with: { product: true }
            }
        },
        orderBy: (orders, { desc }) => [desc(orders.createdAt)]
    });
}

export const updateOrderItemStatus = async (itemId: string, status: string) => {
    const [item] = await db.update(orderItems)
        .set({ status: status as any, updatedAt: new Date() })
        .where(eq(orderItems.id, itemId))
        .returning();
    return item;
}

export const getOrdersForSeller = async (sellerId: string) => {
    // We want to find order items for products that belong to this seller
    return db.query.orderItems.findMany({
        where: (orderItems, { exists }) => exists(
            db.select()
              .from(products)
              .where(and(
                  eq(products.id, orderItems.productId),
                  eq(products.userId, sellerId)
              ))
        ),
        with: {
            product: true,
            order: {
                with: { user: true }
            }
        },
        orderBy: (orderItems, { desc }) => [desc(orderItems.updatedAt)]
    });
}

export const getOrderById = async (id: string) => {
    return db.query.orders.findFirst({
        where: eq(orders.id, id),
        with: {
            items: {
                with: { product: true }
            }
        }
    });
}