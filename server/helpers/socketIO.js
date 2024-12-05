import { Server } from "socket.io";
import { orderModel } from "../models/orderModel.js";

const socketIoSetup = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Replace with your frontend URL
    },
  });

  // Restaurant namespace
  const restaurantNamespace = io.of("/restaurant");
  restaurantNamespace.on("connection", (socket) => {
    console.log("A restaurant connected");

    socket.on("join-restaurant-room", (restaurantId) => {
      socket.join(restaurantId);
      console.log(`Restaurant joined room ${restaurantId}`);
    });

    socket.on("accept-order", async ({ orderId, restaurantId }) => {
      try {
        const order = await orderModel.findById(orderId);
        if (order && order.restaurantId.toString() === restaurantId) {
          order.status = "Preparing";
          await order.save();

          // Notify the user
          io.of("/user").to(order.userId).emit("order-updated", {
            orderId,
            status: "Preparing",
          });

          // Notify other restaurant clients in the room
          restaurantNamespace.to(restaurantId).emit("order-updated", {
            orderId,
            status: "Preparing",
          });
        }
      } catch (error) {
        console.error("Error accepting order:", error);
      }
    });

    // New order event - this will emit a newly created order to the restaurant clients
    socket.on("new-order-created", async (restaurantId) => {
      console.log("New Order Received:"); // Debugging log
      try {
        const newOrders = await orderModel.find({ restaurantId });
        newOrders.forEach((order) => {
          // Emit the new order to the restaurant room
          restaurantNamespace.to(restaurantId).emit("order-created", order);
        });
      } catch (error) {
        console.error("Error emitting new orders:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("A restaurant disconnected");
    });
  });

  // User namespace
  const userNamespace = io.of("/user");
  userNamespace.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("join-user-room", (userId) => {
      socket.join(userId);
      console.log(`User joined room ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

export default socketIoSetup;
