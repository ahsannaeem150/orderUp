import { menuModel } from "../../models/itemModel.js";

export const getItemController = async (req, res) => {
  try {
    const item = await menuModel
      .findById(req.params.itemId)
      .select("_id name description price image restaurant")
      .populate("restaurant", "name logo");

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.status(200).json({
      success: true,
      item: {
        ...item._doc,
        restaurantId: item.restaurant._id,
        restaurantName: item.restaurant.name,
        restaurantLogo: item.restaurant.logo,
      },
    });
  } catch (error) {
    console.error("Error fetching item:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};
