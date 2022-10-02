import { Request, Response, NextFunction } from "express";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 } from "uuid";

import mongoose from "mongoose";

import Product from "../models/product";
import throwError from "../utils/throwError";
import s3 from "../services/s3-bucket";

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
          imageKey: product.imageKey,
          imageUrl: url,
        };
      })
    );

    res.status(200).json({
      message: "get products",
      products: mappedProducts,
    });
  } catch (err) {
    return next(err);
  }
};

const postProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { name, description, price } = req.body;
    const { type } = req.user;
    if (type !== "admin") {
      throwError("Not authorized.", 401);
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
      imageKey: imageUniqueName,
    });

    const productResult = await product.save();

    res.status(200).json({ message: "add product", product: productResult });
  } catch (err) {
    return next(err);
  }
};

export default { getProducts, postProduct };
