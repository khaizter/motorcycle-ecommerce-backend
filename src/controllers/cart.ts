import { Request, Response, NextFunction } from "express";

import mongoose from "mongoose";

import Cart from "../models/cart";
import throwError from "../utils/throwError";

const getCart = async (req: any, res: Response, next: NextFunction) => {
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

const updateCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body;
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cart = await Cart.findOne({ owner: userObjectId });

    if (!cart) {
      return throwError("Cart not found", 400);
    }

    const transformedItems = items.map((item: any) => {
      return {
        ...item,
        productId: new mongoose.Types.ObjectId(item.productId),
      };
    });

    cart.items = transformedItems;

    const cartResult = await cart.save();

    return res
      .status(200)
      .json({ message: "update cart", updatedCart: cartResult });
  } catch (err) {
    return next(err);
  }
};

export default { getCart, updateCart };
