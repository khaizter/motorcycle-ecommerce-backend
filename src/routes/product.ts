import { Router, NextFunction, Request, Response } from "express";

import productControllers from "../controllers/product";

import isAuth from "../middleware/is-auth";

const router: Router = Router();

// get products
router.get("/", productControllers.getProducts);

// post product - add product
router.post("/", productControllers.postProduct);

export default router;
