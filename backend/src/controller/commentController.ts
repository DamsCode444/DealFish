import type {Request,Response} from "express"
import * as queries from "../db/queries"
import { getAuth } from "@clerk/express"


export const createComment = async (req:Request,res:Response) => {
    try {
        const {userId} = getAuth(req)
        if(!userId) return res.status(401).json({success:false,message:"Unauthorized"})
       
        const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId
        const {content} = req.body

        if(!content) return res.status(400).json({success:false,message:"Content is required"})

        const newComment = await queries.createComment({
            content,
            productId,
            userId
        })
        res.status(201).json({success:true,message:"Comment created successfully",data:newComment})
    } catch (error) {
        console.error("Error creating comment:", error)
        return res.status(500).json({success:false,message:"Internal Server Error"})
    }   
}

export const deleteComment = async (req:Request,res:Response) => {
    try {
        const {userId} = getAuth(req)
        if(!userId) return res.status(401).json({success:false,message:"Unauthorized"})
        
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
        const comment = await queries.getCommentById(id)
        if(!comment) return res.status(404).json({success:false,message:"Comment not found"})
        if(comment.userId !== userId) return res.status(403).json({success:false,message:"Forbidden"})
        
        await queries.deleteComment(id)
        res.status(200).json({success:true,message:"Comment deleted successfully"})
    } catch (error) {
        console.error("Error deleting comment:", error)
        return res.status(500).json({success:false,message:"Internal Server Error"})
    }   
}