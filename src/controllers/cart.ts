import { Request, Response, NextFunction } from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import mongoose from "mongoose";

import Cart from "../models/cart";
import Product from "../models/product";
import throwError from "../utils/throwError";
import s3 from "../services/s3-bucket";

const bucketName = process.env.BUCKET_NAME;

const getCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cart = await Cart.findOne({ owner: userObjectId });

    if (!cart) {
      // create a new cart instead
      const cart = new Cart({
        items: [],
        owner: userObjectId,
      });
      const cartResult = await cart.save();
      return res.status(200).json({
        message: "New cart created",
        cart: cartResult,
      });
    }

    const mappedItems = await Promise.all(
      cart!.items.map(async (item) => {
        const getObjectParams = {
          Bucket: bucketName,
          Key: item.imageKey as string,
        };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        const product = await Product.findById(item.productId);
        if (!product) {
          return throwError("Product not found", 404);
        }
        return {
          productId: item.productId,
          imageKey: item.imageKey,
          imageUrl: url,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          availableStocks: product.availableStocks,
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
      .json({ message: "Getting cart successful", cart: transformedCart });
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
    const transformedItems = items.map((item: any) => {
      return {
        ...item,
        productId: new mongoose.Types.ObjectId(item.productId),
      };
    });
    const cart = await Cart.findOneAndUpdate(
      { owner: userObjectId },
      { items: transformedItems }
    );

    if (!cart) {
      return throwError("Cart not found", 400);
    }
    return res.status(200).json({ message: "Cart updated", updatedCart: cart });
  } catch (err) {
    return next(err);
  }
};

export default { getCart, updateCart };
