import { Router, NextFunction, Request, Response } from "express";

import authControllers from "../controllers/auth";

const router: Router = Router();

// signup
router.post("/signup", authControllers.postSignup);

// login
router.post("/login", authControllers.postLogin);

// check token
router.get("/check-token", authControllers.checkToken);

export default router;
