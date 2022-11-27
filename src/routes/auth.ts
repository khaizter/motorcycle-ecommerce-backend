import { Router, NextFunction, Request, Response } from "express";

import authControllers from "../controllers/auth";

import isAuth from "../middleware/is-auth";

const router: Router = Router();

// signup
router.post("/signup", authControllers.postSignup);

// login
router.post("/login", authControllers.postLogin);

// check token
router.get("/check-token", authControllers.checkToken);

// get user
router.get("/user", isAuth, authControllers.getUser);

export default router;
