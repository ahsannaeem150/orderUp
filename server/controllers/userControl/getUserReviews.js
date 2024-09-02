import { imageModel } from "../../models/imageModel.js";
import { menuModel } from "../../models/itemModel.js";
import { restaurantModel } from "../../models/restaurantModel.js";
import { reviewModel } from "../../models/reviewModel.js";
import { userModel } from "../../models/userModel.js";
export const getReviewsController = async (req, res) => {
  try {
    const { itemId } = req.params;
    console.log(itemId);

    const item = await menuModel.findById(itemId);

    const reviews = await reviewModel.find({ _id: { $in: item.reviews } });
    console.log("Item", item);

    console.log("Reviews", reviews);

    const reviewsWithImages = await Promise.all(
      reviews.map(async (review) => {
        const user = await userModel.findById(review.userId);
        const image = await imageModel.findById(user.profilePicture);
        console.log(image._id);
        console.log("USER ID", user._id);

        return {
          ...review.toObject(),
          image: image
            ? { data: image.data, contentType: image.contentType }
            : null,
          reviewer: user.name,
          reviewerEmail: user.email,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      reviews: reviewsWithImages,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
