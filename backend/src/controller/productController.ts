import type {Request,Response,NextFunction} from "express"
import * as queries from "../db/queries"
import { getAuth } from "@clerk/express"


//get all products(public)
export const getAllProducts = async (req:Request,res:Response,next:NextFunction) => {
    try {
        const { search } = req.query;
        let products;
        
        if (search && typeof search === "string") {
            products = await queries.searchProducts(search);
        } else {
            products = await queries.getAllProducts();
        }

        res.status(200).json({success:true,message:"Products retrieved successfully",data:products})
    } catch (error) {
        next(error)
    }   
}

//get product by current user(protected)
export const getProductsByCurrentUser = async (req:Request,res:Response,next:NextFunction) => {
    try {
        const {userId} = getAuth(req)
        if(!userId) return res.status(401).json({success:false,message:"Unauthorized"})
        const products = await queries.getProductsByUserId(userId)
        res.status(200).json({success:true,message:"Products retrieved successfully",data:products})
    } catch (error) {
        next(error)
    }
}

//get single product by id(public)
export const getProductById = async (req:Request,res:Response,next:NextFunction) => {
    try {
        const {id} = req.params
        const idString = Array.isArray(id) ? id[0] : id
        const product = await queries.getProductById(idString)
        if(!product) return res.status(404).json({success:false,message:"Product not found"})
        res.status(200).json({success:true,message:"Product retrieved successfully",data:product})
    } catch (error) {
        next(error)
    }
}


//create product(protected)
export const createProduct = async (req:Request,res:Response,next:NextFunction) => {
    try {
        const {userId} = getAuth(req)
        if(!userId) return res.status(401).json({success:false,message:"Unauthorized"})
        const {title,description,imageUrls,price} = req.body
        if(!title || !description || !price) return res.status(400).json({success:false,message:"Title, description, and price are required"})
        const newProduct = await queries.createProduct({
            title,
            description,
            imageUrls,
            price,
            userId
        })
        res.status(201).json({success:true,message:"Product created successfully",data:newProduct})
    } catch (error) {
        next(error)
    }
}


//Update product(protected)(owner only)
export const updateProduct = async (req:Request,res:Response,next:NextFunction) => {
    try {
        const {userId} = getAuth(req)
        if(!userId) return res.status(401).json({success:false,message:"Unauthorized"})
        const {id} = req.params
        const idString = Array.isArray(id) ? id[0] : id
        const existingProduct = await queries.getProductById(idString)
        if(!existingProduct) return res.status(404).json({success:false,message:"Product not found"})
        if(existingProduct.userId !== userId) return res.status(403).json({success:false,message:"Forbidden"})
        const {title,description,imageUrls,price} = req.body
        if(!title || !description || !price) return res.status(400).json({success:false,message:"Title, description, and price are required"})
        const updatedProduct = await queries.updateProduct(idString,{
            title,
            description,
            imageUrls,
            price
        })
        res.status(200).json({success:true,message:"Product updated successfully",data:updatedProduct})
    } catch (error) {
        next(error)
    }
}

//Delete product(protected)(owner only)
export const deleteProduct = async (req:Request,res:Response,next:NextFunction) => {
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
        next(error)
    }
}