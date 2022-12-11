import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";
import throwError from "../utils/throwError";

const accessTokenKey = process.env.ACCESS_TOKEN_KEY as string;
const refreshTokenKey = process.env.REFRESH_TOKEN_KEY as string;

const isAuth = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");
  try {
    if (!authHeader) {
      throwError("Not authenticated", 401);
    }
    const token = authHeader!.split(" ")[1] as string;

    // verify and decode token
    const decodedToken: any = await jwt.verify(token, accessTokenKey);
    if (!decodedToken) {
      throwError("Not authenticated", 401);
    }
    // hook this information to our request object
    req.user = {
      name: decodedToken.name,
      _id: decodedToken.userId,
      type: decodedToken.type,
    };
    return next();
  } catch (err) {
    return next(err);
  }
};

export default isAuth;
