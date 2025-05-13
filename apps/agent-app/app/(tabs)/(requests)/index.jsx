import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../../../constants/colors";
import { router } from "expo-router";
import axios from "axios";
import { AuthContext } from "../../context/authContext";
import { useRequest } from "../../context/RequestContext";
import { useAgentOrders } from "../../context/OrderContext";

const OrderRequestsScreen = () => {
  const { socket, state } = useContext(AuthContext);
  const { assignedOrders, setAssignedOrders } = useAgentOrders();
  const { currentRequest, setCurrentRequest } = useRequest();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({});
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      const response = await axios.get(`/agent/${state.agent._id}/requests`);
      setRequests(response.data.requests);
      setError(null);
    } catch (err) {
      setError("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();

    const handleNewRequest = ({ request }) => {
      console.log(request);
      setRequests((prev) =>
        prev.some((r) => r._id === request._id)
          ? prev.map((r) => (r._id === request._id ? request : r))
          : [...prev, request]
      );
    };

    const handleRequestRemoval = ({ orderId }) => {
      setRequests((prev) => prev.filter((req) => req.order._id !== orderId));
    };

    socket.on("assignment-response-processed", ({ orderId, accept }) => {
      setRequests((prev) =>
        prev.map((req) =>
          req.order._id === orderId
            ? {
                ...req,
                status: accept ? "Accepted" : "Rejected",
                ...(accept && { order: { ...req.order, status: "Accepted" } }),
              }
            : req
        )
      );
      setLoadingStates((prev) => ({ ...prev, [orderId]: false }));

      // If accepted, add to assignedOrders after confirmation
      if (accept) {
        const acceptedRequest = requests.find(
          (req) => req.order._id === orderId
        );
        if (acceptedRequest) {
          setAssignedOrders((prev) => [
            ...prev,
            {
              ...acceptedRequest,
              status: "Accepted",
              order: { ...acceptedRequest.order, status: "Accepted" },
            },
          ]);
        }
      }
    });

    const assignmentResponseError = ({ error, orderId }) => {
      setLoadingStates((prev) => ({ ...prev, [orderId]: false }));
      Alert.alert("Error", error);
    };

    socket.on("assignment-response-error", assignmentResponseError);
    socket.on("assignment-request-removed", handleRequestRemoval);
    socket.on("new-assignment-request", handleNewRequest);

    return () => {
      socket.off("assignment-request-removed", handleRequestRemoval);
      socket.off("assignment-response-error", assignmentResponseError);
      socket.off("new-assignment-request", handleNewRequest);
    };
  }, []);

  const handleResponse = async (orderId, accept) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [orderId]: true }));

      socket.emit("respond-to-assignment", { orderId, accept });
    } catch (err) {
      setLoadingStates((prev) => ({ ...prev, [orderId]: false }));
      Alert.alert("Error", "Failed to submit response");
    }
  };

  const navigateToDetail = (request) => {
    setCurrentRequest(request);
    router.push("(requests)/requestDetail");
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
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchRequests}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Assignment Requests</Text>
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>{requests.length}</Text>
          </View>
        </View>

        {requests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="fast-food" size={48} color={colors.borders} />
            <Text style={styles.emptyText}>No active requests</Text>
          </View>
        ) : (
          requests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              onRespond={handleResponse}
              onViewDetail={() => navigateToDetail(request)}
              onRemove={(orderId) => {
                setRequests((prev) =>
                  prev.filter((req) => req.order._id !== orderId)
                );
              }}
              isLoading={loadingStates[request.order._id] || false}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const RequestCard = ({
  request,
  onRespond,
  onViewDetail,
  onRemove,
  isLoading,
}) => {
  return (
    <TouchableOpacity onPress={onViewDetail}>
      <LinearGradient
        colors={["#ffffff", "#f8f9fa"]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Close button for responded requests */}
        {request.status !== "Pending" && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => onRemove(request.order._id)}
          >
            <Ionicons name="close" size={24} color={colors.danger} />
          </TouchableOpacity>
        )}

        {/* User Information Section */}
        <View style={styles.userSection}>
          <Ionicons name="person-circle" size={24} color={colors.primary} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{request.order.user.name}</Text>
            <Text style={styles.userContact}>{request.order.user.phone}</Text>
            <Text style={styles.userAddress}>
              {request.order.deliveryAddress}
            </Text>
          </View>
        </View>

        {/* Restaurant Information */}
        <View style={styles.restaurantInfo}>
          <View style={styles.restaurantHeader}>
            <Text style={styles.restaurantName}>
              {request.order.restaurant.name}
            </Text>
            <Text style={styles.orderId}>
              Order #: {request.order._id.slice(0, 7)}
            </Text>
          </View>
          <View style={styles.restaurantDetails}>
            <Ionicons name="location" size={16} color={colors.textSecondary} />
            <Text style={styles.restaurantAddress}>
              {request.order.restaurant.address.address}
            </Text>
          </View>
        </View>

        {/* Order Items Preview */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {request.order.items.slice(0, 2).map((item, index) => (
            <View key={index} style={styles.itemPreview}>
              <Text style={styles.itemName}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={styles.itemPrice}>
                Rs {item.price * item.quantity}
              </Text>
            </View>
          ))}
          {request.order.items.length > 2 && (
            <Text style={styles.moreItemsText}>
              + {request.order.items.length - 2} more items
            </Text>
          )}
        </View>

        {/* Order Meta Information */}
        <View style={styles.metaSection}>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              {new Date(request.order.createdAt).toLocaleTimeString()}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              {new Date(request.order.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        {request.status === "Pending" ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => onRespond(request.order._id, false)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="close" size={20} color="white" />
                  <Text style={styles.buttonText}>Decline</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={() => onRespond(request.order._id, true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="white" />
                  <Text style={styles.buttonText}>Accept</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.statusText,
                request.status === "Accepted" && styles.acceptedStatus,
                request.status === "Rejected" && styles.rejectedStatus,
              ]}
            >
              {request.status}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  cardHeader: {
    marginBottom: 8,
  },

  logo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },

  section: {
    marginBottom: 16,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    gap: 8,
  },
  itemText: {
    color: colors.textPrimary,
  },
  detailsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  detailSection: {
    flexDirection: "row",
    gap: 12,
  },
  removeContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  removeButton: {
    padding: 8,
  },
  detailContent: {
    flex: 1,
  },
  detailTitle: {
    fontFamily: "Poppins-Medium",
    color: colors.textPrimary,
  },
  detailText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  distanceText: {
    color: colors.textTertiary,
    fontSize: 12,
    marginTop: 4,
  },
  paymentSection: {
    borderTopWidth: 1,
    borderTopColor: colors.borders,
    paddingTop: 16,
    marginBottom: 16,
  },
  paymentText: {
    fontFamily: "Poppins-SemiBold",
    color: colors.success,
    textAlign: "center",
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  notificationBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  badgeText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backgroundColor: "white",
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borders,
    paddingBottom: 16,
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: colors.textPrimary,
  },
  userContact: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  userAddress: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    lineHeight: 18,
  },
  restaurantInfo: {
    marginBottom: 16,
    gap: 8,
  },
  restaurantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: "center",
  },
  statusText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
  acceptedStatus: {
    color: colors.success,
  },
  rejectedStatus: {
    color: colors.danger,
  },
  restaurantName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  orderId: {
    color: colors.textTertiary,
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    marginLeft: 8,
  },
  restaurantDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  restaurantAddress: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    flex: 1,
  },
  itemsSection: {
    marginVertical: 12,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: 8,
  },
  itemPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  itemName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    flex: 1,
  },
  itemPrice: {
    color: colors.success,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    marginLeft: 12,
  },
  moreItemsText: {
    color: colors.textTertiary,
    fontSize: 12,
    fontFamily: "Poppins-Italic",
    marginTop: 4,
  },
  metaSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borders,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
  },
  acceptButton: {
    backgroundColor: colors.success,
    shadowColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
  },
  buttonText: {
    color: "white",
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
    gap: 16,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },
});

export default OrderRequestsScreen;
