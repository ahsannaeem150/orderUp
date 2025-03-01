import { Server } from "socket.io";
import { MongoClient } from "mongodb";
import { orderModel } from "../models/orderModel.js";
import jwt from "jsonwebtoken";

const setupChangeStream = async (io) => {
  try {
    const changeStream = orderModel.watch([], {
      fullDocument: "updateLookup",
      readPreference: "primary",
    });

    changeStream.on("change", async (change) => {
      try {
        let order;
        if (["insert", "update"].includes(change.operationType)) {
          order = await orderModel
            .findById(change.documentKey._id)
            .populate("userId", "_id name phone")
            .lean();
        }

        if (!order) return;

        if (change.operationType === "insert") {
          io.of("/restaurant")
            .to(order.restaurantId.toString())
            .emit("order-created", order);
        }

        if (change.operationType === "update") {
          io.of("/restaurant")
            .to(order.restaurantId.toString())
            .emit("order-updated", order);
          io.of("/user")
            .to(order.userId._id.toString())
            .emit("order-updated", order);
        }
      } catch (error) {
        console.error("Error processing change event:", error);
      }
    });

    changeStream.on("error", (error) => {
      console.error("Change Stream error:", error);
      setTimeout(() => setupChangeStream(io), 5000);
    });
  } catch (err) {
    console.error("Change Stream connection failed:", err);
    setTimeout(() => setupChangeStream(io), 5000);
  }
};

const socketIoSetup = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  setupChangeStream(io);

  // Authentication middleware
  const authenticate = (socket, next) => {
    try {
      console.log("hello");
      const token = socket.handshake.auth.token;
      console.log(token);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  };

  // User namespace
  const userNamespace = io.of("/user");
  userNamespace.use(authenticate);
  userNamespace.on("connection", (socket) => {
    console.log("User connected:", socket.user._id);

    socket.on("join-user-room", (userId) => {
      if (userId !== socket.user._id) {
        return socket.emit("error", "Unauthorized room access");
      }
      socket.join(userId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user.id);
    });
  });

  // Restaurant namespace
  const restaurantNamespace = io.of("/restaurant");
  restaurantNamespace.use(authenticate);
  restaurantNamespace.on("connection", (socket) => {
    console.log("Restaurant connected:", socket.user._id);

    socket.on("join-restaurant-room", (restaurantId) => {
      if (restaurantId !== socket.user._id) {
        return socket.emit("error", "Unauthorized restaurant access");
      }
      socket.join(restaurantId);
    });

    socket.on("accept-order", async ({ orderId }) => {
      try {
        const order = await orderModel.findByIdAndUpdate(orderId, {
          status: "Preparing",
        });

        if (
          !order ||
          order.restaurantId.toString() !== socket.user.restaurantId
        ) {
          return socket.emit("order-error", "Invalid order update");
        }
      } catch (error) {
        socket.emit("order-error", error.message);
        console.error("Order acceptance error:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Restaurant disconnected:", socket.user.id);
    });
  });

  return io;
};

export default socketIoSetup;
