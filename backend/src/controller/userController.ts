import type {Request,Response} from "express"
import * as queries from "../db/queries"
import { getAuth } from "@clerk/express"


export async function syncUser(req:Request,res:Response){

    try {
        const {userId} = getAuth(req)
        if(!userId) return res.status(401).json({success:false,message:"Unauthorized"})
        
            const {email,name,imageUrl} = req.body
            if(!email || !name || !imageUrl) return res.status(400).json({success:false,message:"Email, name, and image URL are required"})

        // Upsert user data into our database
        const user = await queries.upsertUser({
            id:userId,
            email,
            name,
            imageUrl
        })
        res.status(200).json({success:true,message:"User synced successfully",data:user})
    } catch (error) {
        console.error("Error syncing user:", error)
        return res.status(500).json({success:false,message:"Internal Server Error"})
    }

}