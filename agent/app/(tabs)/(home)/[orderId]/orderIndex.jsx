import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Image,
    useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../../../constants/colors";

const OrderDetailScreen = () => {
    const { width } = useWindowDimensions();

    // Dummy Data
    const order = {
        id: "#DLVR2984",
        status: "picked_up",
        restaurant: {
            name: "Burger Kingdom",
            address: "12 Food Street, Downtown",
            contact: "+91 98765 43210",
            distance: "1.2 km",
            coordinates: { lat: 28.7041, lng: 77.1025 },
        },
        customer: {
            name: "John Carter",
            address: "24 Park Avenue, 5th Floor",
            contact: "+91 98765 12340",
            notes: "Gate code: 7788 | Call before delivery",
            coordinates: { lat: 28.7289, lng: 77.1077 },
        },
        items: [
            { name: "Classic Burger", price: 299, quantity: 2 },
            { name: "Fries", price: 99, quantity: 1 },
            { name: "Coke", price: 59, quantity: 2 },
        ],
        payment: {
            method: "cash",
            total: 755,
            deliveryFee: 98,
        },
        timeline: {
            accepted: "10:15 AM",
            picked_up: "10:32 AM",
            delivered: null,
        },
    };

    const statusConfig = {
        accepted: { label: "ACCEPTED", color: colors.primary },
        picked_up: { label: "ON THE WAY", color: colors.warning },
        delivered: { label: "DELIVERED", color: colors.success },
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.orderNumber}>{order.id}</Text>
                        <Text style={styles.orderStatus}>{statusConfig[order.status].label}</Text>
                    </View>
                    <View style={[styles.statusIndicator, { backgroundColor: statusConfig[order.status].color }]} />
                </View>

                {/* Delivery Progress Visualization */}
                <View style={styles.progressContainer}>
                    <View style={styles.routeVisualization}>
                        <View style={styles.routeLine} />
                        <View style={[styles.locationPin, styles.restaurantPin]}>
                            <Ionicons name="restaurant" size={18} color="white" />
                        </View>
                        <View style={[styles.locationPin, styles.customerPin]}>
                            <Ionicons name="person" size={18} color="white" />
                        </View>
                        <View style={[styles.deliveryBike, { left: order.status === "accepted" ? "20%" : "70%" }]}>
                            <Ionicons name="bicycle" size={28} color={colors.primary} />
                        </View>
                    </View>

                    <View style={styles.progressLabels}>
                        <Text style={styles.progressLabel}>Pickup</Text>
                        <Text style={styles.progressLabel}>Delivery</Text>
                    </View>
                </View>

                {/* Navigation Buttons */}
                <View style={styles.navButtonContainer}>
                    <TouchableOpacity style={styles.navButton}>
                        <Ionicons name="navigate" size={24} color={colors.primary} />
                        <Text style={styles.navButtonText}>To Restaurant</Text>
                        <Text style={styles.navDistance}>{order.restaurant.distance}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navButton}>
                        <Ionicons name="navigate" size={24} color={colors.success} />
                        <Text style={styles.navButtonText}>To Customer</Text>
                        <Text style={styles.navDistance}>4.2 km</Text>
                    </TouchableOpacity>
                </View>

                {/* Timeline Progress */}
                <View style={styles.timelineContainer}>
                    <View style={styles.timeline}>
                        <TimelineStep
                            title="Accepted"
                            time={order.timeline.accepted}
                            isActive={true}
                        />
                        <TimelineStep
                            title="Picked Up"
                            time={order.timeline.picked_up}
                            isActive={order.status === "picked_up"}
                            isCompleted={true}
                        />
                        <TimelineStep
                            title="Delivered"
                            time={order.timeline.delivered}
                            isActive={false}
                        />
                    </View>
                </View>

                {/* Order Details Sections */}
                <DetailSection title="ORDER DETAILS">
                    <DetailRow icon="fast-food" title="Items">
                        {order.items.map((item, index) => (
                            <Text key={index} style={styles.itemText}>
                                {item.quantity}x {item.name} - ₹{item.price * item.quantity}
                            </Text>
                        ))}
                    </DetailRow>

                    <DetailRow icon="cash" title="Payment">
                        <View style={styles.paymentBadge}>
                            <Text style={styles.paymentText}>{order.payment.method.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.totalAmount}>₹{order.payment.total}</Text>
                    </DetailRow>
                </DetailSection>

                <DetailSection title="CONTACT INFORMATION">
                    <DetailRow icon="business" title="Restaurant">
                        <Text style={styles.detailValue}>{order.restaurant.name}</Text>
                        <Text style={styles.detailSubtext}>{order.restaurant.contact}</Text>
                    </DetailRow>

                    <DetailRow icon="person" title="Customer">
                        <Text style={styles.detailValue}>{order.customer.name}</Text>
                        <Text style={styles.detailSubtext}>{order.customer.contact}</Text>
                    </DetailRow>

                    {order.customer.notes && (
                        <View style={styles.noteContainer}>
                            <Ionicons name="warning" size={18} color={colors.warning} />
                            <Text style={styles.noteText}>{order.customer.notes}</Text>
                        </View>
                    )}
                </DetailSection>
            </ScrollView>

            {/* Fixed Action Buttons */}
            <View style={styles.actionBar}>
                <TouchableOpacity style={styles.chatButton}>
                    <Ionicons name="chatbubble" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mainActionButton}>
                    <Ionicons name="navigate" size={24} color="white" />
                    <Text style={styles.mainActionText}>
                        {order.status === "accepted" ? "Navigate to Restaurant" : "Navigate to Customer"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// Reusable Components
const TimelineStep = ({ title, time, isActive, isCompleted }) => (
    <View style={styles.timelineStep}>
        <View style={[
            styles.timelineDot,
            isActive && styles.activeDot,
            isCompleted && styles.completedDot
        ]}>
            {isCompleted && <Ionicons name="checkmark" size={12} color="white" />}
        </View>
        <Text style={styles.timelineTitle}>{title}</Text>
        {time && <Text style={styles.timelineTime}>{time}</Text>}
    </View>
);

const DetailSection = ({ title, children }) => (
    <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionContent}>{children}</View>
    </View>
);

