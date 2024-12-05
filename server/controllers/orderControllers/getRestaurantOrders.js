import { orderModel } from "../../models/orderModel.js";

export const getRestaurantOrders = async (req, res) => {
  const restaurantId = req.params.restaurantId;
  try {
    const orders = await orderModel
      .find({
        restaurantId,
        status: { $nin: ["Completed", "Cancelled"] }, // Exclude Completed and Cancelled orders
      })
      .populate("userId");

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};
