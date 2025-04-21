import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Pressable,
    TouchableOpacity,
    Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../../constants/colors";

const RiderOrdersScreen = () => {
    const [activeSegment, setActiveSegment] = useState("current");

    // Dummy Data
    const orders = {
        current: [
            {
                id: "#DLVR2984",
                status: "picked_up",
                restaurant: "Burger Kingdom",
                customer: "John Carter",
                pickupTime: "11:45 AM",
                distance: "2.5 km",
                earnings: "₹185",
                progress: 0.6,
            },
        ],
        upcoming: [
            {
                id: "#DLVR3129",
                status: "accepted",
                restaurant: "Pizza Haven",
                customer: "Sarah Smith",
                pickupTime: "12:30 PM",
                distance: "3.2 km",
                earnings: "₹225",
            },
        ],
        history: [
            {
                id: "#DLVR2871",
                status: "completed",
                restaurant: "Sushi Master",
                customer: "Mike Johnson",
                date: "2023-08-20",
                earnings: "₹165",
            },
        ],
    };

    const OrderSegment = ({ title, value }) => (
        <Pressable
            style={[styles.segmentButton, activeSegment === value && styles.activeSegment]}
            onPress={() => setActiveSegment(value)}
        >
            <Text style={[styles.segmentText, activeSegment === value && styles.activeSegmentText]}>
                {title}
            </Text>
        </Pressable>
    );

    const CurrentOrderCard = ({ order }) => (
        <View style={styles.currentCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.orderId}>{order.id}</Text>
                <View style={[styles.statusBadge, styles[order.status]]}>
                    <Text style={styles.statusText}>
                        {order.status.replace("_", " ").toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.orderInfo}>
                <Ionicons name="restaurant" size={20} color={colors.textSecondary} />
                <Text style={styles.infoText}>{order.restaurant}</Text>
            </View>

            <View style={styles.orderInfo}>
                <Ionicons name="person" size={20} color={colors.textSecondary} />
                <Text style={styles.infoText}>{order.customer}</Text>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressLabels}>
                    <Text style={styles.progressLabel}>Accepted</Text>
                    <Text style={styles.progressLabel}>Delivering</Text>
                    <Text style={styles.progressLabel}>Completed</Text>
                </View>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${order.progress * 100}%` }]} />
                </View>
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="navigate" size={20} color={colors.primary} />
                    <Text style={styles.actionText}>Navigate</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="call" size={20} color={colors.primary} />
                    <Text style={styles.actionText}>Contact</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const UpcomingOrderCard = ({ order }) => (
        <View style={styles.upcomingCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.orderId}>{order.id}</Text>
                <Text style={styles.earningText}>Earnings: {order.earnings}</Text>
            </View>

            <View style={styles.orderInfo}>
                <Ionicons name="time" size={16} color={colors.textSecondary} />
                <Text style={styles.infoText}>Pickup at {order.pickupTime}</Text>
            </View>

            <View style={styles.orderInfo}>
                <Ionicons name="restaurant" size={16} color={colors.textSecondary} />
                <Text style={styles.infoText}>{order.restaurant}</Text>
                <Text style={styles.distanceText}>{order.distance}</Text>
            </View>
        </View>
    );

    const HistoryOrderCard = ({ order }) => (
        <View style={styles.historyCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.orderId}>{order.id}</Text>
                <Text style={styles.earningText}>{order.earnings}</Text>
            </View>

            <View style={styles.orderInfo}>
                <Ionicons name="restaurant" size={14} color={colors.textSecondary} />
                <Text style={styles.infoText}>{order.restaurant}</Text>
            </View>

            <View style={styles.orderInfo}>
                <Ionicons name="calendar" size={14} color={colors.textSecondary} />
                <Text style={styles.infoText}>{order.date}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {/* Segment Control */}
                <View style={styles.segmentContainer}>
                    <OrderSegment title="Current" value="current" />
                    <OrderSegment title="Upcoming" value="upcoming" />
                    <OrderSegment title="History" value="history" />
                </View>

                {/* Orders List */}
                <View style={styles.contentContainer}>
                    {orders[activeSegment].length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="fast-food" size={48} color={colors.borders} />
                            <Text style={styles.emptyText}>No {activeSegment} orders</Text>
                        </View>
                    ) : (
                        orders[activeSegment].map((order, index) => {
                            switch(activeSegment) {
                                case "current":
                                    return <CurrentOrderCard key={index} order={order} />;
                                case "upcoming":
                                    return <UpcomingOrderCard key={index} order={order} />;
                                case "history":
                                    return <HistoryOrderCard key={index} order={order} />;
                            }
                        })
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    segmentContainer: {
        flexDirection: "row",
        margin: 16,
        backgroundColor: colors.background,
        borderRadius: 12,
        elevation: 2,
    },
    segmentButton: {
        flex: 1,
        padding: 16,
        alignItems: "center",
    },
    activeSegment: {
        backgroundColor: colors.primary,
        borderRadius: 12,
    },
    segmentText: {
        fontFamily: "Poppins-Medium",
        color: colors.textSecondary,
    },
    activeSegmentText: {
        color: "white",
    },
    contentContainer: {
        paddingHorizontal: 16,
    },
    currentCard: {
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    upcomingCard: {
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.borders,
    },
    historyCard: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    orderId: {
        fontFamily: "Poppins-Medium",
        color: colors.textSecondary,
        fontSize: 14,
    },
    statusBadge: {
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    accepted: {
        backgroundColor: colors.primaryLight,
    },
    picked_up: {
        backgroundColor: colors.warningBg,
    },
    completed: {
        backgroundColor: colors.successBg,
    },
    statusText: {
        fontSize: 12,
        fontFamily: "Poppins-Medium",
    },
    orderInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 8,
        gap: 8,
    },
    infoText: {
        flex: 1,
        color: colors.textPrimary,
    },
    distanceText: {
        color: colors.textSecondary,
    },
    earningText: {
        fontFamily: "Poppins-Medium",
        color: colors.primary,
    },
    progressContainer: {
        marginVertical: 16,
    },
    progressLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    progressLabel: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    progressBar: {
        height: 4,
        backgroundColor: colors.borders,
        borderRadius: 2,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: colors.primary,
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        borderRadius: 8,
        backgroundColor: colors.primaryLight,
        gap: 8,
    },
    actionText: {
        color: colors.primary,
        fontFamily: "Poppins-Medium",
    },
    emptyContainer: {
        alignItems: "center",
        padding: 40,
    },
    emptyText: {
        color: colors.textSecondary,
        marginTop: 16,
    },
});

export default RiderOrdersScreen;