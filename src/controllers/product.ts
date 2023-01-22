import { Request, Response, NextFunction } from "express";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 } from "uuid";

import mongoose from "mongoose";

import Product from "../models/product";
import throwError from "../utils/throwError";
import s3 from "../services/s3-bucket";
import Cart from "../models/cart";

const bucketName = process.env.BUCKET_NAME;

const getProducts = async (req: any, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find();

    const mappedProducts = await Promise.all(
      products.map(async (product) => {
        const getObjectParams = {
          Bucket: bucketName,
          Key: product.imageKey,
        };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        return {
          _id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          availableStocks: product.availableStocks,
          imageKey: product.imageKey,
          imageUrl: url,
        };
      })
    );

    res.status(200).json({
      message: "Getting products successful",
      products: mappedProducts,
    });
  } catch (err) {
    return next(err);
  }
};

const getProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      throwError("Could not find Product ID", 404);
      return;
    }

    const getObjectParams = {
      Bucket: bucketName,
      Key: product.imageKey,
    };

    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    const mappedProduct = {
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      availableStocks: product.availableStocks,
      imageKey: product.imageKey,
      imageUrl: url,
    };

    res.status(200).json({
      message: "Getting product details successful",
      product: mappedProduct,
    });
  } catch (err) {
    return next(err);
  }
};

const postProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { name, description, price, availableStocks } = req.body;
    const { type } = req.user;
    if (type !== "admin") {
      throwError("Unauthorized", 401);
    }
    const image = req.file;
    const imageUniqueName = v4() + "-" + image.originalname;
    const params = {
      Bucket: bucketName,
      Key: imageUniqueName,
      Body: image.buffer,
      ContentType: image.mimetype,
    };

    const command = new PutObjectCommand(params);

    await s3.send(command);

    const product = new Product({
      name,
      description,
      price,
      availableStocks,
      imageKey: imageUniqueName,
    });

    const productResult = await product.save();

    res.status(200).json({ message: "Product added", product: productResult });
  } catch (err) {
    return next(err);
  }
};

const deleteProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;

    // admin check
    const { type } = req.user;
    if (type !== "admin") {
      throwError("Unauthorized", 401);
    }

    // remove from product table
    const product = await Product.findByIdAndDelete(productId);

    // remove from cart of all users cart
    const carts = await Cart.find();
    carts.forEach((cart) => {
      cart.items = cart.items.filter((item: any) => {
        return item.productId.toString() !== productId;
      });
      cart.save();
    });

    res.status(200).json({
      message: "Product deleted",
    });
  } catch (err) {
    return next(err);
  }
};

const updateProductStocks = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const { updatedStocks } = req.body;

    // admin check
    const { type } = req.user;
    if (type !== "admin") {
      throwError("Unauthorized", 401);
    }

    const product = await Product.findById(productId);

    if (!product) {
      return throwError("Product not found", 404);
    }

    product.availableStocks = updatedStocks;
    const productResult = product.save();

    res.status(200).json({
      message: "Stocks updated",
    });
  } catch (err) {
    return next(err);
  }
};

const updateProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const { name, description, price, availableStocks } = req.body;
    const { type } = req.user;
    if (type !== "admin") {
      throwError("Unauthorized", 401);
    }
    const product = await Product.findById(productId);

    if (!product) {
      return throwError("Product not found", 404);
    }

    const image = req.file;
    const imageUniqueName = v4() + "-" + image.originalname;
    const params = {
      Bucket: bucketName,
      Key: imageUniqueName,
      Body: image.buffer,
      ContentType: image.mimetype,
    };
    const command = new PutObjectCommand(params);
    await s3.send(command);

    product.name = name;
    product.description = description;
    product.price = price;
    product.availableStocks = availableStocks;
    product.imageKey = imageUniqueName;

    const productResult = await product.save();

    res
      .status(200)
      .json({ message: "Product updated", product: productResult });
  } catch (err) {
    return next(err);
  }
};

export default {
  getProducts,
  getProduct,
  postProduct,
  deleteProduct,
  updateProductStocks,
  updateProduct,
};