const DetailRow = ({ icon, title, children }) => (
    <View style={styles.detailRow}>
        <View style={styles.detailIcon}>
            <Ionicons name={icon} size={20} color={colors.textSecondary} />
        </View>
        <View style={styles.detailContent}>
            <Text style={styles.detailTitle}>{title}</Text>
            {children}
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    orderNumber: {
        fontSize: 18,
        fontFamily: "Poppins-SemiBold",
        color: colors.textPrimary,
    },
    orderStatus: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    progressContainer: {
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        marginBottom: 16,
    },
    routeVisualization: {
        height: 100,
        justifyContent: "center",
    },
    routeLine: {
        height: 3,
        backgroundColor: colors.borders,
        marginHorizontal: 30,
    },
    locationPin: {
        position: "absolute",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        elevation: 2,
    },
    restaurantPin: {
        backgroundColor: colors.primary,
        left: 20,
    },
    customerPin: {
        backgroundColor: colors.success,
        right: 20,
    },
    deliveryBike: {
        position: "absolute",
        backgroundColor: colors.background,
        borderRadius: 20,
        padding: 8,
        elevation: 4,
    },
    progressLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },
    progressLabel: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    navButtonContainer: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 24,
    },
    navButton: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        elevation: 2,
    },
    navButtonText: {
        fontFamily: "Poppins-Medium",
        marginTop: 8,
    },
    navDistance: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: 4,
    },
    timelineContainer: {
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        marginBottom: 16,
    },
    timeline: {
        flexDirection: "row",
        justifyContent: "space-between",
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
        marginBottom: 8,
    },
    activeDot: {
        backgroundColor: colors.warning,
    },
    completedDot: {
        backgroundColor: colors.success,
    },
    timelineTitle: {
        fontFamily: "Poppins-Medium",
        fontSize: 12,
        textAlign: "center",
    },
    timelineTime: {
        color: colors.textSecondary,
        fontSize: 10,
        marginTop: 4,
    },
    sectionContainer: {
        backgroundColor: colors.background,
        borderRadius: 16,
        elevation: 2,
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 16,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borders,
    },
    sectionContent: {
        padding: 16,
    },
    detailRow: {
        flexDirection: "row",
        marginVertical: 12,
    },
    detailIcon: {
        width: 40,
        alignItems: "center",
    },
    detailContent: {
        flex: 1,
    },
    detailTitle: {
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: 8,
    },
    detailValue: {
        fontFamily: "Poppins-Medium",
    },
    detailSubtext: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: 4,
    },
    itemText: {
        color: colors.textSecondary,
        marginVertical: 4,
    },
    paymentBadge: {
        backgroundColor: colors.primaryLight,
        alignSelf: "flex-start",
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 12,
        marginTop: 8,
    },
    paymentText: {
        color: colors.primary,
        fontSize: 12,
        fontFamily: "Poppins-Medium",
    },
    totalAmount: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 16,
        marginTop: 8,
    },
    noteContainer: {
        flexDirection: "row",
        backgroundColor: colors.warningBg,
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        alignItems: "center",
    },
    noteText: {
        color: colors.warning,
        marginLeft: 8,
        flex: 1,
    },
    actionBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        flexDirection: "row",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.borders,
        gap: 12,
    },
    chatButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.borders,
        justifyContent: "center",
        alignItems: "center",
    },
    mainActionButton: {
        flex: 1,
        backgroundColor: colors.primary,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        gap: 8,
    },
    mainActionText: {
        color: "white",
        fontFamily: "Poppins-SemiBold",
    },
});

export default OrderDetailScreen;