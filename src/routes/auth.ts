import { Router } from "express";

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

// change password
router.put("/user/password", isAuth, authControllers.updatePassword);

// change contact number
router.put("/user/contact-number", isAuth, authControllers.updateContactNumber);

// change home address
router.put("/user/home-address", isAuth, authControllers.updateHomeAddress);

// change delivery address
router.put(
  "/user/delivery-address",
  isAuth,
  authControllers.updateDeliveryAddress
);

export default router;
