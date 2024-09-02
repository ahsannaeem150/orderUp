import { menuModel } from "../../models/itemModel.js";
import { reviewModel } from "../../models/reviewModel.js";

//REGISTER USER
export const postUserReviewController = async (req, res) => {
  try {
    const { review, rating } = req.body;
    const { userId, itemId } = req.params;

    const uploadedReview = await reviewModel({
      itemId,
      userId,
      comment: review,
      rating,
    }).save();

    const item = await menuModel.findById(itemId);

    item.reviews.push(uploadedReview._id);
    item.save();

    res.status(201).send({
      success: true,
      message: "Review added successfully",
    });
  } catch (error) {
    console.log(`Error in review ${error}`.bgBlue.black);
    return res.status(500).send({
      success: false,
      message: "Error in review api",
      error,
    });
  }
};
