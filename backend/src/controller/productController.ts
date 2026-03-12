import type {Request,Response} from "express"
import * as queries from "../db/queries"
import { getAuth } from "@clerk/express"


//get all products(public)
export const getAllProducts = async (req:Request,res:Response) => {
    try {
        const products = await queries.getAllProducts()
        res.status(200).json({success:true,message:"Products retrieved successfully",data:products})
    } catch (error) {
        console.error("Error fetching products:", error)
        return res.status(500).json({success:false,message:"Internal Server Error"})
    }   
}

//get product by current user(protected)
export const getProductsByCurrentUser = async (req:Request,res:Response) => {
    try {
        const {userId} = getAuth(req)
        if(!userId) return res.status(401).json({success:false,message:"Unauthorized"})
        const products = await queries.getProductsByUserId(userId)
        res.status(200).json({success:true,message:"Products retrieved successfully",data:products})
    } catch (error) {
        console.error("Error fetching products:", error)
        return res.status(500).json({success:false,message:"Internal Server Error"})
    }
}

//get single product by id(public)
export const getProductById = async (req:Request,res:Response) => {
    try {
        const {id} = req.params
        const idString = Array.isArray(id) ? id[0] : id
        const product = await queries.getProductById(idString)
        if(!product) return res.status(404).json({success:false,message:"Product not found"})
        res.status(200).json({success:true,message:"Product retrieved successfully",data:product})
    } catch (error) {
        console.error("Error fetching product:", error)
        return res.status(500).json({success:false,message:"Internal Server Error"})
    }
}


//create product(protected)
export const createProduct = async (req:Request,res:Response) => {
    try {
        const {userId} = getAuth(req)
        if(!userId) return res.status(401).json({success:false,message:"Unauthorized"})
        const {title,description,imageUrl,price} = req.body
        if(!title || !description || !price) return res.status(400).json({success:false,message:"Title, description, and price are required"})
        const newProduct = await queries.createProduct({
            title,
            description,
            imageUrl,
            price,
            userId
        })
        res.status(201).json({success:true,message:"Product created successfully",data:newProduct})
    } catch (error) {
        console.error("Error creating product:", error)
        return res.status(500).json({success:false,message:"Internal Server Error"})
    }
}


//Update product(protected)(owner only)
export const updateProduct = async (req:Request,res:Response) => {
    try {
        const {userId} = getAuth(req)
        if(!userId) return res.status(401).json({success:false,message:"Unauthorized"})
        const {id} = req.params
        const idString = Array.isArray(id) ? id[0] : id
        const existingProduct = await queries.getProductById(idString)
        if(!existingProduct) return res.status(404).json({success:false,message:"Product not found"})
        if(existingProduct.userId !== userId) return res.status(403).json({success:false,message:"Forbidden"})
        const {title,description,imageUrl,price} = req.body
        if(!title || !description || !price) return res.status(400).json({success:false,message:"Title, description, and price are required"})
        const updatedProduct = await queries.updateProduct(idString,{
            title,
            description,
            imageUrl,
            price
        })
        res.status(200).json({success:true,message:"Product updated successfully",data:updatedProduct})
    }   catch (error) {
        console.error("Error updating product:", error)
        return res.status(500).json({success:false,message:"Internal Server Error"})
    }
}

//Delete product(protected)(owner only)
export const deleteProduct = async (req:Request,res:Response) => {
    try {
        const {userId} = getAuth(req)
        if(!userId) return res.status(401).json({success:false,message:"Unauthorized"})
        const {id} = req.params
        const idString = Array.isArray(id) ? id[0] : id
        const existingProduct = await queries.getProductById(idString)
        
        if(!existingProduct) return res.status(404).json({success:false,message:"Product not found"})   
        
        if(existingProduct.userId !== userId) return res.status(403).json({success:false,message:"Forbidden"})
        
        await queries.deleteProduct(idString)
        res.status(200).json({success:true,message:"Product deleted successfully"})
    } catch (error) {
        console.error("Error deleting product:", error)
        return res.status(500).json({success:false,message:"Internal Server Error"})
    }
}