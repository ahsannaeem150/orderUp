import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, enum: ["Food", "Drink"], default: "Food" },
  reviews: [{ type: mongoose.Schema.Types.ObjectId }],
  image: { type: mongoose.Schema.Types.ObjectId },
  availability: { type: Boolean, default: true },
});

export const menuModel = mongoose.model("menuitems", MenuItemSchema);
