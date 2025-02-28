import { orderModel } from "../../models/orderModel.js";

export const getRestaurantOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ restaurantId: req.params.restaurantId })
      .populate({
        path: "userId",
        select: "name phone address",
      })
      .sort({ orderDate: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};
