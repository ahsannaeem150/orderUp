import React, {useCallback, useContext, useEffect, useState} from "react";
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
import {Ionicons} from "@expo/vector-icons";
import {AuthContext} from "../../context/authContext";
import {images} from "../../../constants";
import colors from "../../../constants/colors";
import {useOrders} from "../../context/OrderContext";
import {router} from "expo-router";

const Orders = () => {
    const {
        activeOrders,
        historicalOrders,
        fetchOrder,
        moveToHistory,
        setCurrentOrder,
        fetchActiveOrders,
        fetchHistoricalOrders,
    } = useOrders();

    const {state, socket, API_URL} = useContext(AuthContext);
    const [showHistory, setShowHistory] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    const user = state.user;

    const loadData = useCallback(async () => {
        try {
            if (showHistory) {
                await fetchHistoricalOrders(user._id);
            } else {
                await fetchActiveOrders(user._id);
            }
        } catch (error) {
            console.error("Error loading orders:", error);
        }
    }, [showHistory, user._id]);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
    }, [loadData]);

    useEffect(() => {
        loadData();
        socket.emit("join-user-room", user._id);

        const handleOrderUpdate = (updatedOrder) => {
            if (["Completed", "Cancelled"].includes(updatedOrder.status)) {
                moveToHistory(updatedOrder);
            }
        };

        socket.on("order-updated", handleOrderUpdate);
        return () => socket.off("order-updated", handleOrderUpdate);
    }, [user._id, moveToHistory]);

    const handleCancelOrder = ({orderId, restaurantId}) => {
        Alert.alert(
            "Confirm Cancellation",
            "Are you sure you want to cancel this order?",
            [
                {text: "No", style: "cancel"},
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

    const handleRemoveOrder = useCallback(
        (orderId) => {
            if (showHistory) {
                setHistoricalOrders((prev) => {
                    const newHistory = {...prev};
                    delete newHistory[orderId];
                    return newHistory;
                });
            }
        },
        [showHistory]
    );

    const renderOrderItem = ({item}) => {
        const isHistorical = showHistory || ["Completed", "Cancelled"].includes(item.status);
        const restaurant = item.restaurant;
        const orderTime = new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

        const totalItems = item.items.reduce((acc, i) => acc + i.quantity, 0);
        const totalPrice = item.items.reduce((acc, i) => acc + i.price * i.quantity, 0);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => handleOrderPress(item._id, isHistorical)}
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
                    <Text style={[styles.status, {backgroundColor: statusColors[item.status]}]}>
                        {item.status}
                    </Text>
                    {isHistorical && (
                        <TouchableOpacity onPress={() => handleRemoveOrder(item._id)}>
                            <Ionicons name="close-circle" size={24} color={colors.errorText}/>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.detailsRow}>
                    <Ionicons name="fast-food" size={16} color={colors.textSecondary}/>
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

                {!isHistorical && (
                    <>
                        <View style={styles.progressContainer}>
                            <View
                                style={[
                                    styles.progressBar,
                                    {width: `${statusProgress[item.status] * 100}%`},
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
                                disabled={cancellingOrderId === item._id}
                            >
                                {cancellingOrderId === item._id ? (
                                    <ActivityIndicator color={colors.errorText}/>
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
                renderItem={renderOrderItem}
                keyExtractor={(item) => item._id}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh}/>
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Image source={images.empty} style={styles.image}/>
                        <Text style={styles.emptyText}>
                            {showHistory ? "No historical orders" : "No active orders"}
                        </Text>
                    </View>
                )}
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
        padding: 16,
        marginBottom: 50,
        backgroundColor: colors.background,
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
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
        fontFamily: 'Poppins-SemiBold',
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
        shadowOffset: {width: 0, height: 2},
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
