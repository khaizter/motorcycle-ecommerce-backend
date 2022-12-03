import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

import User from "../models/user";
import Cart from "../models/cart";
import mongoose from "mongoose";
import throwError from "../utils/throwError";

const accessTokenKey = process.env.ACCESS_TOKEN_KEY as string;
const refreshTokenKey = process.env.REFRESH_TOKEN_KEY as string;

const postSignup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, homeAddress, contactNumber } = req.body;
    // Check for existing user
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      throwError("Email already exist", 409);
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
        expiresIn: "4h",
      }
    );

    return res.status(201).json({
      message: "Account created",
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
  try {
    const { email, password } = req.body;
    // Check for existing user
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      throwError("User with email doesn't exist", 404);
    }

    // Check password
    if (existingUser!.password !== password) {
      throwError("Invalid password", 401);
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
        expiresIn: "4h",
      }
    );

    res.status(202).json({
      message: "Login successful",
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
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      throwError("Not authenticated", 401);
    }
    const token = authHeader!.split(" ")[1] as string;

    // verify and decode token
    const decodedToken: any = await jwt.verify(token, accessTokenKey);
    if (!decodedToken) {
      throwError("Not authenticated", 401);
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
    const { _id: userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      throwError("Invalid token", 401);
    }

    const userResult = {
      contactNumber: user?.contactNumber,
      deliveryAddress: user?.deliveryAddress,
      homeAddress: user?.homeAddress,
      email: user?.email,
      name: user?.name,
      type: user?.type,
      _id: user?._id,
    };

    return res.status(200).json({
      message: "Getting user details successful",
      user: userResult,
    });
  } catch (err) {
    return next(err);
  }
};

const updatePassword = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req?.user?._id;
    const user = await User.findById(userId);
    if (!user) {
      throwError("Unauthenticated", 404);
    }
    // check old password if valid
    if (oldPassword !== user?.password) {
      throwError("Wrong old password", 406);
    }

    user!.password = newPassword;
    const userResult = await user?.save();

    return res.status(200).json({
      message: "Password updated",
    });
  } catch (err) {
    return next(err);
  }
};

const updateContactNumber = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { newContactNumber } = req.body;
    const userId = req?.user?._id;
    const user = await User.findById(userId);
    if (!user) {
      throwError("Unauthenticated", 404);
    }

    user!.contactNumber = newContactNumber;
    const userResult = await user?.save();

    return res.status(200).json({
      message: "Contact number updated",
    });
  } catch (err) {
    return next(err);
  }
};

const updateHomeAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { newHomeAddress } = req.body;
    const userId = req?.user?._id;
    const user = await User.findById(userId);
    if (!user) {
      throwError("Unauthenticated", 404);
    }

    user!.homeAddress = newHomeAddress;
    const userResult = await user?.save();

    return res.status(200).json({
      message: "Home address updated",
    });
  } catch (err) {
    return next(err);
  }
};

const updateDeliveryAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { newDeliveryAddress } = req.body;
    const userId = req?.user?._id;
    const user = await User.findById(userId);
    if (!user) {
      throwError("Unauthenticated", 404);
    }

    user!.deliveryAddress = newDeliveryAddress;
    const userResult = await user?.save();

    return res.status(200).json({
      message: "Delivery address updated",
    });
  } catch (err) {
    return next(err);
  }
};

export default {
  postSignup,
  postLogin,
  checkToken,
  getUser,
  updatePassword,
  updateContactNumber,
  updateHomeAddress,
  updateDeliveryAddress,
};
