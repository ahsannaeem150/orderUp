import { imageModel } from "../../models/imageModel.js";
import { menuModel } from "../../models/itemModel.js";
import { restaurantModel } from "../../models/restaurantModel.js";

export const getItemsController = async (req, res) => {
  try {
    const restaurant = await restaurantModel.findById(req.params.id).populate({
      path: "menu",
      select: "_id name price description category image",
    });

    return res.status(200).json({
      success: true,
      items: restaurant.menu.map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.image,
      })),
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};
