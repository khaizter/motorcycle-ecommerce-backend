import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

import User from "../models/user";
import Cart from "../models/cart";
import mongoose from "mongoose";
import throwError from "../utils/throwError";

const accessTokenKey = process.env.ACCESS_TOKEN_KEY as string;
const refreshTokenKey = process.env.REFRESH_TOKEN_KEY as string;
const resetTokenKey = process.env.RESET_TOKEN_KEY as string;

const postSignup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      email,
      password,
      name,
      homeAddress,
      contactNumber,
      recoveryQuestion,
      recoveryAnswer,
    } = req.body;

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
      recoveryQuestion,
      recoveryAnswer,
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
      type: userResult?.type,
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

const checkEmail = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return throwError("User with email doesn't exist", 404);
    }

    return res.status(200).json({
      message: "User account found",
      userId: user._id,
    });
  } catch (err) {
    return next(err);
  }
};

const checkRecovery = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId, recoveryQuestion, recoveryAnswer } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return throwError("User not found", 404);
    }

    if (
      recoveryQuestion !== user?.recoveryQuestion ||
      recoveryAnswer !== user?.recoveryAnswer
    ) {
      return throwError("Recovery information doesn't match", 400);
    }

    // generate jwt reset token
    const token = jwt.sign(
      {
        userId: user!._id,
      },
      resetTokenKey,
      {
        expiresIn: "4h",
      }
    );

    return res.status(200).json({
      message: "Recovery information match",
      token: token,
    });
  } catch (err) {
    return next(err);
  }
};

const resetPassword = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;
    const decodedToken: any = await jwt.verify(token, resetTokenKey);
    if (!decodedToken) {
      throwError("Token expired", 401);
    }
    const { userId } = decodedToken;
    const user = await User.findById(userId);
    if (!user) {
      return throwError("User not found", 404);
    }

    user.password = newPassword;
    const userResult = user.save();

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (err) {
    next(err);
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
  checkEmail,
  checkRecovery,
  resetPassword,
};
