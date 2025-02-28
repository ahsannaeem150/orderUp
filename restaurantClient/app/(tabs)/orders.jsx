import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../context/authContext";
import { images } from "../../constants";
import Icon from "react-native-vector-icons/Ionicons";
import { ProgressBar, Chip } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

const Orders = () => {
  const { state, socket } = useContext(AuthContext);
  const restaurantId = state.restaurant._id;
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [prepTime, setPrepTime] = useState(30);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notesModalVisible, setNotesModalVisible] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`/auth/${restaurantId}/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    socket.emit("join-restaurant-room", restaurantId);
    fetchOrders();

    const handleOrderUpdated = (updatedOrder) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    };

    const handleOrderCreated = (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
    };

    socket.on("order-updated", handleOrderUpdated);
    socket.on("order-created", handleOrderCreated);

    return () => {
      socket.off("order-updated", handleOrderUpdated);
      socket.off("order-created", handleOrderCreated);
    };
  }, [restaurantId]);

  const handleStatusUpdate = (orderId) => {
    const order = orders.find((o) => o._id === orderId);
    if (!order) return;

    let newStatus;
    let confirmationMessage;

    if (order.status === "Preparing") {
      newStatus = "Ready";
      confirmationMessage = "Mark this order as ready for pickup?";
    } else if (order.status === "Ready") {
      newStatus = "Completed";
      confirmationMessage = "Mark this order as completed?";
    }

    if (newStatus) {
      Alert.alert("Confirm Action", confirmationMessage, [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            socket.emit("update-order-status", {
              orderId,
              status: newStatus,
              restaurantId,
            });
          },
        },
      ]);
    }
  };
  const handleReject = (orderId) => {
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
          onPress: () => {
            socket.emit("reject-order", {
              orderId,
              restaurantId,
              cancellationReason: "Restaurant decision",
            });
          },
        },
      ]
    );
  };
  const handleAcceptWithTime = (orderId) => {
    if (!prepTime || prepTime < 5) {
      Alert.alert(
        "Invalid Time",
        "Please enter preparation time (minimum 5 minutes)"
      );
      return;
    }
    socket.emit("accept-order", {
      orderId,
      restaurantId,
      prepTime: parseInt(prepTime),
    });
    setShowTimePicker(false);
  };

  const renderPreparationTimeline = (order) => {
    const statusFlow = ["Pending", "Preparing", "Ready", "Completed"];
    const currentIndex = statusFlow.indexOf(order.status);

    return (
      <View style={styles.timelineContainer}>
        {statusFlow.map((status, index) => (
          <View key={status} style={styles.timelineStep}>
            <View
              style={[
                styles.timelineDot,
                index <= currentIndex && styles.activeDot,
                index === currentIndex && styles.currentDot,
              ]}
            >
              {index <= currentIndex && (
                <Icon
                  name="checkmark"
                  size={12}
                  color={index === currentIndex ? "#fff" : "#4CAF50"}
                />
              )}
            </View>
            <Text
              style={[
                styles.timelineLabel,
                index <= currentIndex && styles.activeLabel,
              ]}
            >
              {status}
            </Text>
            {index < statusFlow.length - 1 && (
              <View
                style={[
                  styles.timelineConnector,
                  index < currentIndex && styles.activeConnector,
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderPreparationTimer = (order) => {
    if (!order.acceptedAt) return null;

    const prepDuration = order.prepTime * 60 * 1000;
    const elapsed = Date.now() - new Date(order.acceptedAt).getTime();
    const remaining = Math.max(0, prepDuration - elapsed);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    return (
      <View style={styles.timerContainer}>
        <Icon name="time-outline" size={20} color="#666" />
        <Text style={styles.timerText}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </Text>
        <ProgressBar
          progress={elapsed / prepDuration}
          color="#4CAF50"
          style={styles.progressBar}
        />
      </View>
    );
  };
  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item._id.slice(-6)}</Text>
          <Text style={styles.customerInfo}>
            {item.userId?.name} • {item.userId?.phone}
          </Text>
        </View>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
      {/* Order Items */}
      <View style={styles.itemsContainer}>
        <Text style={styles.sectionTitle}>Order Items:</Text>
        {item.items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.itemDetails}>
              <Text>{item.quantity}x</Text>
              <Text>Rs{item.price}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Order Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text>Total:</Text>
          <Text style={styles.totalAmount}>Rs{item.totalAmount}</Text>
        </View>
      </View>
      {renderPreparationTimeline(item)}

      {item.status === "Preparing" && renderPreparationTimer(item)}

      {item.notes && (
        <TouchableOpacity
          style={styles.notesContainer}
          onPress={() => {
            setSelectedOrder(item);
            setNotesModalVisible(true);
          }}
        >
          <Icon name="document-text-outline" size={16} color="#666" />
          <Text style={styles.notesText} numberOfLines={1}>
            Customer Notes: {item.notes}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.orderFooter}>
        {item.status === "Pending" ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.setTimeButton]}
            onPress={() => {
              setSelectedOrder(item);
              setShowTimePicker(true);
            }}
          >
            <Icon name="time-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>Set Prep Time</Text>
          </TouchableOpacity>
        ) : (
          <Chip
            mode="outlined"
            style={styles.statusChip}
            textStyle={styles.chipText}
          >
            {item.status}
          </Chip>
        )}

        <View style={styles.actionGroup}>
          {["Preparing", "Ready"].includes(item.status) && (
            <TouchableOpacity
              style={[styles.actionButton, styles.nextStepButton]}
              onPress={() => handleStatusUpdate(item._id)}
            >
              <Icon
                name={
                  item.status === "Preparing" ? "fast-food" : "checkmark-done"
                }
                size={18}
                color="#fff"
              />
              <Text style={styles.buttonText}>
                {item.status === "Preparing" ? "Mark Ready" : "Complete Order"}
              </Text>
            </TouchableOpacity>
          )}

          {item.status !== "Completed" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleReject(item._id)}
            >
              <Icon name="close-circle" size={18} color="#fff" />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Current Orders</Text>
        <Image source={images.logoSmall} style={styles.logo} />
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image source={images.empty} style={styles.emptyImage} />
          <Text style={styles.emptyText}>No active orders</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal visible={showTimePicker} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Estimated Preparation Time</Text>

            <View style={styles.timeInputContainer}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setPrepTime(Math.max(5, prepTime - 5))}
              >
                <Icon name="remove" size={24} color="#666" />
              </TouchableOpacity>

              <TextInput
                style={styles.timeInput}
                keyboardType="numeric"
                value={String(prepTime)}
                onChangeText={(t) => setPrepTime(t.replace(/[^0-9]/g, ""))}
              />
              <Text style={styles.minutesText}>minutes</Text>

              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setPrepTime(prepTime + 5)}
              >
                <Icon name="add" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => handleAcceptWithTime(selectedOrder?._id)}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notes Modal */}
      <Modal visible={notesModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Customer Notes</Text>
            <Text style={styles.notesFullText}>
              {selectedOrder?.notes || "No notes provided"}
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, styles.closeButton]}
              onPress={() => setNotesModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
export default Orders;

const statusColors = {
  Pending: "#FFA726",
  Preparing: "#4CAF50",
  Completed: "#9E9E9E",
  Cancelled: "#EF5350",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    marginBottom: 35,
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  timeButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 10,
  },
  minutesText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#666",
  },
  customerInfo: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  itemsContainer: {
    marginVertical: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  summaryContainer: {
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  logo: {
    width: 40,
    height: 40,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  totalAmount: {
    fontWeight: "600",
    color: "#2e7d32",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  itemName: {
    fontSize: 14,
    color: "#666",
    flex: 5,
  },
  itemDetails: {
    flexDirection: "row",
    alignItems: "center",
    flex: 2,
    justifyContent: "space-between",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
    marginRight: 16,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  orderFooter: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#EF5350",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyImage: {
    width: 200,
    height: 200,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
  },
  listContent: {
    paddingBottom: 32,
  },
  timelineContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  timelineStep: {
    alignItems: "center",
    flex: 1,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  activeDot: {
    backgroundColor: "#4CAF50",
  },
  currentDot: {
    backgroundColor: "#2196F3",
  },
  timelineConnector: {
    position: "absolute",
    top: 11,
    left: "50%",
    right: "-50%",
    height: 2,
    backgroundColor: "#e0e0e0",
    zIndex: -1,
  },
  activeConnector: {
    backgroundColor: "#4CAF50",
  },
  timelineLabel: {
    fontSize: 12,
    color: "#9e9e9e",
    textAlign: "center",
  },
  activeLabel: {
    color: "#333",
    fontWeight: "500",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  timerText: {
    marginLeft: 8,
    marginRight: 16,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  notesText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
    flex: 1,
  },
  notesFullText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    padding: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: "center",
    marginVertical: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statusChip: {
    borderColor: "#4CAF50",
    backgroundColor: "#e8f5e9",
  },
  chipText: {
    color: "#2e7d32",
  },
  actionGroup: {
    flexDirection: "row",
    gap: 8,
    marginLeft: "auto",
  },
  setTimeButton: {
    backgroundColor: "#FFA726",
  },
  nextStepButton: {
    backgroundColor: "#2196F3",
  },
  closeButton: {
    backgroundColor: "#757575",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 8,
    elevation: 2,
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#EF5350",
  },
  nextStepButton: {
    backgroundColor: "#2196F3",
  },
});
