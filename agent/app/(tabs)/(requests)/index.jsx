import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Image,
    StyleSheet,
    Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../../constants/colors';
import {router} from "expo-router";

const OrderRequestsScreen = () => {
    const [orders, setOrders] = useState([
        {
            id: '#REQ2984',
            restaurant: 'Burger Kingdom',
            pickup: {
                address: '12 Food Street, Downtown',
                distance: '1.2 km',
                time: '8-10 min'
            },
            delivery: {
                address: '24 Park Avenue',
                distance: '3.4 km',
                time: '18-22 min'
            },
            payment: '₹185',
            items: [
                { name: 'Classic Burger', quantity: 2 },
                { name: 'Fries', quantity: 1 },
                { name: 'Coke', quantity: 2 }
            ],
            expiresIn: 300 // 5 minutes in seconds
        },
        // Add more dummy orders as needed
    ]);

    const handleAccept = (orderId) => {
        setOrders(orders.filter(order => order.id !== orderId));
        // Add your acceptance logic here
    };

    const handleReject = (orderId) => {
        setOrders(orders.filter(order => order.id !== orderId));
        // Add your rejection logic here
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>New Requests</Text>
                    <View style={styles.notificationBadge}>
                        <Text style={styles.badgeText}>{orders.length}</Text>
                    </View>
                </View>

                {orders.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="fast-food" size={48} color={colors.borders} />
                        <Text style={styles.emptyText}>No new requests available</Text>
                    </View>
                ) : (
                    orders.map((order) => (
                        <OrderRequestCard
                            key={order.id}
                            order={order}
                            onAccept={handleAccept}
                            onReject={handleReject}
                            formatTime={formatTime}
                        />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const OrderRequestCard = ({ order, onAccept, onReject, formatTime }) => {
    const [timeLeft, setTimeLeft] = useState(order.expiresIn);
    const progress = timeLeft / order.expiresIn;

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <TouchableOpacity onPress={()=>{router.push("(requests)/requestDetail.jsx")}}>

        <LinearGradient
            colors={['#ffffff', '#f8f9fa']}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.timeBadge}>
                    ⏳ {formatTime(timeLeft)} remaining
                </Text>
                <View style={styles.progressBar}>
                    <Animated.View
                        style={[
                            styles.progressFill,
                            { width: `${progress * 100}%` }
                        ]}
                    />
                </View>
            </View>

            <View style={styles.restaurantInfo}>
                {/*<Image*/}
                {/*    source={require('../../../assets/restaurant-placeholder.png')}*/}
                {/*    style={styles.logo}*/}
                {/*/>*/}
                <View>
                    <Text style={styles.restaurantName}>{order.restaurant}</Text>
                    <Text style={styles.orderId}>{order.id}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Items</Text>
                {order.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                        <Ionicons name="fast-food" size={16} color={colors.textSecondary} />
                        <Text style={styles.itemText}>
                            {item.quantity}x {item.name}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.detailsContainer}>
                <View style={styles.detailSection}>
                    <Ionicons name="location" size={20} color={colors.primary} />
                    <View style={styles.detailContent}>
                        <Text style={styles.detailTitle}>Pickup</Text>
                        <Text style={styles.detailText}>{order.pickup.address}</Text>
                        <Text style={styles.distanceText}>
                            {order.pickup.distance} • {order.pickup.time}
                        </Text>
                    </View>
                </View>

                <View style={styles.detailSection}>
                    <Ionicons name="navigate" size={20} color={colors.success} />
                    <View style={styles.detailContent}>
                        <Text style={styles.detailTitle}>Delivery</Text>
                        <Text style={styles.detailText}>{order.delivery.address}</Text>
                        <Text style={styles.distanceText}>
                            {order.delivery.distance} • {order.delivery.time}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.paymentSection}>
                <Text style={styles.paymentText}>Earnings: {order.payment}</Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={() => onReject(order.id)}
                >
                    <Ionicons name="close" size={20} color="white" />
                    <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.acceptButton]}
                    onPress={() => onAccept(order.id)}
                >
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
        </TouchableOpacity>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
        color: colors.textPrimary,
    },
    notificationBadge: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'Poppins-Medium',
    },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardHeader: {
        marginBottom: 16,
    },
    timeBadge: {
        color: colors.warning,
        fontFamily: 'Poppins-Medium',
        marginBottom: 8,
    },
    progressBar: {
        height: 4,
        backgroundColor: colors.borders,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.warning,
    },
    restaurantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    logo: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: 12,
    },
    restaurantName: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
    },
    orderId: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: 'Poppins-SemiBold',
        color: colors.textSecondary,
        marginBottom: 8,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
        flexDirection: 'row',
        gap: 12,
    },
    detailContent: {
        flex: 1,
    },
    detailTitle: {
        fontFamily: 'Poppins-Medium',
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
        fontFamily: 'Poppins-SemiBold',
        color: colors.success,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 12,
        gap: 8,
    },
    acceptButton: {
        backgroundColor: colors.success,
    },
    rejectButton: {
        backgroundColor: colors.primary,
    },
    buttonText: {
        color: 'white',
        fontFamily: 'Poppins-Medium',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: colors.textSecondary,
        marginTop: 16,
        fontSize: 16,
    },
});

export default OrderRequestsScreen;