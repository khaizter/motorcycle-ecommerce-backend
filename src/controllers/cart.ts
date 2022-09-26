import { Request, Response, NextFunction } from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import mongoose from "mongoose";

import Cart from "../models/cart";
import throwError from "../utils/throwError";
import s3 from "../services/s3-bucket";

const bucketName = process.env.BUCKET_NAME;

const getCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cart = await Cart.findOne({ owner: userObjectId });

    if (!cart) {
      throwError("Cart not found", 400);
    }

    const mappedItems = await Promise.all(
      cart!.items.map(async (item) => {
        const getObjectParams = {
          Bucket: bucketName,
          Key: item.imageKey as string,
        };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        return {
          productId: item.productId,
          imageKey: item.imageKey,
          imageUrl: url,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        };
      })
    );

    const transformedCart = {
      _id: cart?._id,
      items: mappedItems,
      owner: cart?.owner,
    };
    return res
      .status(200)
      .json({ message: "here's the cart", cart: transformedCart });
  } catch (err) {
    console.log(err);
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
    console.log("update cart", err);
    return next(err);
  }
};

export default { getCart, updateCart };
