import { agentModel } from "../../models/agentModel.js";
import { orderModel } from "../../models/orderModel.js";
import { restaurantModel } from "../../models/restaurantModel.js";
import { imageModel } from "../../models/imageModel.js";
import { userModel } from "../../models/userModel.js"; // Add user model import

export const getRequestsController = async (req, res) => {
  try {
    const agentId = req.params.id;

    const agent = await agentModel
      .findById(agentId)
      .populate({
        path: "assignmentRequests",
        match: { status: "Pending" },
        populate: [
          {
            path: "order",
            populate: [
              {
                path: "restaurant",
                populate: {
                  path: "logo",
                  model: imageModel,
                },
              },
              {
                path: "items.itemId",
                select: "name price image",
                populate: {
                  path: "image",
                  model: imageModel,
                },
              },
              // Add user population
              {
                path: "user",
                select: "name phone profilePicture",
                populate: {
                  path: "profilePicture",
                  model: imageModel,
                  select: "url",
                },
              },
            ],
          },
        ],
      })
      .select("assignmentRequests")
      .lean();

    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    const requests = agent.assignmentRequests.map((request) => {
      const order = request.order;
      return {
        _id: request._id,
        status: request.status,
        order: {
          _id: order._id,
          totalAmount: order.totalAmount,
          deliveryAddress: order.deliveryAddress,
          createdAt: order.createdAt,
          restaurant: {
            _id: order.restaurant._id,
            name: order.restaurant.name,
            address: order.restaurant.address,
            logo: order.restaurant.logo?.url || null,
          },
          user: {
            _id: order.user._id,
            name: order.user.name,
            phone: order.user.phone,
            profilePicture: order.user.profilePicture?.url || null,
          },
          items: order.items.map((item) => ({
            name: item.itemId.name,
            price: item.itemId.price,
            image: item.itemId.image?.url || null,
            quantity: item.quantity,
            total: item.itemId.price * item.quantity,
          })),
        },
      };
    });

    return res.status(200).json({ requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};
