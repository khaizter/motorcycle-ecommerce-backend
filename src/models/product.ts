import mongoose from "mongoose";
const Schema = mongoose.Schema;

const productSchema = new Schema({
  image: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
});

export default mongoose.model("Product", productSchema);
