import mongoose from "mongoose";
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      imageKey: { type: String, required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  deliveryAddress: { type: String, required: true },
  purchasedDate: { type: String, required: true },
  status: { type: String, required: true },
});

export default mongoose.model("Order", orderSchema);

// items
// owner
// delivery address
// purchased date
// status - active, completed, cancelled
