import { Router, NextFunction, Request, Response } from "express";

import cartControllers from "../controllers/cart";

const router: Router = Router();

// get cart
router.get("/", cartControllers.getCart);

// add item to cart
router.post("/add");

// remove item from cart
router.delete("/remove");

// update item from cart - for updating quantity of item
router.put("/:itemId");

export default router;
