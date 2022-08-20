import { Router, NextFunction, Request, Response } from "express";

import authControllers from "../controllers/auth";

const router: Router = Router();

// signup
router.post("/signup", authControllers.postSignup);

// login
router.post("/login", authControllers.postLogin);

// refresh token
router.post("/refresh-token");

export default router;
