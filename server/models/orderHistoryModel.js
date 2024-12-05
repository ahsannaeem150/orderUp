import mongoose from "mongoose";

const OrderHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "restaurants",
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
  status: {
    type: String,
    enum: ["Completed", "Cancelled"],
    required: true,
  },
  completedAt: { type: Date, default: Date.now },
  cancellationReason: { type: String, default: "" },
  deliveryDetails: {
    status: {
      type: String,
      enum: ["Not Delivered", "Delivered"],
      default: "Not Delivered",
    },
    deliveredAt: { type: Date, default: null },
  },
});

export const OrderHistoryModel = mongoose.model(
  "orderhistories",
  OrderHistorySchema
);
