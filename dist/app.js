"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Routes
const cart_1 = __importDefault(require("./routes/cart"));
const auth_1 = __importDefault(require("./routes/auth"));
const product_1 = __importDefault(require("./routes/product"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});
app.use("/cart", cart_1.default);
app.use("/auth", auth_1.default);
app.use("/product", product_1.default);
app.use((error, req, res, next) => {
    let { statusCode, message, data } = error;
    if (!statusCode) {
        statusCode = 500;
    }
    return res.status(statusCode).json({ message: message, data: data });
});
mongoose_1.default
    .connect(process.env.MONGO_DB_URI)
    .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log("Server running on " + port));
})
    .catch((err) => console.log(err));
