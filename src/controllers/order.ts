import { Request, Response, NextFunction } from "express";

import mongoose from "mongoose";

import Order from "../models/order";
import throwError from "../utils/throwError";

const getOrderList = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { type } = req.user;
    if (type !== "admin") {
      throwError("Not authorized.", 401);
    }

    const orders = await Order.find();

    return res.status(200).json({
      message: "get order list",
      orders: orders,
    });
  } catch (err) {
    return next(err);
  }
};

const getOrders = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const orders = await Order.find({ owner: userObjectId });

    return res.status(200).json({
      message: "get order customer",
      orders: orders,
    });
  } catch (err) {
    return next(err);
  }
};

const postOrder = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const { items, deliveryAddress } = req.body;

    const purchasedDate = new Date().toLocaleString();

    const orderStatus = "active";

    const order = new Order({
      items: items,
      owner: userObjectId,
      deliveryAddress: deliveryAddress,
      purchasedDate: purchasedDate,
      status: orderStatus,
    });

    const orderResult = order.save();

    return res.status(200).json({
      message: "order created",
      order: orderResult,
    });
  } catch (err) {
    return next(err);
  }
};

export default { getOrderList, getOrders, postOrder };
