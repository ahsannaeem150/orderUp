import React, {useContext, useEffect, useState, useCallback} from "react";
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
    ActivityIndicator,
    RefreshControl, Dimensions,
} from "react-native";
import images from "../../../constants/images";
import Icon from "react-native-vector-icons/Ionicons";
import {ProgressBar, Chip} from "react-native-paper";
import {Ionicons} from "@expo/vector-icons";
import colors from "../../../constants/colors";
import {AuthContext} from "../../context/authContext";
import {useOrders} from "../../context/OrderContext";
import {router} from "expo-router";

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
    } = useOrders()


    const {state, socket, API_URL} = useContext(AuthContext);
    const restaurantId = state.restaurant._id;
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [prepTime, setPrepTime] = useState(30);
    const [isLoading, setIsLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasFetchedHistory, setHasFetchedHistory] = useState(false);
    // const [loading, setLoading] = useState(false);
    const [processingOrderId, setProcessingOrderId] = useState(null);

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
            const newActive = {...prev};
            delete newActive[orderId];
            return newActive;
        });
    };

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            if (showHistory) {
                await fetchHistoricalOrders(restaurantId);
            } else {
                await fetchActiveOrders(restaurantId);
            }
        } catch (error) {
            console.error("Error loading orders:", error);
        } finally {
            setIsLoading(false);
        }
    }, [showHistory, restaurantId]);


    useEffect(() => {
        loadData();
        socket.emit("join-restaurant-room", restaurantId);

        const handleOrderUpdated = (updatedOrder) => {
            setProcessingOrderId(null);
            setActiveOrders((prev) => {
                const newActive = {...prev};
                newActive[updatedOrder._id] = updatedOrder;
                return newActive;
            });
        };

        const handleOrderCreated = (newOrder) => {
            setProcessingOrderId(null);
            setActiveOrders((prev) => ({
                ...prev,
                [newOrder._id]: newOrder
            }));
        };

        const handleOrderRemoved = ({orderId, status}) => {
            setProcessingOrderId(null);
            moveToHistory({orderId, status});
        };

        socket.on("order-removed", handleOrderRemoved);
        socket.on("order-updated", handleOrderUpdated);
        socket.on("order-created", handleOrderCreated);

        return () => {
            socket.off("order-updated", handleOrderUpdated);
            socket.off("order-created", handleOrderCreated);
            socket.off("order-removed", handleOrderRemoved);
        };
    }, [restaurantId]);

    const handleStatusUpdate = (orderId, newStatus) => {
        const confirmationMessages = {
            Ready: "Mark this order as ready for pickup?",
            Completed: "Mark this order as completed?",
            Cancelled: "Are you sure you want to cancel this order?",
        };

        Alert.alert("Confirm Action", confirmationMessages[newStatus], [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Confirm",
                onPress: async () => {
                    setProcessingOrderId(orderId);
                    try {
                        await socket.emit("update-order-status", {
                            orderId,
                            status: newStatus,
                            restaurantId,
                        });
                    } catch (error) {
                        console.error("Status update error:", error);
                    }
                },
            },
        ]);
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
                    onPress: async () => {
                        setProcessingOrderId(orderId);
                        try {
                            await socket.emit("reject-order", {
                                orderId,
                                restaurantId,
                                cancellationReason: "Restaurant decision",
                            });
                        } catch (error) {
                            console.error("Rejection error:", error);
                        }
                    },
                },
            ]
        );
    };

    const handleAcceptWithTime = async (orderId) => {
        if (!prepTime || prepTime < 5) {
            Alert.alert(
                "Invalid Time",
                "Please enter preparation time (minimum 5 minutes)"
            );
            return;
        }

        setProcessingOrderId(orderId);
        try {
            await socket.emit("accept-order", {
                orderId,
                restaurantId,
                prepTime: prepTime + " minutes",
            });
            setShowTimePicker(false);
        } catch (error) {
            console.error("Acceptance error:", error);
        }
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
                                    color={index === currentIndex ? colors.activeIcon : "#4CAF50"}
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
                <Icon name="time-outline" size={20} color="#666"/>
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
    const renderOrder = ({item: order}) => {
        const isHistorical = showHistory;
        const isProcessing = processingOrderId === order._id;
        const statusColors = {
            Preparing: colors.accent,
            Ready: colors.success,
            Completed: colors.muted,
            Cancelled: colors.errorText,
            Pending: colors.accent,
            Removed: colors.errorText,
        };

        return (
            <TouchableOpacity style={styles.orderCard} onPress={() => {
                handleOrderPress(
                    order._id,
                    isHistorical || ["Cancelled", "Completed"].includes(order.status)
                )
            }
            }>
                <View style={styles.orderHeader}>
                    <View style={styles.userInfoContainer}>
                        {order.user?.profilePicture && (
                            <Image
                                source={{
                                    uri: `${API_URL}/images/${order.user.profilePicture}`,
                                }}
                                style={styles.profileImage}
                            />
                        )}
                        <View>
                            <Text style={styles.orderId}>Order #{order._id.slice(-6)}</Text>
                            <Text style={styles.customerInfo}>
                                {order.user?.name} • {order.user?.phone}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.statusContainer}>
                        <Text
                            style={[styles.statusText, {color: statusColors[order.status]}]}
                        >
                            {order.status}
                        </Text>
                        {!isHistorical && ["Completed", "Cancelled", "Removed"].includes(order.status) && (
                            <TouchableOpacity onPress={() => {
                                handleRemoveOrder(order._id)
                            }}>
                                <Ionicons
                                    name="close-circle"
                                    size={24}
                                    color={colors.errorText}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Order Items */}
                <View style={styles.itemsContainer}>
                    <Text style={styles.sectionTitle}>Order Items:</Text>
                    {order.items.map((orderItem, index) => (
                        <View key={index} style={styles.itemRow}>
                            <Text style={styles.itemName}>{orderItem.name}</Text>
                            <View style={styles.itemDetails}>
                                <Text>{orderItem.quantity}x</Text>
                                <Text>Rs{orderItem.price}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Order Summary */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                        <Text>Total:</Text>
                        <Text style={styles.totalAmount}>Rs{order.totalAmount}</Text>
                    </View>
                </View>

                {/* Preparation Timeline */}
                {renderPreparationTimeline(order)}

                {/* Preparation Timer */}
                {order.status === "Preparing" && renderPreparationTimer(order)}

                {/* Customer Notes */}
                {order.notes && (
                    <TouchableOpacity style={styles.notesContainer} onPress={() => {
                    }}>
                        <Icon name="document-text-outline" size={16} color="#666"/>
                        <Text style={styles.notesText} numberOfLines={1}>
                            Customer Notes: {order.notes}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Order Footer with Actions */}
                <View style={styles.orderFooter}>
                    {order.status === "Pending" ? (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.setTimeButton]}
                            onPress={() => {
                                setSelectedOrder(order);
                                setShowTimePicker(true);
                            }}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <ActivityIndicator color={colors.textInverted}/>
                            ) : (
                                <>
                                    <Icon
                                        name="time-outline"
                                        size={18}
                                        color={colors.textInverted}
                                    />
                                    <Text style={styles.buttonText}>Set Prep Time</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <Chip
                            mode="outlined"
                            style={[
                                styles.statusChip,
                                {borderColor: statusColors[order.status]},
                            ]}
                            textStyle={[
                                styles.chipText,
                                {color: statusColors[order.status]},
                            ]}
                        >
                            {order.status}
                        </Chip>
                    )}

                    <View style={styles.actionGroup}>
                        {/* Action Buttons with Loading States */}
                        {order.status === "Pending" && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.acceptButton]}
                                onPress={() => handleStatusUpdate(order._id, "Preparing")}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator color={colors.textInverted}/>
                                ) : (
                                    <>
                                        <Icon
                                            name="checkmark"
                                            size={18}
                                            color={colors.textInverted}
                                        />
                                        <Text style={styles.buttonText}>Accept</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        {order.status === "Preparing" && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.readyButton]}
                                onPress={() => handleStatusUpdate(order._id, "Ready")}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator color={colors.textInverted}/>
                                ) : (
                                    <>
                                        <Icon
                                            name="fast-food"
                                            size={18}
                                            color={colors.textInverted}
                                        />
                                        <Text style={styles.buttonText}>Mark Ready</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        {order.status === "Ready" && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.completeButton]}
                                onPress={() => handleStatusUpdate(order._id, "Completed")}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator color={colors.textInverted}/>
                                ) : (
                                    <>
                                        <Icon
                                            name="checkmark-done"
                                            size={18}
                                            color={colors.textInverted}
                                        />
                                        <Text style={styles.buttonText}>Complete</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        {/* Conditional Cancel Button */}
                        {!["Completed", "Cancelled", "Removed"].includes(order.status) && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={() => handleReject(order._id)}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator color={colors.textInverted}/>
                                ) : (
                                    <>
                                        <Icon
                                            name="close-circle"
                                            size={18}
                                            color={colors.textInverted}
                                        />
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary}/>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, !showHistory && styles.activeTab]}
                    onPress={() => setShowHistory(false)}
                >
                    <Text style={[styles.tabText, !showHistory && styles.activeTabText]}>
                        Active Orders
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, showHistory && styles.activeTab]}
                    onPress={() => setShowHistory(true)}
                >
                    <Text style={[styles.tabText, showHistory && styles.activeTabText]}>
                        Order History
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={Object.values(showHistory ? historicalOrders : activeOrders)}
                renderItem={renderOrder}
                keyExtractor={(order) => order._id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        {isLoading ? (
                            <ActivityIndicator size="large" color={colors.primary}/>
                        ) : (
                            <View style={styles.emptyList}>
                                <Image source={images.empty} style={styles.image}/>
                                <Text style={styles.emptyText}>
                                    {showHistory ? "No historical orders" : "No active orders"}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            />

            <Modal visible={showTimePicker} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Estimated Preparation Time</Text>

                        <View style={styles.timeInputContainer}>
                            <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() => setPrepTime(Math.max(5, prepTime - 5))}
                            >
                                <Icon name="remove" size={24} color="#666"/>
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
                                <Icon name="add" size={24} color="#666"/>
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
        </View>
    );
};
export default Orders;

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
        backgroundColor: colors.background,
    },
    tabs: {
        flexDirection: "row",
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        padding: 12,
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: colors.borders,
    },
    activeTab: {
        borderBottomColor: colors.accent,
    },
    tabText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    activeTabText: {
        color: colors.textPrimary,
        fontFamily: "Poppins-SemiBold",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: Dimensions.get("window").height - 200,
        padding: 20,
    },
    emptyList: {flex: 1, justifyContent: "center", alignItems: "center"},
    image: {
        width: 200,
        height: 200,
        marginBottom: 24,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 20,
        marginBottom: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: "Poppins-SemiBold",
        color: colors.textPrimary,
    },
    logo: {
        width: 40,
        height: 40,
    },

    // Order Card
    orderCard: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.primary,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },

    // Order Header
    orderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.borders,
    },
    userInfoContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    orderId: {
        fontSize: 16,
        fontFamily: "Poppins-Medium",
        color: colors.textPrimary,
    },
    customerInfo: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    statusContainer: {
        alignItems: "flex-end",
    },
    statusText: {
        fontSize: 14,
        fontFamily: "Poppins-Medium",
    },

    // Order Details
    itemsContainer: {
        marginVertical: 12,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.borders,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: "Poppins-SemiBold",
        color: colors.textPrimary,
        marginBottom: 8,
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 8,
    },
    itemName: {
        fontSize: 14,
        color: colors.textPrimary,
        flex: 1,
        marginRight: 16,
    },
    itemDetails: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minWidth: 80,
    },

    // Order Summary
    summaryContainer: {
        marginTop: 12,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 4,
    },
    totalAmount: {
        fontSize: 16,
        fontFamily: "Poppins-SemiBold",
        color: colors.success,
    },

    // Timeline
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
        backgroundColor: colors.borders,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 4,
    },
    activeDot: {
        backgroundColor: colors.success,
    },
    currentDot: {
        backgroundColor: colors.success,
    },
    timelineConnector: {
        position: "absolute",
        top: 11,
        left: "50%",
        right: "-50%",
        height: 2,
        backgroundColor: colors.borders,
        zIndex: -1,
    },
    activeConnector: {
        backgroundColor: colors.success,
    },
    timelineLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: "center",
    },
    activeLabel: {
        color: colors.textPrimary,
        fontFamily: "Poppins-Medium",
    },

    // Timer
    timerContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
        marginVertical: 8,
    },
    timerText: {
        marginLeft: 8,
        marginRight: 16,
        fontSize: 16,
        fontFamily: "Poppins-Medium",
        color: colors.textPrimary,
    },
    progressBar: {
        flex: 1,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.successBg,
    },

    // Notes
    notesContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.warningBg,
        padding: 12,
        borderRadius: 8,
        marginVertical: 8,
    },
    notesText: {
        marginLeft: 8,
        color: colors.textPrimary,
        fontSize: 14,
        flex: 1,
    },

    // Order Footer
    orderFooter: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.borders,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    actionGroup: {
        flexDirection: "row",
        gap: 8,
        marginLeft: "auto",
    },

    // Buttons
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        gap: 8,
        minWidth: 100,
        justifyContent: "center",
    },
    buttonText: {
        color: colors.textInverted,
        fontFamily: "Poppins-Medium",
        fontSize: 14,
    },
    acceptButton: {
        backgroundColor: colors.success,
    },
    readyButton: {
        backgroundColor: colors.borders,
    },
    completeButton: {
        backgroundColor: colors.muted,
    },
    cancelButton: {
        backgroundColor: colors.errorText,
    },
    setTimeButton: {
        backgroundColor: colors.accent,
    },

    // Status Chip
    statusChip: {
        borderColor: colors.success,
        backgroundColor: colors.successBg,
    },
    chipText: {
        color: colors.success,
        fontFamily: "Poppins-Medium",
    },


    // Modal
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: colors.background,
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: "Poppins-SemiBold",
        color: colors.textPrimary,
        marginBottom: 16,
        textAlign: "center",
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
        borderColor: colors.borders,
        marginHorizontal: 10,
    },
    timeInput: {
        borderWidth: 1,
        borderColor: colors.borders,
        borderRadius: 8,
        padding: 12,
        fontSize: 18,
        textAlign: "center",
        marginVertical: 12,
        color: colors.textPrimary,
    },
    minutesText: {
        fontSize: 16,
        color: colors.textSecondary,
        marginLeft: 10,
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
    confirmButton: {
        backgroundColor: colors.success,
    },
    closeButton: {
        backgroundColor: colors.muted,
    },
});
