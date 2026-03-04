import { db } from "./index";
import { eq } from "drizzle-orm";

import { users,products,comments,type NewComment,type NewUser,type NewProduct } from "./schema";

//User Queries
export const createUser = async (data: NewUser) => {
    const [user] = await db.insert(users).values(data).returning();
    return user;
}

export const getUserById = async (id: string) => {
    return db.query.users.findFirst({
        where: eq(users.id , id)
    });
}

export const updateUser = async (id: string, data: Partial<NewUser>) => {
    const existingUser = await getUserById(id);
    if(!existingUser){
        throw new Error("User not found");
    }
    const [user] = await db.update(users).set(data).where(eq(users.id , id)).returning();
    return user;
}

//upsertUser is a function that will either create a new user if the user does not exist, or update the existing user if it does exist. 
// It first checks if a user with the given id exists, and if it does, it updates the user with the new data. 
// If it does not exist, it creates a new user with the provided data.
export const upsertUser = async (data: NewUser) => {
        const [user] = await db.insert(users).values(data).onConflictDoUpdate({
            target: users.id,
            set: data
        }). returning();

        return user;
}

export const deleteUser = async (id: string) => {
    await db.delete(users).where(eq(users.id , id));
}


//Product Queries
export const createProduct = async (data: NewProduct) => {
    const [product] = await db.insert(products).values(data).returning();
    return product;
}

export const getAllProducts = async () => {
    return db.query.products.findMany({
        with:{user:true},
        orderBy: (products, {desc})=>[desc(products.createdAt)]//desc means descending order, so the most recently created products will be returned first.
        //square brackets are used to return an array of products, even if there is only one product that matches the query.
    });
}

export const getProductById = async (id: string) => {
    return db.query.products.findFirst({
        where: eq(products.id , id),
        with:{
            user:true, 
            comments:{
                with:{user:true},
                orderBy: (comments, {desc})=>[desc(comments.createdAt)]
            }}
    });
}

export const getProductsByUserId = async (userId: string) => {
    return db.query.products.findMany({
        where: eq(products.userId , userId),
        with:{user:true},
        orderBy: (products, {desc})=>[desc(products.createdAt)]
    });
}

export const updateProduct = async (id: string, data: Partial<NewProduct>) => {
    const existingProduct = await getProductById(id);
    if(!existingProduct){
        throw new Error("Product not found");
    }
    const [product] = await db.update(products).set(data).where(eq(products.id , id)).returning();
    return product;
}

export const deleteProduct = async (id: string) => {
    const existingProduct = await getProductById(id);
    if(!existingProduct){
        throw new Error("Product not found");
    }
    await db.delete(products).where(eq(products.id , id));
}

//Comment Queries
export const createComment = async (data: NewComment) => {
    const [comment] = await db.insert(comments).values(data).returning();
    return comment;
}

export const deleteComment = async (id: string) => {
    const existingComment = await getCommentById(id);
    if(!existingComment){
        throw new Error("Comment not found");
    }
    await db.delete(comments).where(eq(comments.id , id));
}

export const getCommentById = async (id: string) => {
    return db.query.comments.findFirst({
        where: eq(comments.id , id),
        with:{user:true}
    });
}