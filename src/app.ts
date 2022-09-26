import express, {
  Application,
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import multer from "multer";
import { v4 } from "uuid";
const path = require("path");
import dotenv from "dotenv";
dotenv.config();
import { S3Client } from "@aws-sdk/client-s3";

// Routes
import cartRoutes from "./routes/cart";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/product";

const corsWhiteList = process.env.CORS_WHITELIST;
const mongoDBURI = process.env.MONGO_DB_URI;
const port = process.env.PORT;

const app: Application = express();

const fileStorage = multer.memoryStorage();
const fileUpload = multer({ storage: fileStorage });
// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "images"));
//   },
//   filename: (req, file, cb) => {
//     cb(null, v4() + file.originalname);
//   },
// });

// const fileFilter = (req: Request, file: any, cb: any) => {
//   if (
//     file.mimetype === "image/png" ||
//     file.mimetype === "image/jpg" ||
//     file.mimetype === "image/jpeg"
//   ) {
//     console.log("file filter 1");
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", corsWhiteList || "*");
  res.header(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(bodyParser.json());
// app.use(
//   multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
// );
app.use(fileUpload.single("image"));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/cart", cartRoutes);
app.use("/auth", authRoutes);
app.use("/product", productRoutes);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  let { statusCode, message, data } = error;
  if (!statusCode) {
    statusCode = 500;
  }
  return res.status(statusCode).json({ message: message, data: data });
});

mongoose
  .connect(mongoDBURI!)
  .then(() => {
    app.listen(port, () => console.log("Server running on " + port));
  })
  .catch((err) => console.log(err));
