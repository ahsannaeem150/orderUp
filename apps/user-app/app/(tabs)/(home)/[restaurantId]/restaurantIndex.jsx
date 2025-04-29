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
import colors from "../../../../constants/colors";
import { useCart } from "../../../context/CartContext";

const MenuItemsScreen = () => {
  const { API_URL } = useContext(AuthContext);
  const { currentRestaurant } = useRestaurant();
  const { itemsCache, getItem, setCurrentItem } = useItems();
  const { fetchItemsBatch, loading, error } = useFetchItems();
  const { addToCart, getItemQuantityInCart } = useCart();

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

    router.push(`/(home)/${currentRestaurant._id}/${item._id}/itemIndex`);
  };
  const renderMenuItem = ({ item }) => {
    const quantityInCart = getItemQuantityInCart(
      item?._id,
      currentRestaurant?._id
    );
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
            <View style={styles.footerLeft}>
              <Ionicons
                name="time-outline"
                size={14}
                color={colors.textTertiary}
              />
              <Text style={styles.preparationTime}>15-20 mins</Text>
            </View>

            <TouchableOpacity
              style={styles.cartButton}
              onPress={(e) => {
                e.stopPropagation();
                addToCart(item, currentRestaurant);
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={quantityInCart > 0 ? "cart" : "cart-outline"}
                size={20}
                color={colors.success}
              />
              {quantityInCart > 0 && (
                <View style={styles.quantityBadge}>
                  <Text style={styles.quantityText}>{quantityInCart}</Text>
                </View>
              )}
            </TouchableOpacity>
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
            <Ionicons name="star" size={14} color={colors.highlight} />
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
          <ActivityIndicator size="large" color={colors.accent} />
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
    backgroundColor: colors.background,
  },
  restaurantHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borders,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 14,
    marginRight: 16,
    backgroundColor: colors.muted,
  },
  headerText: {
    flex: 1,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  cartButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.borders,
    paddingTop: 12,
  },
  cartButtonText: {
    color: colors.background,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },

  restaurantName: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  restaurantInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  restaurantAddress: {
    fontSize: 14,
    color: colors.textTertiary,
    marginLeft: 6,
    fontFamily: "Poppins-Regular",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
    fontFamily: "Poppins-Medium",
  },
  cardContainer: {
    backgroundColor: colors.background,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 10,
    shadowColor: colors.textPrimary,
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
    backgroundColor: colors.background + "e6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: colors.accent,
  },

  infoContainer: {
    padding: 16,
  },

  itemName: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  itemPrice: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: colors.success,
  },
  itemDescription: {
    fontSize: 14,
    color: colors.textTertiary,
    fontFamily: "Poppins-Regular",
    lineHeight: 20,
    marginBottom: 12,
  },
  preparationTime: {
    fontSize: 13,
    color: colors.textTertiary,
    marginLeft: 6,
    marginRight: "auto",
    fontFamily: "Poppins-Regular",
  },
  arrowIcon: {
    marginLeft: 8,
    color: colors.muted,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: colors.errorBg,
    borderRadius: 8,
    margin: 16,
    alignItems: "center",
  },
  errorText: {
    color: colors.errorText,
    marginBottom: 8,
    textAlign: "center",
  },
  retryText: {
    color: colors.accent,
    fontFamily: "Poppins-SemiBold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartButton: {
    position: "relative",
    padding: 8,
  },
  quantityBadge: {
    position: "absolute",
    right: -4,
    top: -4,
    backgroundColor: colors.errorText,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  quantityText: {
    color: colors.background,
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
  },
});
