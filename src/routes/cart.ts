import { Router, NextFunction, Request, Response } from "express";

import cartControllers from "../controllers/cart";

import isAuth from "../middleware/is-auth";

const router: Router = Router();

// get cart
router.get("/", isAuth, cartControllers.getCart);

// put cart
router.put("/", isAuth, cartControllers.updateCart);

export default router;
