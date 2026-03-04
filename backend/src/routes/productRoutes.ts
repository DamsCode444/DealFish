import { Router } from "express";
import * as productController from "../controller/productController"
import { requireAuth } from "@clerk/express";

const router = Router()

//GET /api/products => get all products ->public route
router.get("/",productController.getAllProducts)

//GET /api/products/my => get products of current user ->protected route
router.get("/my",requireAuth,productController.getProductsByCurrentUser)

//GET /api/products/:id => get single product by id ->public route
router.get("/:id",productController.getProductById)

//POST /api/products => create new product ->protected route
router.post("/",requireAuth,productController.createProduct)

//PUT /api/products/:id => update product by id ->protected route
router.put("/:id",requireAuth,productController.updateProduct)

//DELETE /api/products/:id => delete product by id ->protected route
router.delete("/:id",requireAuth,productController.deleteProduct)

export default router;