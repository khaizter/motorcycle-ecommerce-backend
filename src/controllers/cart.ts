import { Request, Response, NextFunction } from "express";

import mongoose from "mongoose";

import Cart from "../models/cart";
import throwError from "../utils/throwError";

const getCart = async (req: any, res: Response, next: NextFunction) => {
  console.log("get cart");
  try {
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cart = await Cart.findOne({ owner: userObjectId });

    if (!cart) {
      throwError("Cart not found", 400);
    }

    return res.status(200).json({ message: "here's the cart", cart });
  } catch (err) {
    next(err);
  }
};

export default { getCart };
