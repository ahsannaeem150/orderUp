import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "menuitems",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

export const reviewModel = mongoose.model("itemreviews", reviewSchema);
