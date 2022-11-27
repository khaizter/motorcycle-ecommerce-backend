import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

import User from "../models/user";
import Cart from "../models/cart";
import mongoose from "mongoose";
import throwError from "../utils/throwError";

const accessTokenKey = process.env.ACCESS_TOKEN_KEY as string;
const refreshTokenKey = process.env.REFRESH_TOKEN_KEY as string;

const postSignup = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name, homeAddress, contactNumber } = req.body;

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
      type: "customer",
      homeAddress,
      deliveryAddress: homeAddress,
      contactNumber,
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
        name: userResult.name,
        type: userResult.type,
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
      type: existingUser?.type,
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
        name: existingUser!.name,
        type: existingUser!.type,
      },
      accessTokenKey,
      {
        expiresIn: "2h",
      }
    );

    res.status(202).json({
      message: "Login success.",
      token: token,
      userName: existingUser?.name,
      userId: existingUser?._id,
      type: existingUser?.type,
    });
  } catch (err) {
    next(err);
  }
};

const checkToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");
  try {
    if (!authHeader) {
      throwError("Not authenticated.", 401);
    }
    const token = authHeader!.split(" ")[1] as string;

    // verify and decode token
    const decodedToken: any = await jwt.verify(token, accessTokenKey);
    if (!decodedToken) {
      throwError("Not authenticated.", 401);
    }
    res.status(200).json({
      message: "Verified token",
    });
  } catch (err) {
    return next(err);
  }
};

const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    // const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { _id: userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      throwError("Invalid token.", 404);
    }
    return res.status(200).json({
      message: "get user",
      user: user,
    });
  } catch (err) {
    return next(err);
  }
};

export default { postSignup, postLogin, checkToken, getUser };
