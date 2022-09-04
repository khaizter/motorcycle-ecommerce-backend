import { Request, Response, NextFunction } from "express";

import mongoose from "mongoose";

import Product from "../models/product";
import throwError from "../utils/throwError";

const getProducts = async (req: any, res: Response, next: NextFunction) => {
  const products = await Product.find();

  res.status(200).json({
    message: "get products",
    products,
  });
};

const postProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    let imageUrl;
    if (!req.file) {
      // throwError("No Image", 400);
      imageUrl = "no-image.png";
    }
    console.log(req.file);
    imageUrl = `images/${req.file.filename}`;
    const { name, description, price } = req.body;

    const product = new Product({
      name,
      description,
      price: price,
      image: imageUrl,
    });

    const productResult = await product.save();

    res.status(200).json({
      message: "post product",
      product: productResult,
    });
  } catch (err) {
    next(err);
  }
};

export default { getProducts, postProduct };
