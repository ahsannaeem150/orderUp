import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId },
  orderItems: [{ type: mongoose.Schema.Types.ObjectId }],
  name: { type: String, required: true },
  price: { type: Number, required: true },
  reviews: [{ type: mongoose.Schema.Types.ObjectId }],
  image: { type: mongoose.Schema.Types.ObjectId },
  availability: { type: Boolean, default: true },
});

export const menuModel = mongoose.model("menuitems", MenuItemSchema);
