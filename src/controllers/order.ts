import { Request, Response, NextFunction } from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import mongoose from "mongoose";

import Order from "../models/order";
import User from "../models/user";
import throwError from "../utils/throwError";

import s3 from "../services/s3-bucket";
const bucketName = process.env.BUCKET_NAME;

const getOrderList = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { type } = req.user;
    if (type !== "admin") {
      throwError("Unauthorized", 401);
    }

    const ordersDoc = await Order.find();

    const orders = ordersDoc.map((order) => order.toObject());
    const mappedOrders = await Promise.all(
      orders.map(async (order) => {
        const mappedOwner = await User.findById(order.owner);
        const mappedItems = await Promise.all(
          order.items.map(async (item) => {
            const getObjectParams = {
              Bucket: bucketName,
              Key: item.imageKey as string,
            };
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            return {
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              imageKey: item.imageKey,
              imageUrl: url,
            };
          })
        );
        return await {
          ...order,
          owner: {
            contactNumber: mappedOwner?.contactNumber,
            deliveryAddress: mappedOwner?.deliveryAddress,
            homeAddress: mappedOwner?.homeAddress,
            email: mappedOwner?.email,
            name: mappedOwner?.name,
            type: mappedOwner?.type,
            _id: mappedOwner?._id,
          },
          items: mappedItems,
        };
      })
    );

    return res.status(200).json({
      message: "Getting orders successful",
      orders: mappedOrders,
    });
  } catch (err) {
    return next(err);
  }
};

const getOrders = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const ordersDoc = await Order.find({ owner: userObjectId });
    const orders = ordersDoc.map((order) => order.toObject());
    const mappedOrders = await Promise.all(
      orders.map(async (order) => {
        const mappedOwner = await User.findById(order.owner);
        const mappedItems = await Promise.all(
          order.items.map(async (item) => {
            const getObjectParams = {
              Bucket: bucketName,
              Key: item.imageKey as string,
            };
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            return {
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              imageKey: item.imageKey,
              imageUrl: url,
            };
          })
        );
        return await {
          ...order,
          owner: {
            contactNumber: mappedOwner?.contactNumber,
            deliveryAddress: mappedOwner?.deliveryAddress,
            homeAddress: mappedOwner?.homeAddress,
            email: mappedOwner?.email,
            name: mappedOwner?.name,
            type: mappedOwner?.type,
            _id: mappedOwner?._id,
          },
          items: mappedItems,
        };
      })
    );

    return res.status(200).json({
      message: "Getting orders successful",
      orders: mappedOrders,
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
      message: "Order created",
      order: orderResult,
    });
  } catch (err) {
    return next(err);
  }
};

const cancelOrder = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    // check if order exist
    if (!order) {
      return throwError("Order not found", 404);
    }

    // check if order recipient is user
    if (order.owner?.toString !== userObjectId.toString) {
      return throwError("Unauthorized", 401);
    }

    order.status = "canceled";
    const orderResult = await order.save();
    res.status(200).json({
      message: "Order canceled",
      orderId: order._id,
    });
  } catch (err) {
    return next(err);
  }
};

const completeOrder = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { type } = req.user;
    const { orderId } = req.body;
    if (type !== "admin") {
      throwError("Unauthorized", 401);
    }
    const order = await Order.findById(orderId);

    if (!order) {
      return throwError("Order not found", 404);
    }

    order.status = "completed";
    const orderResult = await order.save();

    res.status(200).json({
      message: "Order completed",
      orderId: order._id,
    });
  } catch (err) {
    return next(err);
  }
};

const deleteOrder = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { type } = req.user;
    const { orderId } = req.body;
    if (type !== "admin") {
      throwError("Unauthorized", 401);
    }
    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return throwError("Order not found", 404);
    }

    res.status(200).json({
      message: "Order deleted",
      order: order,
    });
  } catch (err) {
    return next(err);
  }
};

export default {
  getOrderList,
  getOrders,
  postOrder,
  cancelOrder,
  completeOrder,
  deleteOrder,
};
