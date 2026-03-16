import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const products = pgTable("products", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    imageUrls: text("image_urls").array().notNull().default([]),
    currency: text("currency").notNull().default("CNY"),
    price: text("price").notNull(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

export const comments = pgTable("comments", {
    id: uuid("id").defaultRandom().primaryKey(),
    content: text("content").notNull(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

export const cartItems = pgTable("cart_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow().$onUpdate(() => new Date()),
})

export const orders = pgTable("orders", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    totalAmount: integer("total_amount").notNull(),
    shippingAddress: text("shipping_address"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow().$onUpdate(() => new Date()),
})

export const orderItems = pgTable("order_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    priceAtPurchase: integer("price_at_purchase").notNull(),
    status: text("status", { enum: ["paid", "processing", "packing", "shipped", "delivering", "delivered", "received"] }).notNull().default("paid"),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow().$onUpdate(() => new Date()),
})

//Relations defines how tables are related to each other, it is used to generate the correct SQL queries when we want to fetch related data.

export const usersRelations = relations(users, ({ many }) => ({
    products: many(products), //one user can have many products
    comments: many(comments),//one user can have many comments
    cartItems: many(cartItems), //one user can have many items in their cart
    orders: many(orders),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
    //fields: the foreign key in the products table that is referencing the users table, in this case, it's userId
    //references:the primary key in the users table that is being referenced, in this case, it's id
    user: one(users, { fields: [products.userId], references: [users.id] }), //one product belongs to one user
    comments: many(comments), //one product can have many comments
    cartItems: many(cartItems), //one product can be in many users' carts
    orderItems: many(orderItems),
}))

// Add this missing relation
export const commentsRelations = relations(comments, ({ one }) => ({
    product: one(products, { fields: [comments.productId], references: [products.id] }),
    user: one(users, { fields: [comments.userId], references: [users.id] }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
    user: one(users, { fields: [cartItems.userId], references: [users.id] }),
    product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users, { fields: [orders.userId], references: [users.id] }),
    items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
    product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

//InferSelect is a utility type provided by Drizzle ORM that infers the TypeScript type of the selected data based on the table definition. 
// It allows us to get the correct types for our queries without having to manually define them.
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;