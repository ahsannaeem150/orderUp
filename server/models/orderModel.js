import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["Pending", "Preparing", "Ready", "Completed", "Cancelled"],
    default: "Pending",
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "restaurants",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "menuitems",
        required: true,
      },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  deliveryAddress: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Pending", "Preparing", "Cancelled"],
    default: "Pending",
  },
  cancellationReason: { type: String, default: "" },
});

export const orderModel = mongoose.model("orders", OrderSchema);
