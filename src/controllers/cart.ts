import { Request, Response, NextFunction } from "express";

const getCart = (req: Request, res: Response, next: NextFunction): Response => {
  return res.status(400).json({ message: "here's the cart" });
};

export default { getCart };
