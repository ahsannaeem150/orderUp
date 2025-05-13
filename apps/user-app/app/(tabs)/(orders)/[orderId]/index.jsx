import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useOrders } from "../../../context/OrderContext";
import { useLocalSearchParams, router } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/authContext";
import colors from "../../../../constants/colors";
import { images } from "../../../../constants";

const OrderDetailScreen = () => {
  const { orderId, isHistorical } = useLocalSearchParams();
  const { activeOrders, historicalOrders, fetchOrder, moveToHistory } =
    useOrders();
  const { socket } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [order, setOrder] = useState(null);

  const loadOrder = useCallback(async () => {
    try {
      let loadedOrder = isHistorical
        ? historicalOrders[orderId]
        : activeOrders[orderId];

      console.log("oderif", orderId);
      console.log("oderifsad", isHistorical);

      if (!loadedOrder) {
        loadedOrder = await fetchOrder(orderId, isHistorical === "true");
      }

      setOrder(loadedOrder);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, isHistorical, activeOrders, historicalOrders]);

  useEffect(() => {
    loadOrder();
  }, [orderId, isHistorical]);

  useEffect(() => {
    const handleOrderUpdate = (updatedOrder) => {
      if (updatedOrder._id === orderId) {
        setOrder(updatedOrder);
        if (["Completed", "Cancelled"].includes(updatedOrder.status)) {
          moveToHistory(updatedOrder);
        }
      }
    };
    const handleOrderRemoved = ({ orderId, status }) => {
      setOrder((prev) => {
        const newOrder = { ...prev };
        newOrder.status = status;
        return newOrder;
      });
    };

    socket.on("order-removed", handleOrderRemoved);
    socket.on("order-updated", handleOrderUpdate);
    return () => socket.off("order-updated", handleOrderUpdate);
  }, [orderId, moveToHistory]);

  const handleCancelOrder = async () => {
    if (!order) return;

    setCancelling(true);
    try {
      await socket.emit("cancel-order", {
        orderId: order._id,
        restaurantId: order.restaurant._id,
        cancellationReason: "User cancelled",
      });
      router.back();
    } catch (err) {
      console.error("Cancel error:", err);
    } finally {
      setCancelling(false);
    }
  };

  const handleViewMap = () => {
    const [latitude, longitude] = [31.07151425854628, 72.95687588676375];
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch(console.error);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{"Order not found"}</Text>
        <TouchableOpacity onPress={loadOrder}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isHistoricalOrder =
    isHistorical === "true" ||
    ["Completed", "Cancelled"].includes(order.status);
  const statusFlow = ["Pending", "Preparing", "Ready", "Completed"];
  const currentStatusIndex = statusFlow.indexOf(order.status);
  const progress = Math.max(0, (currentStatusIndex + 1) / statusFlow.length);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {isHistoricalOrder && (
        <View
          style={[
            styles.statusBanner,
            { backgroundColor: colors[order.status] + "20" },
          ]}
        >
          <Ionicons
            name={
              order.status === "Cancelled" ? "close-circle" : "checkmark-done"
            }
            size={24}
            color={colors[order.status]}
          />
          <Text
            style={[styles.statusBannerText, { color: colors[order.status] }]}
          >
            {order.status}{" "}
            {order.cancelledAt &&
              `• ${new Date(order.cancelledAt).toLocaleDateString()}`}
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <Text style={styles.orderNumber}>
          #{order._id.slice(-6).toUpperCase()}
        </Text>
      </View>

      {!isHistoricalOrder && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <View style={styles.milestoneContainer}>
            {statusFlow.map((status, index) => (
              <View key={status} style={styles.milestone}>
                <View
                  style={[
                    styles.milestoneDot,
                    index <= currentStatusIndex && styles.activeMilestone,
                  ]}
                >
                  {index <= currentStatusIndex && (
                    <Ionicons
                      name="checkmark"
                      size={12}
                      color={colors.textInverted}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.milestoneText,
                    index <= currentStatusIndex && styles.activeMilestoneText,
                  ]}
                >
                  {status}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.summaryRow}>
          <Ionicons name="calendar" size={20} color={colors.textSecondary} />
          <Text style={styles.summaryText}>
            {new Date(order.createdAt).toLocaleDateString()}
          </Text>
          <Ionicons
            name="time"
            size={20}
            color={colors.textSecondary}
            style={styles.summaryIcon}
          />
          <Text style={styles.summaryText}>
            {new Date(order.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment Method:</Text>
          <Text style={styles.infoValue}>{order.paymentMethod}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Order Type:</Text>
          <Text style={styles.infoValue}>{order.orderType}</Text>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Items Ordered</Text>
        <View
          style={{
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.borders,
          }}
        >
          {order?.items?.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
              <Text style={styles.itemQuantity}>{item.quantity}x</Text>
              <View
                style={{
                  flex: 2,
                  justifyContent: "flex-end",
                  alignSelf: "center",
                }}
              >
                <Text style={styles.itemPrice}>
                  Rs {item.price * item.quantity}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totalContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>Rs {order.subtotal || "00"}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery Fee</Text>
            <Text style={styles.totalValue}>
              Rs {order.deliveryFee || "00"}
            </Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Rs {order.totalAmount}</Text>
          </View>
        </View>
      </View>

      {/* Delivery Tracking */}
      {!isHistoricalOrder && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Progress</Text>
          <View style={styles.trackingRow}>
            {["Preparing", "On the way", "Delivered"].map((stage, index) => (
              <View key={stage} style={styles.trackingStep}>
                <View
                  style={[
                    styles.trackingIcon,
                    index <= currentStatusIndex && styles.activeStep,
                    index === currentStatusIndex && styles.currentStep,
                  ]}
                >
                  <Ionicons
                    name={
                      index === 0
                        ? "restaurant"
                        : index === 1
                        ? "bicycle"
                        : "home"
                    }
                    size={20}
                    color={colors.textInverted}
                  />
                </View>
                <Text style={styles.trackingText}>{stage}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.mapButton} onPress={handleViewMap}>
            <Image
              source={images.mapPlaceholder}
              style={styles.mapImage}
              resizeMode="cover"
            />
            <View style={styles.mapOverlay}>
              <Ionicons name="navigate" size={32} color={colors.textInverted} />
              <Text style={styles.mapButtonText}>Track Delivery Location</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.locationInfo}>
            <Ionicons name="pin" size={16} color={colors.errorText} />
            <Text style={styles.locationText}>
              {order?.restaurant?.address?.address}
            </Text>
          </View>
        </View>
      )}

      {/* Order Actions */}
      {order.status === "Pending" && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelOrder}
          disabled={cancelling}
        >
          {cancelling ? (
            <ActivityIndicator color={colors.textInverted} />
          ) : (
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          )}
        </TouchableOpacity>
      )}

      {order.status === "Cancelled" && order.cancellationReason && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cancellation Details</Text>
          <Text style={styles.cancellationReason}>
            {order.cancellationReason}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 12,
  },
  statusBannerText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  cancellationReason: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
    flex: 1,
  },
  orderNumber: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: "Poppins-Medium",
  },
  progressContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.borders,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  milestoneContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  milestone: {
    alignItems: "center",
    width: "24%",
  },
  milestoneDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.borders,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  activeMilestone: {
    backgroundColor: colors.accent,
  },
  milestoneText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    fontFamily: "Poppins-Medium",
  },
  activeMilestoneText: {
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 8,
    marginRight: 16,
  },
  summaryIcon: {
    marginLeft: "auto",
  },
  divider: {
    height: 1,
    backgroundColor: colors.borders,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: "Poppins-Medium",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemPrice: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 2,
    alignSelf: "flex-end",
    justifyContent: "center",
  },
  itemQuantity: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 40,
    flex: 2,
  },
  itemDetails: {
    flex: 8,
  },
  itemName: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  specialInstructions: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },

  totalContainer: {
    marginTop: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: "Poppins-Medium",
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.borders,
    paddingTop: 12,
    marginTop: 8,
  },
  trackingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  trackingStep: {
    alignItems: "center",
    width: "30%",
  },
  trackingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.borders,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: colors.accent,
  },
  currentStep: {
    transform: [{ scale: 1.1 }],
  },
  currentIcon: {
    backgroundColor: colors.success,
  },
  trackingText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  mapButton: {
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  mapButtonText: {
    color: colors.textInverted,
    fontFamily: "Poppins-SemiBold",
    marginTop: 8,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.errorBg,
    padding: 12,
    borderRadius: 8,
  },
  locationText: {
    color: colors.errorText,
    marginLeft: 8,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: colors.errorText,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginVertical: 16,
  },
  cancelButtonText: {
    color: colors.textInverted,
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
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
    padding: 20,
  },
  errorText: {
    color: colors.errorText,
    fontSize: 16,
  },
});

export default OrderDetailScreen;
