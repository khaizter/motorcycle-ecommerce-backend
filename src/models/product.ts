import mongoose from "mongoose";
const Schema = mongoose.Schema;

const productSchema = new Schema({
  imageKey: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
});

export default mongoose.model("Product", productSchema);
