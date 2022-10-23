import { Router } from "express";

import orderControllers from "../controllers/order";

import isAuth from "../middleware/is-auth";

const router: Router = Router();

// get all orders admin
router.get("/list", isAuth, orderControllers.getOrderList);

// get order who login
router.get("/", isAuth, orderControllers.getOrders);

// turn cart into order
router.post("/", isAuth, orderControllers.postOrder);

export default router;
