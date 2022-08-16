import { Router, NextFunction, Request, Response } from "express";

import cartControllers from "../controllers/cart";

const router: Router = Router();

// get cart
router.get("/", cartControllers.getCart);

export default router;
