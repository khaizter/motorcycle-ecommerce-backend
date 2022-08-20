import mongoose from "mongoose";
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      thumbnail: { type: String, required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export default mongoose.model("Cart", cartSchema);
