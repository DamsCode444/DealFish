import { Router } from "express";
import { syncUser } from "../controller/userController";
import { requireAuth } from "@clerk/express";

const router = Router();

///api/user/sync POST - Sync user data from Clerk to our database
router.post("/sync",requireAuth,syncUser)

export default router;