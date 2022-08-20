import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

import User from "../models/user";
import Cart from "../models/cart";

import throwError from "../utils/throwError";

const accessTokenKey = process.env.ACCESS_TOKEN_KEY as string;
const refreshTokenKey = process.env.REFRESH_TOKEN_KEY as string;

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

    // generate jwt
    const token = jwt.sign(
      {
        userId: userResult!._id,
      },
      accessTokenKey,
      {
        expiresIn: "2h",
      }
    );

    return res.status(201).json({
      message: "User created.",
      token: token,
      userName: userResult.name,
      userId: userResult._id,
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

    // generate jwt
    const token = jwt.sign(
      {
        userId: existingUser!._id,
      },
      accessTokenKey,
      {
        expiresIn: "2h",
      }
    );

    res.status(202).json({
      message: "Login success.",
      token: token,
      userName: existingUser!.name,
      userId: existingUser!._id,
    });
  } catch (err) {
    next(err);
  }
};

export default { postSignup, postLogin };
