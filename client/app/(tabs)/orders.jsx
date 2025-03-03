import React, { useContext, useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import { AuthContext } from "../context/authContext";
import { useFetchActiveOrders } from "../hooks/useFetchActiveOrders";
import { images } from "../../constants";
import { useRestaurant } from "../context/RestaurantContext";

const Orders = () => {
  const { getRestaurant } = useRestaurant();
  const { state, socket, API_URL } = useContext(AuthContext);
  const user = state.user;
  const [localOrders, setLocalOrders] = useState([]);
  const { fetchRestaurants } = useRestaurant();

  useEffect(() => {
    if (activeOrders.length > 0) {
      const restaurantIds = activeOrders.map((o) => o.restaurantId);
      fetchRestaurants(restaurantIds);
    }
  }, [activeOrders]);

  // Fetch active orders using the custom hook
  const { activeOrders, fetchActiveOrders, loading, error } =
    useFetchActiveOrders(`/orders/active/${user._id}`);

  // Update local state when activeOrders changes
  useEffect(() => {
    setLocalOrders(activeOrders);
  }, [activeOrders]);
  console.log(localOrders);
  useEffect(() => {
    fetchActiveOrders();
    socket.emit("join-user-room", user._id);

    // Add socket listeners
    const handleOrderUpdate = (updatedOrder) => {
      setLocalOrders((prev) =>
        prev.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    };

    const handleNewOrder = (newOrder) => {
      setLocalOrders((prev) => [newOrder, ...prev]);
    };

    socket.on("order-updated", handleOrderUpdate);
    socket.on("order-created", handleNewOrder);

    return () => {
      socket.off("order-updated", handleOrderUpdate);
      socket.off("order-created", handleNewOrder);
    };
  }, [user._id]);

  // Render function for each active order
  const renderActiveOrders = ({ item }) => {
    const restaurant = getRestaurant(item.restaurantId);

    const orderQuantity = item.items.reduce((quantity, item) => {
      return quantity + item.quantity;
    }, 0);

    return (
      <View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: restaurant?.logo
                  ? `${API_URL}/images/${restaurant.logo}`
                  : images.logoPlaceholder,
              }}
              style={styles.avatar}
            />
          </View>
          <View>
            <Text style={styles.restaurantName}>
              {restaurant?.name || "Restaurant"}
            </Text>
            <Text style={styles.restaurantDetails}>
              Items in order: {orderQuantity}
            </Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <Text style={[styles.status, { color: statusColors[item.status] }]}>
            {item.status}
          </Text>
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
          data={localOrders}
          renderItem={renderActiveOrders}
          keyExtractor={(item) => item._id}
        />
      )}
    </View>
  );
};
const statusColors = {
  Preparing: "#4CAF50",
  Ready: "#2196F3",
  Completed: "#9E9E9E",
  Cancelled: "#EF5350",
  Pending: "#FFA726",
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
    alignItems: "flex-end",
  },
  status: {
    fontSize: 16,
    fontWeight: "500",
    color: (status) => statusColors[status],
    textAlign: "right",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 500,
  },
});

export default Orders;
