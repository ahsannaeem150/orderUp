import { imageModel } from "../../models/imageModel.js";
import { menuModel } from "../../models/itemModel.js";
import { restaurantModel } from "../../models/restaurantModel.js";

export const getItemsController = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const restaurant = await restaurantModel.findById(restaurantId);
    if (!restaurant) {
      return res
        .status(500)
        .json({ success: false, message: "Restaurant not found." });
    }

    const items = await menuModel.find({ _id: { $in: restaurant.menu } });

    if (!items || items.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No items found for this restaurant.",
        items: [],
      });
    }
    console.log(items);
    const itemsWithImages = await Promise.all(
      items.map(async (item) => {
        const image = await imageModel.findById(item.image);
        return {
          ...item.toObject(),
          image: image
            ? {
                contentType: image.contentType,
                data: image.data,
              }
            : null,
        };
      })
    );
    return res.status(200).json({
      success: true,
      message: "Items retrieved successfully",
      items: itemsWithImages,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
