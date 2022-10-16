import { Router, NextFunction, Request, Response } from "express";

import productControllers from "../controllers/product";

import isAuth from "../middleware/is-auth";

const router: Router = Router();

// get products
router.get("/", productControllers.getProducts);

// get single product
router.get("/:productId", productControllers.getProduct);

// post product - add product
router.post("/", isAuth, productControllers.postProduct);

export default router;
