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
import { KeyboardAvoidingView, Platform } from "react-native";

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
  const [assigningAgentId, setAssigningAgentId] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const [clearingRequestId, setClearingRequestId] = useState(null);

  useEffect(() => {
    const hasPendingOrRejected = order?.agentRequests?.some(
      (req) => req.status === "Pending" || req.status === "Rejected"
    );
    const hasAcceptedAgent =
      order?.agent ||
      order?.agentRequests?.some((req) => req.status === "Accepted");

    setShowSearch(!hasPendingOrRejected && !hasAcceptedAgent);
  }, [order?.agentRequests, order?.agent]);
  useEffect(() => {
    const handleReassignmentDone = ({ clearedRequestId }) => {
      setClearingRequestId(null);

      const remainingRejectedOrPending = order.agentRequests?.some(
        (req) =>
          (req.status === "Pending" || req.status === "Rejected") &&
          req._id !== clearedRequestId
      );

      if (!remainingRejectedOrPending) {
        setShowSearch(true);
      }
    };

    const handleReassignmentError = (error) => {
      Alert.alert(
        "Error",
        error?.message || "Failed to clear rejected request"
      );
      setClearingRequestId(null);
    };

    socket.on("agent-reassignment-done", handleReassignmentDone);
    socket.on("agent-reassignment-error", handleReassignmentError);

    return () => {
      socket.off("agent-reassignment-done", handleReassignmentDone);
      socket.off("agent-reassignment-error", handleReassignmentError);
    };
  }, []);
  const loadOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      let loadedOrder = isHistorical
        ? historicalOrders[orderId]
        : activeOrders[orderId];
      if (!loadedOrder) {
        console.log("Fetching");
        loadedOrder = await fetchOrder(orderId, isHistorical === "true");
      }
      setOrder(loadedOrder);
      console.log(loadedOrder);
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
        console.log("UPDATED", updatedOrder?.agentRequests);
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

    return () => {
      socket.off("order-updated", handleOrderUpdate);
    };
  }, []);
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };
  const handleClearRejectedRequest = async (requestId) => {
    try {
      setClearingRequestId(requestId);
      socket.emit("request-agent-reassignment", {
        orderId: order._id,
        requestId,
      });
    } catch (err) {
      Alert.alert("Error", "Failed to clear rejected request");
      setClearingRequestId(null);
    }
  };
  useEffect(() => {
    const handleSearchResults = (data) => {
      setAgents(
        data.agents.map((agent) => ({
          ...agent,
          hasPendingRequest: order.agentRequests?.some(
            (req) => req.agent._id === agent._id && req.status === "Pending"
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
  console.log("agen", agents);
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
    const handleAssignmentSuccess = ({ agentId, newAgent }) => {
      console.log("assin", agents);

      Alert.alert("Request Sent", "The agent has been notified");
      setAssigningAgentId(null);
    };

    const handleAssignmentError = ({ error }) => {
      Alert.alert("Error", error);
      setAssigningAgentId(null);
    };

    socket.on("assignment-request-sent", handleAssignmentSuccess);
    socket.on("assignment-request-error", handleAssignmentError);

    return () => {
      socket.off("assignment-request-sent", handleAssignmentSuccess);
      socket.off("assignment-request-error", handleAssignmentError);
    };
  }, [agents]);

  const handleSendAssignmentRequest = async (agentId) => {
    setAssigningAgentId(agentId);

    try {
      socket.emit("send-assignment-request", {
        orderId: order._id,
        agentId,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to send assignment request");
    }
  };

  useEffect(() => {
    const handleAssignmentResponse = (data) => {
      if (data.status === "Rejected") {
        setShowSearch(true);
        Alert.alert(
          "Agent Unavailable",
          "The agent has rejected the request. Please try another agent."
        );
      }
    };

    socket.on("assignment-response", handleAssignmentResponse);

    return () => {
      socket.off("assignment-response", handleAssignmentResponse);
    };
  }, []);
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
    "InDelivery",
    "Completed",
  ];
  const currentStatusIndex = statusFlow.indexOf(order?.status);
  const progress = Math.max(0, (currentStatusIndex + 1) / statusFlow.length);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
                  Rs{item.price * item.quantity}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.totalContainer}>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>Rs{order.totalAmount}</Text>
            </View>
          </View>
        </View>
        {["Preparing", "Ready"].includes(order?.status) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Assignment</Text>
            {order.agentRequests?.map((request) => (
              <View
                key={request._id}
                style={[
                  styles.requestContainer,

                  request.status === "Rejected" && styles.rejectedRequest,

                  request.status === "Accepted" && styles.acceptedRequest,
                ]}
              >
                <Image
                  source={{
                    uri: `${API_URL}/images/${request.agent.profilePicture}`,
                  }}
                  style={styles.requestAvatar}
                />

                <View style={styles.requestDetails}>
                  <Text style={styles.agentName}>{request.agent.username}</Text>

                  <View style={styles.requestMeta}>
                    <View
                      style={[
                        styles.statusBadge,

                        styles[`${request.status.toLowerCase()}Badge`],
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,

                          styles[`${request.status.toLowerCase()}Text`],
                        ]}
                      >
                        {request.status}
                      </Text>
                    </View>

                    <Text style={styles.requestTime}>
                      {new Date(request.sentAt).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>

                {request.status === "Rejected" && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => handleClearRejectedRequest(request._id)}
                    disabled={clearingRequestId === request._id}
                  >
                    {clearingRequestId === request._id ? (
                      <ActivityIndicator
                        size="small"
                        color={colors.textSecondary}
                      />
                    ) : (
                      <Ionicons
                        name="close"
                        size={20}
                        color={colors.textSecondary}
                      />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {showSearch && (
              <>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search available riders..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    handleSearchAgents(text);
                  }}
                />

                {searchLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <FlatList
                    scrollEnabled={false}
                    data={agents}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                      <View style={styles.agentCard}>
                        <Image
                          source={{
                            uri: `${API_URL}/images/${item.profilePicture}`,
                          }}
                          style={styles.agentAvatar}
                        />

                        <View style={styles.agentInfo}>
                          <Text style={styles.agentName}>
                            {item.firstName} {item.lastName}
                          </Text>

                          <Text style={styles.agentUsername}>
                            @{item.username}
                          </Text>
                        </View>

                        {item.hasPendingRequest ? (
                          <View
                            style={[styles.statusBadge, styles.pendingBadge]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                styles.pendingText,
                              ]}
                            >
                              Pending
                            </Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.assignButton}
                            onPress={() =>
                              handleSendAssignmentRequest(item._id)
                            }
                            disabled={assigningAgentId === item._id}
                          >
                            {assigningAgentId === item._id ? (
                              <ActivityIndicator color={colors.textInverted} />
                            ) : (
                              <Text style={styles.assignButtonText}>
                                Assign
                              </Text>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                    ListEmptyComponent={
                      searchQuery.length >= 2 ? (
                        <Text style={styles.noResultsText}>
                          No riders found
                        </Text>
                      ) : (
                        <Text style={styles.searchPrompt}>
                          Type at least 2 characters to search
                        </Text>
                      )
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  requestContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.borders,
  },
  acceptedRequest: {
    borderColor: colors.success,

    backgroundColor: colors.success + "10",
  },
  rejectedRequest: {
    borderColor: colors.error,
    backgroundColor: colors.error + "10",
  },
  requestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  requestMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  requestTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  clearButton: {
    padding: 8,
    marginLeft: "auto",
  },
  agentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginVertical: 8,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borders,
  },

  pendingButton: {
    backgroundColor: colors.textSecondary,
  },
  assignButtonText: {
    color: colors.textInverted,
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
  agentUsername: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noResultsText: {
    textAlign: "center",
    color: colors.textSecondary,
    paddingVertical: 16,
  },

  assignedAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  assignedInfo: {
    flex: 1,
  },
  assignedName: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
  },
  assignedStatus: {
    fontSize: 14,
    color: colors.success,
    marginTop: 4,
  },
  requestsContainer: {
    marginVertical: 8,
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.borders,
  },

  requestDetails: {
    flex: 1,
  },
  requestStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    marginRight: 8,
  },
  acceptedStatus: {
    color: colors.success,
  },
  rejectedStatus: {
    color: colors.error,
  },
  statusTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  retryButton: {
    padding: 8,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
    marginBottom: 12,
  },
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

  pendingStatus: {
    color: colors.warning,
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
  },
  milestone: {
    alignItems: "center",
    width: "20%",
    marginBottom: 12,
  },

  agentName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: colors.textPrimary,
  },
  agentStatus: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: colors.success,
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    paddingBottom: 100, // Space for keyboard
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.borders,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  agentAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  agentInfo: {
    flex: 1,
    marginRight: 8,
  },
  requestButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    opacity: 1,
  },

  requestButtonText: {
    color: colors.textInverted,
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },
  assignedAgentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  agentStatusContainer: {
    flex: 1,
  },
  agentStatusText: {
    color: colors.success,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  requestAgentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestStatusText: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: "row",

    alignItems: "center",

    paddingVertical: 4,

    paddingHorizontal: 8,

    borderRadius: 8,

    alignSelf: "flex-start",

    marginTop: 4,
  },

  pendingBadge: {
    backgroundColor: colors.warning + "20",

    borderWidth: 1,

    borderColor: colors.warning,
  },

  rejectedBadge: {
    backgroundColor: colors.error + "20",

    borderWidth: 1,

    borderColor: colors.error,
  },

  acceptedBadge: {
    backgroundColor: colors.success + "20",

    borderWidth: 1,

    borderColor: colors.success,
  },

  statusBadgeText: {
    fontSize: 12,

    fontFamily: "Poppins-Medium",

    marginLeft: 4,
  },
  pendingText: {
    color: colors.warning,
  },
  rejectedText: {
    color: colors.error,
  },
  acceptedText: {
    color: colors.success,
  },

  assignedContainer: {
    flexDirection: "row",

    alignItems: "center",

    padding: 16,

    backgroundColor: colors.background,

    borderRadius: 12,

    borderWidth: 1,

    borderColor: colors.success,

    marginVertical: 8,
  },

  assignButton: {
    backgroundColor: colors.primary,

    paddingVertical: 8,

    paddingHorizontal: 16,

    borderRadius: 8,

    marginLeft: "auto",
  },
});

export default RestaurantOrderDetailScreen;
