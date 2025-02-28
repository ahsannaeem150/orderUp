import { orderModel } from "../../models/orderModel.js";

export const acceptOrder = async (req, res) => {
  try {
    const order = await orderModel
      .findByIdAndUpdate(
        req.body.orderId,
        {
          status: "Preparing",
          acceptedAt: Date.now(),
          prepTime: req.body.prepTime,
        },
        { new: true }
      )
      .populate("userId", "name phone")
      .populate("restaurantId", "name logo");

    const io = req.app.get("socketio");
    io.of("/restaurant")
      .to(order.restaurantId._id.toString())
      .emit("order-updated", order);

    res.status(200).json({ order });
  } catch (error) {
    console.error("Error accepting order:", error);
    return res.status(500).json({ error: "Failed to accept order" });
  }
};
