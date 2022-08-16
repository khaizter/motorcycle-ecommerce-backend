import express, { Application, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";

// Routes
import cartRoutes from "./routes/cart";

const app: Application = express();

app.use(bodyParser.json());

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({ message: "Hello" });
});

app.use("/cart", cartRoutes);

app.listen(5000, () => console.log("Server running "));
