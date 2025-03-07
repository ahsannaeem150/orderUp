import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
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
  const [isRefreshing, setIsRefreshing] = useState(false); // For refresh control
  const [cancellingOrderId, setCancellingOrderId] = useState(null); // For cancel button loader
  const user = state.user;
  const [localOrders, setLocalOrders] = useState([]);

  const { fetchRestaurants } = useRestaurant();

  useEffect(() => {
    if (activeOrders.length > 0) {
      const restaurantIds = activeOrders.map((o) => o.restaurantId);
      fetchRestaurants(restaurantIds);
    }
  }, [activeOrders]);

  const { activeOrders, fetchActiveOrders, loading, error } =
    useFetchActiveOrders(`/orders/active/${user._id}`);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchActiveOrders();
    setIsRefreshing(false);
  }, [fetchActiveOrders]);

  useEffect(() => {
    setLocalOrders(activeOrders);
  }, [activeOrders]);
  useEffect(() => {
    fetchActiveOrders();
    socket.emit("join-user-room", user._id);

    const handleOrderUpdate = (updatedOrder) => {
      setLocalOrders((prev) =>
        prev.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    };

    const handleOrderRemoved = ({ orderId, status }) => {
      setCancellingOrderId(null);
      setLocalOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );
    };
    socket.on("order-removed", handleOrderRemoved);
    socket.on("order-updated", handleOrderUpdate);

    return () => {
      socket.off("order-updated", handleOrderUpdate);
      socket.off("order-removed", handleOrderRemoved);
    };
  }, [user._id]);

  const handleCancelOrder = ({ orderId, restaurantId }) => {
    Alert.alert(
      "Confirm Cancellation",
      "Are you sure you want to cancel this order?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            setCancellingOrderId(orderId); // Show loader on the button
            try {
              await socket.emit("cancel-order", {
                orderId,
                restaurantId,
                cancellationReason: "User decision",
              });
            } catch (error) {
              console.error("Error cancelling order:", error);
            }
          },
        },
      ]
    );
  };

  const renderActiveOrders = ({ item }) => {
    const restaurant = item.restaurant;
    const orderTime = new Date(item.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const totalItems = item.items.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = item.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const statusProgress = {
      Pending: 0.2,
      Preparing: 0.5,
      Ready: 0.8,
      Completed: 1,
      Cancelled: 1,
      Removed: 1,
    };

    const handleRemoveOrder = () => {
      setLocalOrders((prev) => prev.filter((order) => order._id !== item._id));
    };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(orders)/${item._id}`)}
      >
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
          {["Completed", "Cancelled", "Removed"].includes(item.status) && (
            <TouchableOpacity onPress={handleRemoveOrder}>
              <Ionicons name="close-circle" size={24} color={colors.can} />
            </TouchableOpacity>
          )}
        </View>

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

        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${statusProgress[item.status] * 100}%` },
            ]}
          />
        </View>
        {item.status === "Pending" && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() =>
              handleCancelOrder({
                orderId: item._id,
                restaurantId: restaurant._id,
              })
            }
            disabled={cancellingOrderId === item._id} // Disable button while cancelling
          >
            {cancellingOrderId === item._id ? (
              <ActivityIndicator color={colors.errorText} />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Orders</Text>
      {localOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image source={images.empty} style={styles.image} />
          <Text style={styles.emptyText}>No active orders found!</Text>
        </View>
      ) : (
        <FlatList
          data={localOrders}
          renderItem={renderActiveOrders}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => {
            return (
              <View style={styles.emptyContainer}>
                <Image source={images.empty} style={styles.image} />
                <Text style={styles.emptyText}>No active orders found!</Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const statusColors = {
  Preparing: colors.warningBg,
  Ready: colors.success,
  Completed: colors.muted,
  Cancelled: colors.errorText,
  Pending: colors.accent,
  Removed: colors.errorText,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginBottom: 50,
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
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: colors.errorText,
  },
});

export default Orders;
