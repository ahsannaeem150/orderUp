import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { AuthContext } from "../context/authContext";
import { useFetchActiveOrders } from "../hooks/useFetchActiveOrders";
import { images } from "../../constants";
import { useRestaurant } from "../context/RestaurantContext";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/colors";

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

  useEffect(() => {
    setLocalOrders(activeOrders);
  }, [activeOrders]);
  useEffect(() => {
    fetchActiveOrders();
    socket.emit("join-user-room", user._id);

    const handleOrderUpdate = (updatedOrder) => {
      setLocalOrders((prev) => {
        if (["Cancelled"].includes(updatedOrder.status)) {
          return prev.filter((order) => order._id !== updatedOrder._id);
        }
        return prev.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        );
      });
    };

    const handleOrderCancelled = (cancelledOrder) => {
      setLocalOrders((prev) =>
        prev.filter((order) => order._id !== cancelledOrder._id)
      );
    };

    const handleOrderRemoved = (orderId) => {
      console.log("helloooo");
      setLocalOrders((prev) => prev.filter((order) => order._id !== orderId));
    };

    socket.on("order-removed", handleOrderRemoved);
    socket.on("order-updated", handleOrderUpdate);
    socket.on("order-cancelled", handleOrderCancelled);

    return () => {
      socket.off("order-updated", handleOrderUpdate);
      socket.off("order-removed", handleOrderRemoved);
      socket.off("order-cancelled", handleOrderCancelled);
    };
  }, [user._id]);

  // Render function for each active order
  const renderActiveOrders = ({ item }) => {
    const restaurant = item.restaurant;
    const orderTime = new Date(item.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Calculate total items and price
    const totalItems = item.items.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = item.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Progress visualization based on status
    const statusProgress = {
      Pending: 0.2,
      Preparing: 0.5,
      Ready: 0.8,
      Completed: 1,
      Cancelled: 1,
    };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(orders)/${item._id}`)}
      >
        {/* Restaurant Header */}
        <View style={styles.restaurantHeader}>
          <Image
            source={{
              uri: restaurant?.logo
                ? `${API_URL}/images/${restaurant.logo}`
                : images.logoPlaceholder,
            }}
            style={styles.restaurantLogo}
          />
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{restaurant?.name}</Text>
            <Text style={styles.orderTime}>{orderTime}</Text>
          </View>
          <Text
            style={[
              styles.status,
              { backgroundColor: statusColors[item.status] },
            ]}
          >
            {item.status}
          </Text>
        </View>

        {/* Order Details */}
        <View style={styles.detailsRow}>
          <Ionicons name="fast-food" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{totalItems} items</Text>

          <Ionicons
            name="time"
            size={16}
            color={colors.textSecondary}
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>Est. 30-45 mins</Text>

          <Ionicons
            name="cash"
            size={16}
            color={colors.textSecondary}
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>Rs {totalPrice.toFixed(2)}</Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${statusProgress[item.status] * 100}%` },
            ]}
          />
        </View>

        {/* Action Buttons */}
        {item.status === "Pending" && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelOrder(item._id)}
          >
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
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
  Preparing: colors.info,
  Ready: colors.success,
  Completed: colors.muted,
  Cancelled: colors.error,
  Pending: colors.warning,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  header: {
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    color: colors.primary,
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  restaurantHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  restaurantLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
  },
  orderTime: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 4,
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: colors.textInverted,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 16,
  },
  detailIcon: {
    marginLeft: 16,
    marginRight: 4,
  },
  progressContainer: {
    height: 4,
    backgroundColor: colors.borders,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.errorText,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.errorText,
    fontFamily: "Poppins-Medium",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
});

export default Orders;
