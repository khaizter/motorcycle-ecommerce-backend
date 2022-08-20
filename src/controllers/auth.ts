import { Request, Response, NextFunction } from "express";

import User from "../models/user";
import Cart from "../models/cart";

import throwError from "../utils/throwError";

const postSignup = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;

  try {
    // Check for existing user
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      throwError("Email already exist.", 409);
    }

    // Create user
    const user = new User({
      name: name,
      email: email,
      password: password,
    });

    const userResult = await user.save();

    // Create cart
    const cart = new Cart({
      items: [],
      owner: userResult._id,
    });

    const cartResult = await cart.save();

    return res.status(201).json({
      message: "User created.",
      data: {
        user: userResult,
        cart: cartResult,
      },
    });
  } catch (err) {
    next(err);
  }
};

const postLogin = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    // Check for existing user
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      throwError("User with email doesn't exist.", 404);
    }

    // Check password
    if (existingUser!.password !== password) {
      throwError("Invalid password.", 401);
    }

    res.status(202).json({
      message: "Login success.",
      data: {
        user: existingUser,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default { postSignup, postLogin };
