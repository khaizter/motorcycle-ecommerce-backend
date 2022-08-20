import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";
import throwError from "../utils/throwError";

const accessTokenKey = "supersecret";
const refreshTokenKey = "supersupersecret";

const isAuth = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");
  try {
    if (!authHeader) {
      throwError("Not authenticated.", 401);
    }
    const token = authHeader!.split(" ")[1] as string;

    console.log("this is my token", token);

    // verify and decode token
    const decodedToken: any = await jwt.verify(token, accessTokenKey);
    console.log("2", decodedToken);

    if (!decodedToken) {
      throwError("Not authenticated.", 401);
    }
    // hook this information to our request object
    req.user = {
      name: decodedToken.name,
      _id: decodedToken.userId,
    };
    return next();
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

export default isAuth;
