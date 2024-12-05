import { imageModel } from "../../models/imageModel.js";
import { restaurantModel } from "../../models/restaurantModel.js";

export const getRestaurantsController = async (req, res) => {
  try {
    const restaurants = await restaurantModel.find();

    const restaurantsWithImages = await Promise.all(
      restaurants.map(async (restaurant) => {
        const logo = await imageModel.findById(restaurant.logo);
        const thumbnail = await imageModel.findById(restaurant.thumbnail);
        return {
          ...restaurant.toObject(),
          logo: logo
            ? {
                contentType: logo.contentType,
                data: logo.data,
              }
            : null,
          thumbnail: thumbnail
            ? {
                contentType: thumbnail.contentType,
                data: thumbnail.data,
              }
            : null,
        };
      })
    );
    // Return the restaurants with their images
    return res.status(200).json({
      success: true,
      message: "Restaurants retrieved successfully",
      restaurants: restaurantsWithImages,
    });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
