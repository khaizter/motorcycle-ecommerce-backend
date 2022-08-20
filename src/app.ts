import express, {
  Application,
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import mongoose, { mongo } from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

// Routes
import cartRoutes from "./routes/cart";
import authRoutes from "./routes/auth";

const app: Application = express();

app.use(bodyParser.json());

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({ message: "Hello" });
});

app.use("/cart", cartRoutes);
app.use("/auth", authRoutes);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  let { statusCode, message, data } = error;
  if (!statusCode) {
    statusCode = 500;
  }
  return res.status(statusCode).json({ message: message, data: data });
});

mongoose
  .connect(process.env.MONGO_DB_URI!)
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log("Server running on " + port));
  })
  .catch((err) => console.log(err));
