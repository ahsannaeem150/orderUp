import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { AuthContext } from "../../../context/authContext";
import { useFetchItems } from "../../../hooks/useFetchItems";
import PageHeader from "../../../components/PageHeader";
import { images } from "../../../../constants";
import { useRestaurant } from "../../../context/RestaurantContext";
import { useItems } from "../../../context/ItemContext";
import { Ionicons } from "@expo/vector-icons";

const MenuItemsScreen = () => {
  const { API_URL } = useContext(AuthContext);
  const { currentRestaurant } = useRestaurant();
  const { itemsCache, getItem, setCurrentItem } = useItems();
  const { fetchItemsBatch, loading, error } = useFetchItems();

  const restaurantItems = useMemo(() => {
    return (currentRestaurant?.menu || []).map((menuItem) =>
      getItem(menuItem._id)
    );
  }, [currentRestaurant?.menu, itemsCache]);

  useEffect(() => {
    if (currentRestaurant?._id) {
      const menuIds = currentRestaurant.menu || [];
      if (menuIds.length > 0) {
        fetchItemsBatch(menuIds);
      }
    }
  }, [currentRestaurant?._id]);

  const handlePress = (item) => {
    if (!item?._id) return;
    setCurrentItem(item);
    router.push(`/(home)/${currentRestaurant._id}/${item._id}/itemIndex`);
  };
  const renderMenuItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => handlePress(item)}
        style={styles.cardContainer}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: `${API_URL}/images/${item.image}` }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.itemBadge}>
          <Text style={styles.badgeText}>{item.category || "Popular"}</Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.itemPrice}>
              Rs{item.price?.toFixed(2) || "0.00"}
            </Text>
          </View>

          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.itemFooter}>
            <Ionicons name="time-outline" size={14} color="#6b7280" />
            <Text style={styles.preparationTime}>15-20 mins</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#d1d5db"
              style={styles.arrowIcon}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader
        backHandler={() => router.navigate("(home)")}
        title={"Menu"}
        showCartBadge={true}
        onCartPress={() => router.push("/cart")}
      />

      <View style={styles.restaurantHeader}>
        <Image
          source={{
            uri: currentRestaurant?.logo
              ? `${API_URL}/images/${currentRestaurant.logo}`
              : images.logoPlaceholder,
          }}
          style={styles.logo}
        />
        <View style={styles.headerText}>
          <Text style={styles.restaurantName}>
            {currentRestaurant?.name || "Restaurant"}
          </Text>
          <View style={styles.restaurantInfo}>
            <Ionicons name="location-outline" size={14} color="#4b5563" />
            <Text style={styles.restaurantAddress}>
              {currentRestaurant?.address?.address || ""}
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.ratingText}>4.5 (500+ ratings)</Text>
          </View>
        </View>
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load menu: {error}</Text>
          <TouchableOpacity onPress={() => fetchItemsBatch(menuIds)}>
            <Text style={styles.retryText}>Tap to Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      {!loading && restaurantItems.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text>No menu items available</Text>
        </View>
      )}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={restaurantItems}
          keyExtractor={(item) => item._id}
          renderItem={renderMenuItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default MenuItemsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 50,
    backgroundColor: "#f8fafc",
  },
  restaurantHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 14,
    marginRight: 16,
    backgroundColor: "#f3f4f6",
  },
  headerText: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: "#1f2937",
    marginBottom: 4,
  },
  restaurantInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  restaurantAddress: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 6,
    fontFamily: "Poppins-Regular",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 4,
    fontFamily: "Poppins-Medium",
  },
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  itemBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#3b82f6",
  },
  infoContainer: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#1f2937",
    flex: 1,
    marginRight: 12,
  },
  itemPrice: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#10b981",
  },
  itemDescription: {
    fontSize: 14,
    color: "#6b7280",
    fontFamily: "Poppins-Regular",
    lineHeight: 20,
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
  },
  preparationTime: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 6,
    marginRight: "auto",
    fontFamily: "Poppins-Regular",
  },
  arrowIcon: {
    marginLeft: 8,
  },
});
