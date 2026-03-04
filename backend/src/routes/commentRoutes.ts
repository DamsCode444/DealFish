import { Router } from "express";
import * as commentController from "../controller/commentController"
import { requireAuth } from "@clerk/express";

const router = Router()
//POST /api/comments/:productId => create new comment for a product ->protected route
router.post("/:productId",requireAuth,commentController.createComment)

//DELETE /api/comments/:commentId => delete comment by id ->protected route
router.delete("/:id",requireAuth,commentController.deleteComment)


export default router;