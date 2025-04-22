import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useOrders } from "../../../context/OrderContext";
import { useLocalSearchParams, router } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/authContext";
import colors from "../../../../constants/colors";
import { images } from "../../../../constants";
import { TextInput, FlatList } from "react-native";

const RestaurantOrderDetailScreen = () => {
  const { orderId, isHistorical } = useLocalSearchParams();
  const {
    activeOrders,
    historicalOrders,
    fetchOrder,
    moveToHistory,
    setActiveOrders,
  } = useOrders();
  const { socket, API_URL } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingType, setProcessingType] = useState(null);
  const [order, setOrder] = useState([]);
  const [prepTime, setPrepTime] = useState(30);
  const [searchQuery, setSearchQuery] = useState("");
  const [agents, setAgents] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  console.log(order);
  const loadOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      let loadedOrder = isHistorical
        ? historicalOrders[orderId]
        : activeOrders[orderId];

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
    if (order.length === 0) loadOrder();
  }, []);

  useEffect(() => {
    const handleOrderUpdate = (updatedOrder) => {
      if (updatedOrder._id === orderId) {
        setOrder(updatedOrder);
        if (["Completed", "Cancelled"].includes(updatedOrder.status)) {
          moveToHistory(updatedOrder);
        } else {
          setActiveOrders((prev) => ({
            ...prev,
            [updatedOrder._id]: updatedOrder,
          }));
        }
      }
    };

    socket.on("order-updated", handleOrderUpdate);
    return () => socket.off("order-updated", handleOrderUpdate);
  }, [orderId, moveToHistory]);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  useEffect(() => {
    const handleSearchResults = (data) => {
      setAgents(
        data.agents.map((agent) => ({
          ...agent,
          hasPendingRequest: order.agentRequests?.some(
            (req) => req.agent._id === agent._id
          ),
        }))
      );
      setSearchLoading(false);
    };

    const handleSearchError = (error) => {
      Alert.alert("Error", error.error || "Failed to search agents");
      setSearchLoading(false);
    };

    socket.on("search-agents-result", handleSearchResults);
    socket.on("search-agents-error", handleSearchError);

    return () => {
      socket.off("search-agents-result", handleSearchResults);
      socket.off("search-agents-error", handleSearchError);
    };
  }, [order.agentRequests]);

  // Update the search handler
  const handleSearchAgents = debounce((query) => {
    if (!query || query.length < 2) {
      setAgents([]);
      return;
    }

    setSearchLoading(true);
    socket.emit("search-agents", { query });
  }, 300);

  useEffect(() => {
    const handleAssignmentSuccess = ({ agentId }) => {
      setOrder((prev) => ({
        ...prev,
        agentRequests: [
          ...prev.agentRequests,
          {
            agent: agents.find((a) => a._id === agentId),
            status: "Pending",
          },
        ],
      }));
      Alert.alert("Request Sent", "The agent has been notified");
      setIsAssigning(false);
    };

    const handleAssignmentError = ({ error }) => {
      Alert.alert("Error", error);
      setIsAssigning(false);
    };

    socket.on("assignment-request-sent", handleAssignmentSuccess);
    socket.on("assignment-request-error", handleAssignmentError);

    return () => {
      socket.off("assignment-request-sent", handleAssignmentSuccess);
      socket.off("assignment-request-error", handleAssignmentError);
    };
  }, [agents]);

  // Update the handler
  const handleSendAssignmentRequest = (agentId) => {
    setIsAssigning(true);
    socket.emit("send-assignment-request", {
      orderId: order._id,
      agentId,
    });
  };
  useEffect(() => {
    if (order.status !== "Pending") {
      handleSearchAgents(searchQuery);
    }
  }, [searchQuery, order.status]);

  const handleStatusUpdate = async (newStatus) => {
    if (!order) return;

    try {
      setProcessingType(newStatus.toLowerCase());
      await socket.emit("update-order-status", {
        orderId: order._id,
        status: newStatus,
        restaurantId: order.restaurant._id,
      });
    } catch (err) {
      Alert.alert("Error", "Failed to update order status");
    } finally {
      setProcessingType(null);
    }
  };

  const handleAcceptWithTime = async () => {
    if (!prepTime || prepTime < 5) {
      Alert.alert("Invalid Time", "Minimum 5 minutes required");
      return;
    }

    try {
      setProcessingType("accept");
      await socket.emit("accept-order", {
        orderId: order._id,
        restaurantId: order.restaurant._id,
        prepTime: `${prepTime} minutes`,
      });
    } catch (err) {
      Alert.alert("Error", "Failed to accept order");
    } finally {
      setProcessingType(null);
    }
  };

  const handleContactCustomer = () => {
    Linking.openURL(`tel:${order?.user?.phone}`).catch(console.error);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
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
  const statusFlow = [
    "Pending",
    "Preparing",
    "Ready",
    "OutForDelivery",
    "Completed",
  ];
  const currentStatusIndex = statusFlow.indexOf(order?.status);
  const progress = Math.max(0, (currentStatusIndex + 1) / statusFlow.length);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Status Banner */}
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
            {order.status}
            {order.cancelledAt &&
              ` • ${new Date(order.cancelledAt).toLocaleDateString()}`}
          </Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <Text style={styles.orderNumber}>
          #{order?._id?.slice(-6).toUpperCase()}
        </Text>
      </View>

      {/* Preparation Progress */}
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

      {/* Order Summary Card */}
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
          <Text style={styles.infoLabel}>Customer:</Text>
          <Text style={styles.infoValue}>{order?.user?.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Contact:</Text>
          <TouchableOpacity onPress={handleContactCustomer}>
            <Text style={[styles.infoValue, { color: colors.primary }]}>
              {order?.user?.phone}
            </Text>
          </TouchableOpacity>
        </View>

        {order.orderType === "Delivery" && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Delivery Address:</Text>
            <Text style={styles.infoValue}>
              {order.deliveryAddress.address}
            </Text>
          </View>
        )}
      </View>

      {/* Order Items */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Items</Text>
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
                Rs{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.totalContainer}>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              Rs{order.totalAmount?.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {["Preparing", "Ready"].includes(order.status) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assign Delivery Agent</Text>

          {/* Current assignment status */}
          {order.agent ? (
            <View style={styles.assignmentStatus}>
              <Text style={styles.agentName}>
                Assigned Agent: {order.agent.username}
              </Text>
              {order.status === "Out for Delivery" && (
                <Text style={styles.statusText}>En Route to Customer</Text>
              )}
            </View>
          ) : order.agentRequests?.length > 0 ? (
            <View style={styles.pendingRequests}>
              <Text style={styles.sectionHeader}>Pending Requests:</Text>
              {order.agentRequests.map((request) => (
                <View key={request.agent._id} style={styles.requestItem}>
                  <Text style={styles.agentName}>{request.agent.username}</Text>
                  <Text
                    style={[
                      styles.requestStatus,
                      request.status === "Pending" && styles.pendingStatus,
                      request.status === "Accepted" && styles.acceptedStatus,
                      request.status === "Rejected" && styles.rejectedStatus,
                    ]}
                  >
                    {request.status}{" "}
                    {request.status === "Pending" && "(Waiting response)"}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <>
              <TextInput
                style={styles.searchInput}
                placeholder="Search available agents..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              {searchLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : (
                <FlatList
                  scrollEnabled={false}
                  data={agents}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <View style={styles.agentCard}>
                      <Image
                        source={{
                          uri: item.profilePicture
                            ? `${API_URL}/images/${item.profilePicture}`
                            : images.avatarPlaceholder,
                        }}
                        style={styles.agentAvatar}
                      />
                      <View style={styles.agentInfo}>
                        <Text style={styles.agentName}>
                          {item.firstName} {item.lastName}
                        </Text>
                        <Text style={styles.agentDetails}>
                          @{item.username}
                        </Text>
                        <View style={styles.agentMeta}>
                          <Text style={styles.agentDistance}>
                            {Math.round(item.distance * 10) / 10} km away
                          </Text>
                          <Text style={styles.agentWorkload}>
                            • Active Orders: {item.ordersAssigned?.length || 0}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.requestButton,
                          item.hasPendingRequest && styles.pendingButton,
                        ]}
                        onPress={() => handleSendAssignmentRequest(item._id)}
                        disabled={isAssigning || item.hasPendingRequest}
                      >
                        <Text style={styles.requestButtonText}>
                          {item.hasPendingRequest
                            ? "Request Sent"
                            : "Send Request"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.noResultsText}>
                      {searchQuery
                        ? "No agents found"
                        : "Search for available agents"}
                    </Text>
                  }
                />
              )}
            </>
          )}
        </View>
      )}
      {/* Restaurant Actions */}
      {!isHistoricalOrder && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Management</Text>

          {order.status === "Pending" && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={handleAcceptWithTime}
                disabled={!!processingType}
              >
                {processingType === "accept" ? (
                  <ActivityIndicator color={colors.textInverted} />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.textInverted}
                    />
                    <Text style={styles.actionButtonText}>Accept Order</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleStatusUpdate("Cancelled")}
                disabled={!!processingType}
              >
                {processingType === "cancelled" ? (
                  <ActivityIndicator color={colors.textInverted} />
                ) : (
                  <>
                    <Ionicons
                      name="close"
                      size={20}
                      color={colors.textInverted}
                    />
                    <Text style={styles.actionButtonText}>Reject Order</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {order.status === "Preparing" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.readyButton]}
              onPress={() => handleStatusUpdate("Ready")}
              disabled={!!processingType}
            >
              {processingType === "ready" ? (
                <ActivityIndicator color={colors.textInverted} />
              ) : (
                <>
                  <Ionicons
                    name="fast-food"
                    size={20}
                    color={colors.textInverted}
                  />
                  <Text style={styles.actionButtonText}>Mark as Ready</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {order.status === "Ready" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleStatusUpdate("Completed")}
              disabled={!!processingType}
            >
              {processingType === "completed" ? (
                <ActivityIndicator color={colors.textInverted} />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-done"
                    size={20}
                    color={colors.textInverted}
                  />
                  <Text style={styles.actionButtonText}>Complete Order</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    gap: 12,
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.errorText,
  },
  readyButton: {
    backgroundColor: colors.warning,
  },
  completeButton: {
    backgroundColor: colors.primary,
  },

  actionButtonText: {
    color: colors.textInverted,
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },

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
  agentDetails: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
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
  agentMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  agentDistance: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  agentWorkload: {
    color: colors.warning,
    fontSize: 12,
    marginLeft: 8,
  },
  requestButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  pendingButton: {
    backgroundColor: colors.textSecondary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  requestButtonText: {
    color: colors.textInverted,
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  pendingStatus: {
    color: colors.warning,
  },
  acceptedStatus: {
    color: colors.success,
  },
  rejectedStatus: {
    color: colors.error,
  },
  noResultsText: {
    textAlign: "center",
    color: colors.textSecondary,
    paddingVertical: 16,
  },
  sectionHeader: {
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
    marginBottom: 8,
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

    flexWrap: "wrap",
  },
  milestone: {
    alignItems: "center",
    width: "20%",
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontFamily: "Poppins-Regular",
    borderWidth: 1,
    borderColor: colors.borders,
  },
  agentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginVertical: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borders,
  },
  agentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  agentInfo: {
    flex: 1,
    marginRight: 8,
  },
  agentName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: colors.textPrimary,
  },
  agentDetails: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: colors.textSecondary,
  },
  agentStatus: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: colors.success,
  },
  assignButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  assignButtonText: {
    color: colors.textInverted,
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
  noAgentsText: {
    textAlign: "center",
    color: colors.textSecondary,
    paddingVertical: 16,
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
    fontSize: 10,
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
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: "Poppins-Medium",
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
    fontSize: 16,
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

export default RestaurantOrderDetailScreen;
