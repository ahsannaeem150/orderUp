import { orderModel } from "../../models/orderModel.js";
import { restaurantModel } from "../../models/restaurantModel.js";
import { imageModel } from "../../models/imageModel.js"; // For fetching restaurant logo

export const getActiveOrdersController = async (req, res) => {
  try {
    const { userId } = req.params;
    const activeOrders = await orderModel
      .find({
        userId,
        status: { $nin: ["Completed", "Cancelled"] },
      })
      .exec();

    // If no active orders are found, send an empty array
    if (!activeOrders || activeOrders.length === 0) {
      return res.status(200).json([]);
    }

    const ordersWithRestaurantDetails = await Promise.all(
      activeOrders.map(async (order) => {
        const restaurant = await restaurantModel
          .findById(order.restaurantId)
          .select("name logo _id");

        const logo = restaurant.logo
          ? await imageModel.findById(restaurant.logo)
          : null;

        const updatedOrder = {
          ...order.toObject(),
          restaurant: {
            name: restaurant.name,
            logo: logo
              ? { data: logo.data, contentType: logo.contentType }
              : null,
            _id: restaurant._id,
          },
        };
        return updatedOrder;
      })
    );
    res.status(200).json(ordersWithRestaurantDetails);
  } catch (error) {
    console.error("Error fetching active orders:", error);
    res.status(500).json({ error: "Failed to fetch active orders" });
  }
};
