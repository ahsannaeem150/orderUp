import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../../constants/colors";
import images from "../../../constants/images";
import {router} from "expo-router";

const RiderHomeScreen = () => {
    const { width } = useWindowDimensions();
    const hasActiveOrders = true; // Toggle this to see both states

    // Dummy Data
    const deliveryData = {
        current: {
            orderId: "#RZ485P",
            restaurant: "Burger Palace",
            customer: "John D.",
            address: "45 Park Avenue, 2nd Floor",
            distance: "2.5 km",
            earnings: "₹185",
            progress: 0.4,
            eta: "28 min",
            status: "collecting",
        },
        upcoming: [
            {
                orderId: "#KT721M",
                restaurant: "Sushi Master",
                pickupTime: "11:45 AM",
                address: "12 Downtown Plaza",
                distance: "3.2 km",
            },
            {
                orderId: "#PL992S",
                restaurant: "Pizza Haven",
                pickupTime: "12:15 PM",
                address: "89 Riverside Drive",
                distance: "4.1 km",
            }
        ]
    };

    const quickActions = [
        { icon: "navigate", label: "Navigate", color: colors.primary },
        { icon: "document-text", label: "Details", color: colors.accent },
        { icon: "call", label: "Contact", color: colors.success },
    ];

    const StatusBadge = ({ status }) => {
        const statusConfig = {
            collecting: { label: "Collecting", color: colors.warning, icon: "cube" },
            delivering: { label: "Delivering", color: colors.primary, icon: "bicycle" },
            completed: { label: "Completed", color: colors.success, icon: "checkmark" },
        };

        const { label, color, icon } = statusConfig[status] || statusConfig.collecting;

        return (
            <View style={[styles.statusBadge, { backgroundColor: color + "20" }]}>
                <Ionicons name={icon} size={14} color={color} />
                <Text style={[styles.statusText, { color }]}>{label}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Good Morning, Rider!</Text>
                        <Text style={styles.subtitle}>
                            {hasActiveOrders ? `${deliveryData.upcoming.length + 1} active deliveries` : "Ready for orders"}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.profileButton}>
                        <Ionicons name="notifications" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>
                {hasActiveOrders ? (
                    <>
                {/* Live Activity Map */}
                <View style={[styles.mapContainer, { height: width * 0.4 }]}>
                    <Image
                        source={require('../../../assets/icon.png')}
                        style={styles.mapImage}
                        resizeMode="cover"
                    />
                    <StatusBadge status={deliveryData.current.status} />
                </View>

                {/* Current Delivery Card */}
                <View style={styles.deliveryCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.sectionTitle}>Active Delivery</Text>
                        <Text style={styles.orderId}>{deliveryData.current.orderId}</Text>
                    </View>

                    <View style={styles.deliveryInfo}>
                        <Ionicons name="fast-food" size={28} color={colors.textSecondary} />
                        <View style={styles.deliveryDetails}>
                            <Text style={styles.restaurantName}>{deliveryData.current.restaurant}</Text>
                            <Text style={styles.customerName}>to {deliveryData.current.customer}</Text>
                            <Text style={styles.deliveryAddress}>{deliveryData.current.address}</Text>
                        </View>
                    </View>

                    {/* Progress & Actions */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressLabels}>
                            <Text style={styles.progressLabel}>Pickup</Text>
                            <Text style={styles.progressLabel}>Delivery</Text>
                        </View>
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${deliveryData.current.progress * 100}%` }]} />
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="speedometer" size={20} color={colors.textSecondary} />
                            <Text style={styles.statValue}>{deliveryData.current.distance}</Text>
                            <Text style={styles.statLabel}>Distance</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="wallet" size={20} color={colors.textSecondary} />
                            <Text style={styles.statValue}>{deliveryData.current.earnings}</Text>
                            <Text style={styles.statLabel}>Earnings</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="time" size={20} color={colors.textSecondary} />
                            <Text style={styles.statValue}>{deliveryData.current.eta}</Text>
                            <Text style={styles.statLabel}>ETA</Text>
                        </View>
                    </View>

                    <View style={styles.actionsContainer}>
                        {quickActions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.actionButton, { backgroundColor: action.color }]}
                            >
                                <Ionicons name={action.icon} size={20} color="white" />
                                <Text style={styles.actionLabel}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Upcoming Deliveries */}
                <View style={styles.upcomingContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Upcoming Deliveries</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {deliveryData.upcoming.map((order, index) => (
                        <TouchableOpacity key={index} style={styles.upcomingCard} onPress={()=>{router.push("(home)/orderIndex")}}>
                            <View style={styles.orderIndicator}>
                                <Text style={styles.orderIndex}>#{index + 1}</Text>
                            </View>
                            <View style={styles.upcomingDetails}>
                                <Text style={styles.upcomingRestaurant}>{order.restaurant}</Text>
                                <View style={styles.upcomingMeta}>
                                    <Ionicons name="time" size={14} color={colors.textSecondary} />
                                    <Text style={styles.upcomingText}>{order.pickupTime}</Text>
                                    <Ionicons name="navigate" size={14} color={colors.textSecondary} />
                                    <Text style={styles.upcomingText}>{order.distance}</Text>
                                </View>
                                <Text style={styles.upcomingAddress}>{order.address}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
                    </>
                ) : (

                    <View style={styles.emptyContainer}>
                    <View style={styles.emptyIllustration}>
                    <Ionicons name="bicycle" size={72} color={colors.primaryLight} />
                    <View style={styles.emptyIconCircle} />
                    </View>
                    <Text style={styles.emptyTitle}>No Active Deliveries</Text>
                    <Text style={styles.emptySubtitle}>
                    You're all caught up! New orders will appear here automatically
                    </Text>

                    <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                    <Ionicons name="timer" size={24} color={colors.primary} />
                    <Text style={styles.statValue}>0m</Text>
                    <Text style={styles.statLabel}>Active Time</Text>
                    </View>
                    <View style={styles.statCard}>
                    <Ionicons name="flash" size={24} color={colors.primary} />
                    <Text style={styles.statValue}>100%</Text>
                    <Text style={styles.statLabel}>Availability</Text>
                    </View>
                    </View>
                    </View>
                    )}
            </ScrollView>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 24,
    },
    greeting: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 4,
    },
    profileButton: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: colors.background,
        elevation: 2,
    },
    earningsCard: {
        backgroundColor: colors.primaryLight,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    earningsLabel: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    earningsValue: {
        fontSize: 32,
        fontFamily: 'Poppins-SemiBold',
        color: colors.textPrimary,
        marginBottom: 16,
    },
    progressContainer: {
        height: 4,
        backgroundColor: colors.borders,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    targetText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 8,
    },
    mapContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
    },
    mapImage: {
        width: '100%',
        height: '100%',
    },
    locationBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    locationText: {
        marginLeft: 8,
        fontFamily: 'Poppins-Medium',
    },
    deliveryCard: {
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 16,
    },
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    deliveryDetails: {
        marginLeft: 16,
        flex: 1,
    },
    restaurantName: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
    },
    customerName: {
        color: colors.textSecondary,
        marginVertical: 4,
    },
    deliveryAddress: {
        color: colors.textTertiary,
        fontSize: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 12,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    orderId: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    upcomingContainer: {
        marginTop: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    viewAllText: {
        color: colors.primary,
        fontSize: 14,
    },
    upcomingCard: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 1,
    },
    orderIndicator: {
        backgroundColor: colors.primaryLight,
        borderRadius: 8,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    orderIndex: {
        color: colors.primary,
        fontWeight: '600',
    },
    upcomingDetails: {
        flex: 1,
    },
    upcomingRestaurant: {
        fontFamily: 'Poppins-Medium',
        fontSize: 15,
    },
    upcomingMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
        gap: 8,
    },
    upcomingText: {
        color: colors.textSecondary,
        fontSize: 12,
        marginRight: 12,
    },
    locationContainer: {
        backgroundColor: colors.primaryLight,
        borderRadius: 16,
        height: 180,
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    locationContent: {
        alignItems: 'center',
        padding: 20,
    },
    locationTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        marginTop: 12,
    },
    locationSubtitle: {
        color: colors.textSecondary,
        fontSize: 14,
        marginTop: 4,
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
    },
    emptyIllustration: {
        position: 'relative',
        marginBottom: 32,
    },
    emptyIconCircle: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: colors.primaryLight,
        top: -44,
        left: -44,
        zIndex: -1,
    },
    emptyTitle: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 8,
    },
    emptySubtitle: {
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    statCard: {
        backgroundColor: colors.background,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        flex: 1,
        elevation: 2,
    },
    statValue: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        marginVertical: 8,
    },
    statLabel: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    upcomingAddress: {
        color: colors.textTertiary,
        fontSize: 12,
    },
    statusBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 6,
        borderRadius: 20,
        alignItems: 'center',
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'Poppins-Medium',
    },

    deliveryProgress: {
        marginTop: 16,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressTrack: {
        height: 4,
        backgroundColor: colors.borders,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 16,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 4,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        color: 'white',
        marginTop: 8,
        fontFamily: 'Poppins-Medium',
    },

    performanceCard: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        flex: 1,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    performanceValue: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
    },
    performanceLabel: {
        color: colors.textSecondary,
        marginVertical: 4,
    },
    performanceUnit: {
        fontSize: 12,
        color: colors.textTertiary,
    },
});

export default RiderHomeScreen;