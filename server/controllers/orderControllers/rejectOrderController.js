import { orderModel } from "../../models/orderModel.js";

export const rejectOrder = async (req, res) => {
  const { orderId } = req.body;
  const { cancellationReason } = req.body;
  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = "Cancelled";
    order.cancellationReason = cancellationReason || "Rejected by restaurant";
    await order.save();

    return res.status(200).json({ message: "Order rejected", order });
  } catch (error) {
    console.error("Error rejecting order:", error);
    return res.status(500).json({ error: "Failed to reject order" });
  }
};
