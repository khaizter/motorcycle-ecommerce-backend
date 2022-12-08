import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  homeAddress: { type: String, required: true },
  deliveryAddress: { type: String, required: false },
  contactNumber: { type: String, required: true },
  recoveryQuestion: { type: String, required: true },
  recoveryAnswer: { type: String, required: true },
});

export default mongoose.model("User", userSchema);
