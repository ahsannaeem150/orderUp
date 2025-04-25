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
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/authContext";
import { images } from "../../../constants";
import colors from "../../../constants/colors";
import { useOrders } from "../../context/OrderContext";
import { router } from "expo-router";

const Orders = () => {
  const {
    activeOrders,
    historicalOrders,
    fetchOrder,
    moveToHistory,
    setCurrentOrder,
    setActiveOrders,
    fetchActiveOrders,
    fetchHistoricalOrders,
  } = useOrders();

  const { state, socket, API_URL } = useContext(AuthContext);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [hasFetchedHistory, setHasFetchedHistory] = useState(false);
  const user = state.user;

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      if (showHistory) {
        await fetchHistoricalOrders(user._id);
      } else {
        await fetchActiveOrders(user._id);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [showHistory, user._id]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    if (showHistory && !hasFetchedHistory) {
      loadData();
      setHasFetchedHistory(true);
    }
  }, [showHistory, hasFetchedHistory]);

  const handleRemoveOrder = (orderId) => {
    setActiveOrders((prev) => {
      const newActive = { ...prev };
      delete newActive[orderId];
      return newActive;
    });
  };

  useEffect(() => {
    loadData();
    socket.emit("join-user-room", user._id);

    const handleOrderUpdate = (updatedOrder) => {
      setActiveOrders((prev) => {
        const newActive = { ...prev };
        newActive[updatedOrder._id] = updatedOrder;
        return newActive;
      });
    };

    const handleOrderCreated = (newOrder) => {
      console.log(newOrder);
      setActiveOrders((prev) => {
        const newActive = { ...prev };
        newActive[newOrder._id] = newOrder;
        return newActive;
      });
    };

    const handleOrderRemoved = ({ orderId, status }) => {
      setCancellingOrderId(null);
      moveToHistory({ orderId, status });
    };

    socket.on("order-removed", handleOrderRemoved);
    socket.on("order-created", handleOrderCreated);
    socket.on("order-updated", handleOrderUpdate);
    return () => {
      socket.off("order-updated", handleOrderUpdate);
      socket.off("order-created", handleOrderCreated);
      socket.off("order-removed", handleOrderRemoved);
    };
  }, [user._id, moveToHistory]);

  const handleCancelOrder = ({ orderId, restaurantId }) => {
    Alert.alert(
      "Confirm Cancellation",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            setCancellingOrderId(orderId);
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

  const handleOrderPress = useCallback(
    async (orderId, isHistorical) => {
      try {
        const order = isHistorical
          ? historicalOrders[orderId]
          : activeOrders[orderId];

        if (!order) {
          await fetchOrder(orderId, isHistorical);
        }

        setCurrentOrder(orderId);
        router.push(`/(orders)/${orderId}?isHistorical=${isHistorical}`);
      } catch (error) {
        console.error("Error navigating to order:", error);
      }
    },
    [activeOrders, historicalOrders]
  );

  const renderOrderItem = ({ item: order }) => {
    const isHistorical = showHistory;
    const restaurant = order.restaurant;
    const orderTime = new Date(order.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const totalItems = order.items.reduce((acc, i) => acc + i.quantity, 0);
    const totalPrice = order.items.reduce(
      (acc, i) => acc + i.price * i.quantity,
      0
    );

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          handleOrderPress(
            order._id,
            isHistorical || ["Cancelled", "Completed"].includes(order.status)
          )
        }
      >
        <View style={styles.cardHeader}>
          <Image
            source={{
              uri: restaurant?.logo
                ? `${API_URL}/images/${restaurant.logo}`
                : images.logoPlaceholder,
            }}
            style={styles.restaurantLogo}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.restaurantName}>{restaurant?.name}</Text>
            <Text style={styles.orderTime}>{orderTime}</Text>
          </View>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColors[order.status] },
              ]}
            >
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
            {!isHistorical &&
              ["Cancelled", "Completed"].includes(order.status) && (
                <TouchableOpacity
                  onPress={() => handleRemoveOrder(order._id)}
                  style={styles.closeButton}
                >
                  <Ionicons
                    name="close"
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="fast-food" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{totalItems} items</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>Rs {totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        {!isHistorical && (
          <>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${statusProgress[order.status] * 100}%` },
                ]}
              />
            </View>
            {order.status === "Pending" && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() =>
                  handleCancelOrder({
                    orderId: order._id,
                    restaurantId: restaurant._id,
                  })
                }
                disabled={cancellingOrderId === order._id}
              >
                {cancellingOrderId === order._id ? (
                  <ActivityIndicator color={colors.errorText} />
                ) : (
                  <Text style={styles.cancelButtonText}>Cancel Order</Text>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Orders</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, !showHistory && styles.activeTab]}
          onPress={() => setShowHistory(false)}
        >
          <Text style={styles.tabText}>Active</Text>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {Object.keys(activeOrders).length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, showHistory && styles.activeTab]}
          onPress={() => setShowHistory(true)}
        >
          <Text style={styles.tabText}>History</Text>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {Object.keys(historicalOrders).length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={Object.values(showHistory ? historicalOrders : activeOrders)}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <View style={styles.emptyContent}>
                <Image
                  source={images.empty}
                  style={styles.emptyImage}
                  resizeMode="contain"
                />
                <Text style={styles.emptyText}>
                  {showHistory ? "No past orders" : "No active orders"}
                </Text>
              </View>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const statusProgress = {
  Pending: 0.2,
  Preparing: 0.5,
  Ready: 0.8,
  Completed: 1,
  Cancelled: 1,
};

const statusColors = {
  Preparing: colors.warningBg,
  Ready: colors.success,
  Completed: colors.muted,
  Cancelled: colors.errorText,
  Pending: colors.accent,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borders,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.borders,
    marginHorizontal: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: colors.textPrimary,
  },
  tabText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: colors.textSecondary,
    marginRight: 8,
  },
  counterBadge: {
    backgroundColor: colors.borders,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  counterText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borders,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  restaurantLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: colors.textSecondary,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: colors.textInverted,
  },
  closeButton: {
    padding: 4,
  },
  detailsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: colors.textSecondary,
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
    backgroundColor: colors.textPrimary,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: colors.accent,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyContent: {
    alignItems: "center",
    gap: 16,
  },
  emptyImage: {
    width: 160,
    height: 160,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: colors.textSecondary,
    textAlign: "center",
  },
  activeTabText: {
    color: colors.textPrimary,
    fontFamily: "Poppins-SemiBold",
  },
  restaurantHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  restaurantInfo: {
    flex: 1,
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
  detailIcon: {
    marginLeft: 16,
    marginRight: 4,
  },
  emptyList: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: {
    width: 200,
    height: 200,
    marginBottom: 24,
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
