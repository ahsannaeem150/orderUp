import React, { useContext, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import colors from "../../../../constants/colors";
import { useRequest } from "../../../context/RequestContext";
import { AuthContext } from "../../../context/authContext";

const OrderDetailScreen = ({ route }) => {
  const { state } = useContext(AuthContext);
  const { currentRequest } = useRequest();
  const mapRef = useRef(null);

  const mapHeight = Dimensions.get("window").height * 0.5;

  console.log("Agent location:", state.agent?.location);
  console.log(
    "Restaurant location:",
    currentRequest.order?.restaurant?.location
  );
  console.log("Customer location:", currentRequest?.order?.user?.location);

  useEffect(() => {
    if (mapRef.current && currentRequest?.order) {
      const coordinates = [];

      // Agent location
      if (state.agent?.location?.lat && state.agent?.location?.lng) {
        coordinates.push({
          latitude: state.agent.location.lat,
          longitude: state.agent.location.lng,
        });
      }

      // Restaurant location
      const restaurantLocation = currentRequest.order.restaurant?.location;
      if (restaurantLocation?.lat && restaurantLocation?.lng) {
        coordinates.push({
          latitude: restaurantLocation.lat,
          longitude: restaurantLocation.lng,
        });
      }

      // Customer location
      const userLocation = currentRequest.order.user?.location;
      if (userLocation?.lat && userLocation?.lng) {
        coordinates.push({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
        });
      }

      // Adjust map to show all markers
      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [state.agent?.location, currentRequest?.order]);
  const initialRegion = {
    latitude: currentRequest?.order?.restaurant?.location?.lat || 28.7041,
    longitude: currentRequest?.order?.restaurant?.location?.lng || 77.1025,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  if (!currentRequest) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const { order } = currentRequest;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.mapContainer, { height: mapHeight }]}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation={false}
            showsMyLocationButton
          >
            {/* Agent Marker */}
            {state.agent?.location?.lat && state.agent?.location?.lng && (
              <Marker
                coordinate={{
                  latitude: state.agent.location.lat,
                  longitude: state.agent.location.lng,
                }}
                title="Your Location"
              >
                <View style={styles.marker}>
                  <Ionicons name="navigate" size={20} color="white" />
                </View>
              </Marker>
            )}

            {/* Restaurant Marker */}
            {currentRequest?.order?.restaurant?.location?.lat &&
              currentRequest.order.restaurant.location.lng && (
                <Marker
                  coordinate={{
                    latitude: currentRequest.order.restaurant.location.lat,
                    longitude: currentRequest.order.restaurant.location.lng,
                  }}
                  title="Restaurant"
                >
                  <View style={styles.marker}>
                    <Ionicons name="restaurant" size={20} color="white" />
                  </View>
                </Marker>
              )}

            {/* Customer Marker */}
            {currentRequest?.order?.user?.location?.lat &&
              currentRequest.order.user.location.lng && (
                <Marker
                  coordinate={{
                    latitude: currentRequest.order.user.location.lat,
                    longitude: currentRequest.order.user.location.lng,
                  }}
                  title="Customer"
                >
                  <View style={styles.marker}>
                    <Ionicons name="person" size={20} color="white" />
                  </View>
                </Marker>
              )}
          </MapView>
        </View>

        {/* Order Details */}
        <View style={styles.detailsContainer}>
          <DetailSection title="Restaurant Details" icon="restaurant">
            <DetailRow icon="storefront" text={order.restaurant.name} />
            <DetailRow
              icon="location"
              text={order.restaurant.address.address}
            />
            <DetailRow icon="call" text={order.restaurant.phone} />
          </DetailSection>

          <DetailSection title="Customer Details" icon="person">
            <DetailRow icon="person" text={order.user.name} />
            <DetailRow icon="home" text={order.deliveryAddress} />
            <DetailRow icon="call" text={order.user.phone} />
            {order.notes && (
              <View style={styles.noteContainer}>
                <Ionicons name="warning" size={16} color={colors.warning} />
                <Text style={styles.noteText}>{order.notes}</Text>
              </View>
            )}
          </DetailSection>

          <DetailSection title="Order Summary" icon="receipt">
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={styles.itemPrice}>Rs {item.total}</Text>
              </View>
            ))}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>Rs {order.totalAmount}</Text>
            </View>
          </DetailSection>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => console.log("Reject")}
        >
          <Ionicons name="close" size={24} color="white" />
          <Text style={styles.buttonText}>Reject Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={() => console.log("Accept")}
        >
          <Ionicons name="checkmark" size={24} color="white" />
          <Text style={styles.buttonText}>Accept Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
    overflow: "hidden",
    margin: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  timeBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
    gap: 8,
  },
  timeText: {
    color: colors.warning,
    fontFamily: "Poppins-Medium",
  },
  timelineContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
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
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  activeTitle: {
    color: colors.textPrimary,
    fontFamily: "Poppins-Medium",
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
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borders,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: colors.textPrimary,
  },
  sectionContent: {
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    gap: 12,
  },
  detailText: {
    flex: 1,
    color: colors.textPrimary,
  },
  noteContainer: {
    flexDirection: "row",
    backgroundColor: colors.warningBg,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
    gap: 8,
  },
  noteText: {
    color: colors.warning,
    flex: 1,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  itemName: {
    color: colors.textSecondary,
  },
  itemPrice: {
    fontFamily: "Poppins-Medium",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  totalLabel: {
    color: colors.textSecondary,
  },
  totalValue: {
    fontFamily: "Poppins-SemiBold",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    flexDirection: "row",
    padding: 16,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borders,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
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
    color: "white",
    fontFamily: "Poppins-SemiBold",
  },
});

export default OrderDetailScreen;
