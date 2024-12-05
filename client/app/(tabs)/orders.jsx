import React, { useContext, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import { AuthContext } from "../context/authContext";
import { useFetchActiveOrders } from "../hooks/useFetchActiveOrders"; // Import the custom hook
import { images } from "../../constants";
import { io } from "socket.io-client"; // For real-time updates

const Orders = () => {
  const { state } = useContext(AuthContext); // Assuming user info is stored in AuthContext
  const user = state.user;

  // Fetch active orders using the custom hook
  const { activeOrders, fetchActiveOrders, loading, error } =
    useFetchActiveOrders(`/auth/orders/active/${user._id}`);

  const socket = io("http://192.168.100.51:8080/user");

  useEffect(() => {
    fetchActiveOrders();

    socket.emit("join-user-room", user._id);
    socket.on("order-updated", (updatedOrder) => {});

    return () => {
      socket.disconnect();
    };
  }, []);

  // Render function for each active order
  const renderActiveOrders = ({ item }) => {
    const orderQuantity = item.items.reduce((quantity, item) => {
      return quantity + item.quantity;
    }, 0);

    return (
      <View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: item.restaurant?.logo }}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>
          <View>
            <Text style={styles.restaurantName}>{item.restaurant?.name}</Text>
            <Text style={styles.restaurantDetails}>
              Items in order: {orderQuantity}
            </Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <Text style={styles.status}>{item.status}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Orders</Text>
      {activeOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image source={images.empty} style={styles.image} />
          <Text>No active orders found!</Text>
        </View>
      ) : (
        <FlatList
          data={activeOrders}
          renderItem={renderActiveOrders}
          keyExtractor={(item) => item._id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    flexDirection: "row",
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    justifyContent: "space-between", // Ensure there's space between elements
    elevation: 3,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    height: "100%",
    width: "100%",
    borderRadius: 8,
  },
  restaurantDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  statusContainer: {
    justifyContent: "center",
    alignItems: "flex-end", // Align the status to the right side
  },
  status: {
    fontSize: 16,
    color: "red",
    textAlign: "right", // Ensure text is aligned to the right
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 500,
  },
});

export default Orders;
