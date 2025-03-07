import { Server } from "socket.io";
import { orderModel } from "../models/orderModel.js";
import jwt from "jsonwebtoken";
import { OrderHistoryModel } from "../models/orderHistoryModel.js";

const setupChangeStream = async (io) => {
  try {
    const changeStream = orderModel.watch([], {
      fullDocument: "updateLookup",
      readPreference: "primary",
    });

    changeStream.on("change", async (change) => {
      try {
        console.log(change.operationType);
        let order = [];
        if (["insert", "update"].includes(change.operationType)) {
          order = await orderModel
            .findById(change.documentKey._id)
            .populate("user", "_id name phone profilePicture")
            .populate("restaurant", "_id name address logo")
            .lean();
        }
        const restaurantId =
          order?.restaurant?._id?.toString() || order?.restaurant?.toString();
        const userId = order?.user?._id?.toString();

        console.log(change.documentKey._id);
        switch (change.operationType) {
          case "insert":
            io.of("/restaurant").to(restaurantId).emit("order-created", order);
            break;

          case "update":
            io.of("/restaurant").to(restaurantId).emit("order-updated", order);
            io.of("/user").to(userId).emit("order-updated", order);
            break;
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
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      console.error("Authentication error:", err);
      next(new Error("Authentication failed"));
    }
  };

  // User namespace
  const userNamespace = io.of("/user");
  userNamespace.use(authenticate);
  userNamespace.on("connection", (socket) => {
    console.log(`"User connected:" ${socket.user._id}`.bgRed.white);

    socket.on("join-user-room", (userId) => {
      if (userId !== socket.user._id) {
        console.log("ERROR USER CONNECTION");
        return socket.emit("error", "Unauthorized room access");
      }
      socket.join(userId);
    });

    socket.on("cancel-order", async ({ orderId, cancellationReason }) => {
      try {
        const order = await orderModel.findById(orderId);
        if (!order || order.user.toString() !== socket.user._id.toString()) {
          console.log("ERROR", "Invalid order cancellation");
          return socket.emit("order-error", "Invalid order cancellation");
        }
        const historyOrder = new OrderHistoryModel({
          ...order.toObject(),
          status: "Cancelled",
          cancellationReason,
          cancelledAt: Date.now(),
        });
        await historyOrder.save();

        await orderModel.findByIdAndDelete(orderId);

        io.of("/restaurant")
          .to(order.restaurant.toString())
          .emit("order-removed", { orderId, status: "Cancelled" });
        io.of("/user")
          .to(order.user.toString())
          .emit("order-removed", { orderId, status: "Cancelled" });
      } catch (error) {
        console.log("order error", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user.id);
    });
  });

  // Restaurant namespace
  const restaurantNamespace = io.of("/restaurant");
  restaurantNamespace.use(authenticate);
  restaurantNamespace.on("connection", (socket) => {
    console.log(`"Restaurant connected:" ${socket.user._id}`.bgBlue.white);

    socket.on("join-restaurant-room", (restaurantId) => {
      if (restaurantId !== socket.user._id) {
        console.log("ERROR RESTAURANT CONNECTION");
        return socket.emit("error", "Unauthorized restaurant access");
      }
      socket.join(restaurantId);
    });

    socket.on("accept-order", async ({ orderId, prepTime }) => {
      try {
        const order = await orderModel.findByIdAndUpdate(orderId, {
          status: "Preparing",
          prepTime,
        });
        if (!order || order.restaurant.toString() !== socket.user._id) {
          return socket.emit("order-error", "Invalid order update");
        }
      } catch (error) {
        socket.emit("order-error", error.message);
        console.error("Order acceptance error:", error);
      }
    });

    // handler for status updates
    socket.on("update-order-status", async ({ orderId, status }) => {
      try {
        const order = await orderModel.findById(orderId);
        if (
          !order ||
          order.restaurant.toString() !== socket.user._id.toString()
        ) {
          return socket.emit("order-error", "Invalid order update");
        }

        if (["Completed", "Cancelled"].includes(status)) {
          // Move to history
          const historyOrder = new OrderHistoryModel(order.toObject());
          await historyOrder.save();

          await orderModel.findByIdAndDelete(orderId);

          io.of("/restaurant")
            .to(order.restaurant.toString())
            .emit("order-removed", { orderId, status });

          io.of("/user")
            .to(order.user.toString())
            .emit("order-removed", { orderId, status });

          return;
        }

        order.status = status;
        if (status === "Completed") order.completedAt = Date.now();
        if (status === "Cancelled") order.cancelledAt = Date.now();

        const updatedOrder = await order.save();
        io.of("/restaurant")
          .to(order.restaurant.toString())
          .emit("order-updated", updatedOrder);
        io.of("/user")
          .to(order.user.toString())
          .emit("order-updated", updatedOrder);
      } catch (error) {
        socket.emit("order-error", error.message);
      }
    });

    socket.on("reject-order", async ({ orderId, cancellationReason }) => {
      try {
        const order = await orderModel.findById(orderId);
        if (
          !order ||
          order.restaurant.toString() !== socket.user._id.toString()
        ) {
          console.log("ERROR", "Invalid order cancellation");
          return socket.emit("order-error", "Invalid order cancellation");
        }
        const historyOrder = new OrderHistoryModel({
          ...order.toObject(),
          status: "Cancelled",
          cancellationReason,
          cancelledAt: Date.now(),
        });
        await historyOrder.save();

        await orderModel.findByIdAndDelete(orderId);

        io.of("/restaurant")
          .to(order.restaurant.toString())
          .emit("order-removed", { orderId, status: "Cancelled" });
        io.of("/user")
          .to(order.user.toString())
          .emit("order-removed", { orderId, status: "Cancelled" });
      } catch (error) {
        console.log("order error", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("Restaurant disconnected:", socket.user.id);
    });
  });

  return io;
};

export default socketIoSetup;
