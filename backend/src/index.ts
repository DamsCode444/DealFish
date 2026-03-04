import express from "express";
import { ENV } from "./config/env";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'

import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import commentRoutes from "./routes/commentRoutes";



const app = express()
app.use(cors({origin:ENV.FRONTEND_URL}))// Enable CORS for all routes
app.use(clerkMiddleware())// Adds Clerk authentication state and methods to the request object
app.use(express.json()) //parse JSON bodies (as sent by API clients)    
app.use(express.urlencoded({extended:true}))//parse urlencoded bodies (like HTML form submits)



app.get("/",(req,res)=>
    {
        res.json({success:true,message:"Welcome to Productify API"})
    })


app.use("/api/users",userRoutes)
app.use("/api/product",productRoutes)
app.use("/api/comments",commentRoutes)



app.listen(ENV.PORT,()=> console.log("Server is running on port "+ENV.PORT))