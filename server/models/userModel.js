import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "menuitems",
    required: true,
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});
const OrderSchema = new mongoose.Schema({
  status: { type: String, enum: ["Pending", "Completed"], required: true },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "restaurants",
    required: true,
  },
  items: [OrderItemSchema],
  orderDate: { type: Date, default: Date.now },
});
const PaymentMethodSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Jazzcash", "Easypaisa", "Cash on Delivery"],
    default: "Cash on Delivery",
    required: true,
  },
});
const userSchema = mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    name: {
      type: String,
      required: [true, "Please add name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "please add email"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please add password"],
      trim: true,
      min: 6,
      max: 14,
    },
    role: {
      type: String,
      default: "user",
    },
    address: {
      address: { type: String },
      city: { type: String },
    },
    paymentMethods: [PaymentMethodSchema],
    orderHistory: [OrderSchema],
    phone: { type: String },
    profilePicture: {
      type: mongoose.Schema.Types.ObjectId,
    },
    role: {
      type: String,
      enum: ["Customer", "Admin", "Restaurant Owner"],
      default: "Customer",
    },
  },
  { timestamps: true }
);

export const userModel = mongoose.model("users", userSchema);
