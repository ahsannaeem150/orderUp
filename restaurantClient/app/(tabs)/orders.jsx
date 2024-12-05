import React, { useContext, useEffect, useState } from "react";
import { View, Text, FlatList, Button, StyleSheet } from "react-native";
import io from "socket.io-client";
import axios from "axios";
import { AuthContext } from "../context/authContext";

const Orders = () => {
  const { state } = useContext(AuthContext);
  const restaurantId = state.restaurant._id;
  const [orders, setOrders] = useState([]);
  const socket = io("http://192.168.100.51:8080/restaurant"); // Replace with your server URL

  useEffect(() => {
    // Join the restaurant's room
    socket.emit("join-restaurant-room", restaurantId);

    // Fetch orders from the backend
    axios.get(`/auth/${restaurantId}/orders`).then((response) => {
      setOrders(response.data);
    });

    // Listen for order updates (status change)
    socket.on("order-updated", (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder.orderId
            ? { ...order, status: updatedOrder.status }
            : order
        )
      );
    });

    // Listen for new orders from the restaurant site (order-created)
    socket.on("order-created", (newOrder) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders]); // Adds the new order at the top
    });

    // Cleanup the socket connection
    return () => {
      socket.disconnect();
    };
  }, [restaurantId]);

  const handleAccept = (orderId) => {
    socket.emit("accept-order", { orderId, restaurantId });
  };

  const handleReject = (orderId) => {
    socket.emit("reject-order", {
      orderId,
      restaurantId,
      cancellationReason: "No reason provided",
    });
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <Text>Order ID: {item._id}</Text>
      <Text>Total: ${item.totalAmount}</Text>
      <Text>Status: {item.status}</Text>
      <Button title="Accept" onPress={() => handleAccept(item._id)} />
      <Button title="Reject" onPress={() => handleReject(item._id)} />
    </View>
  );

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item._id}
      renderItem={renderOrder}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  orderCard: {
    padding: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
});

export default Orders;
