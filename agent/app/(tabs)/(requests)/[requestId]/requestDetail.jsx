import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import colors from '../../../../constants/colors';

const OrderDetailScreen = ({ route }) => {
    const { order } = route.params;
    const [timeLeft, setTimeLeft] = useState(order.expiresIn);
    const mapHeight = Dimensions.get('window').height * 0.35;

    const initialRegion = {
        latitude: 28.7041,
        longitude: 77.1025,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Map Section */}
                <View style={[styles.mapContainer, { height: mapHeight }]}>
                    <MapView
                        style={styles.map}
                        initialRegion={initialRegion}
                        showsUserLocation
                        showsMyLocationButton
                    >
                        <Marker
                            coordinate={{ latitude: 28.7041, longitude: 77.1025 }}
                            title="Restaurant"
                        >
                            <View style={styles.marker}>
                                <Ionicons name="restaurant" size={20} color="white" />
                            </View>
                        </Marker>

                        <Marker
                            coordinate={{ latitude: 28.7289, longitude: 77.1077 }}
                            title="Customer"
                        >
                            <View style={styles.marker}>
                                <Ionicons name="person" size={20} color="white" />
                            </View>
                        </Marker>
                    </MapView>

                    <View style={styles.timeBadge}>
                        <Ionicons name="time" size={16} color={colors.warning} />
                        <Text style={styles.timeText}>{formatTime(timeLeft)} remaining</Text>
                    </View>
                </View>

                {/* Order Timeline */}
                <View style={styles.timelineContainer}>
                    <View style={styles.timeline}>
                        <TimelineStep
                            title="Requested"
                            isActive={true}
                            isCompleted={true}
                        />
                        <TimelineStep
                            title="Accepted"
                            isActive={false}
                            isCompleted={false}
                        />
                        <TimelineStep
                            title="Picked Up"
                            isActive={false}
                            isCompleted={false}
                        />
                        <TimelineStep
                            title="Delivered"
                            isActive={false}
                            isCompleted={false}
                        />
                    </View>
                </View>

                {/* Order Details */}
                <View style={styles.detailsContainer}>
                    <DetailSection title="Restaurant Details" icon="restaurant">
                        <DetailRow icon="storefront" text={order.restaurant.name} />
                        <DetailRow icon="location" text={order.restaurant.address} />
                        <DetailRow icon="call" text={order.restaurant.contact} />
                        <DetailRow icon="time" text={`${order.pickup.distance} • ${order.pickup.time}`} />
                    </DetailSection>

                    <DetailSection title="Customer Details" icon="person">
                        <DetailRow icon="person" text={order.customer.name} />
                        <DetailRow icon="home" text={order.customer.address} />
                        <DetailRow icon="call" text={order.customer.contact} />
                        <DetailRow icon="navigate" text={`${order.delivery.distance} • ${order.delivery.time}`} />

                        {order.customer.notes && (
                            <View style={styles.noteContainer}>
                                <Ionicons name="warning" size={16} color={colors.warning} />
                                <Text style={styles.noteText}>{order.customer.notes}</Text>
                            </View>
                        )}
                    </DetailSection>

                    <DetailSection title="Order Summary" icon="receipt">
                        {order.items.map((item, index) => (
                            <View key={index} style={styles.itemRow}>
                                <Text style={styles.itemName}>{item.quantity}x {item.name}</Text>
                                <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                            </View>
                        ))}

                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Delivery Fee</Text>
                            <Text style={styles.totalValue}>₹{order.deliveryFee}</Text>
                        </View>

                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Earnings</Text>
                            <Text style={styles.totalValue}>₹{order.payment.total}</Text>
                        </View>
                    </DetailSection>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={() => console.log('Reject')}
                >
                    <Ionicons name="close" size={24} color="white" />
                    <Text style={styles.buttonText}>Reject Order</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.acceptButton]}
                    onPress={() => console.log('Accept')}
                >
                    <Ionicons name="checkmark" size={24} color="white" />
                    <Text style={styles.buttonText}>Accept Order</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// Reusable Components
const TimelineStep = ({ title, isActive, isCompleted }) => (
    <View style={styles.timelineStep}>
        <View style={[
            styles.timelineDot,
            isCompleted && styles.completedDot,
            isActive && styles.activeDot
        ]}>
            {isCompleted && <Ionicons name="checkmark" size={12} color="white" />}
        </View>
        <Text style={[
            styles.timelineTitle,
            isActive && styles.activeTitle
        ]}>{title}</Text>
    </View>
);

const DetailSection = ({ title, icon, children }) => (
    <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
            <Ionicons name={icon} size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionContent}>{children}</View>
    </View>
);

const DetailRow = ({ icon, text }) => (
    <View style={styles.detailRow}>
        <Ionicons name={icon} size={18} color={colors.textSecondary} />
        <Text style={styles.detailText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        paddingBottom: 100,
    },
    mapContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        margin: 16,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    marker: {
        backgroundColor: colors.primary,
        padding: 8,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 8,
        borderRadius: 20,
        alignItems: 'center',
        gap: 8,
    },
    timeText: {
        color: colors.warning,
        fontFamily: 'Poppins-Medium',
    },
    timelineContainer: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    timeline: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timelineStep: {
        alignItems: 'center',
        flex: 1,
    },
    timelineDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.borders,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    activeDot: {
        backgroundColor: colors.warning,
    },
    completedDot: {
        backgroundColor: colors.success,
    },
    timelineTitle: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    activeTitle: {
        color: colors.textPrimary,
        fontFamily: 'Poppins-Medium',
    },
    detailsContainer: {
        paddingHorizontal: 16,
    },
    sectionContainer: {
        backgroundColor: colors.background,
        borderRadius: 16,
        marginBottom: 16,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borders,
        gap: 12,
    },
    sectionTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
        color: colors.textPrimary,
    },
    sectionContent: {
        padding: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
        gap: 12,
    },
    detailText: {
        flex: 1,
        color: colors.textPrimary,
    },
    noteContainer: {
        flexDirection: 'row',
        backgroundColor: colors.warningBg,
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        alignItems: 'center',
        gap: 8,
    },
    noteText: {
        color: colors.warning,
        flex: 1,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
    },
    itemName: {
        color: colors.textSecondary,
    },
    itemPrice: {
        fontFamily: 'Poppins-Medium',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
    },
    totalLabel: {
        color: colors.textSecondary,
    },
    totalValue: {
        fontFamily: 'Poppins-SemiBold',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        flexDirection: 'row',
        padding: 16,
        gap: 16,
        borderTopWidth: 1,
        borderTopColor: colors.borders,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    acceptButton: {
        backgroundColor: colors.success,
    },
    rejectButton: {
        backgroundColor: colors.error,
    },
    buttonText: {
        color: 'white',
        fontFamily: 'Poppins-SemiBold',
    },
});

export default OrderDetailScreen;