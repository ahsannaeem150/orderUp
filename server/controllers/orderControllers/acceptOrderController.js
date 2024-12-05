import { orderModel } from "../../models/orderModel.js";

export const acceptOrder = async (req, res) => {
  const { orderId } = req.body;
  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = "Preparing";
    await order.save();

    return res.status(200).json({ message: "Order accepted", order });
  } catch (error) {
    console.error("Error accepting order:", error);
    return res.status(500).json({ error: "Failed to accept order" });
  }
};
