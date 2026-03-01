import express from "express";
import { ENV } from "./config/env";
import cors from "cors";
import { clerkMiddleware, clerkClient, requireAuth, getAuth } from '@clerk/express'




const app = express()
app.use(cors({origin:ENV.FRONTEND_URL}))// Enable CORS for all routes
app.use(clerkMiddleware())// Adds Clerk authentication state and methods to the request object
app.use(express.json()) //parse JSON bodies (as sent by API clients)    
app.use(express.urlencoded({extended:true}))//parse urlencoded bodies (like HTML form submits)



app.get("/",(req,res)=>
    {
        res.json({success:true,message:"Welcome to Productify API"})
    })


   



app.listen(ENV.PORT,()=> console.log("Server is running on port "+ENV.PORT))