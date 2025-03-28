import {orderModel} from "../../models/orderModel.js";

export const getSingleOrderController = async (req, res) => {
    try {
        const order = await orderModel
            .findById(req.params.id)
            .populate("user", "name email address location phone profilePicture")
            .populate("items.itemId", "name price");

        if (!order) {
            return res.status(404).json({error: "Order not found"});
        }

        res.json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({error: "Failed to fetch order"});
    }
};
