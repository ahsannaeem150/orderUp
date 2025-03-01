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

const MenuItemsScreen = () => {
  const { API_URL } = useContext(AuthContext);
  const { currentRestaurant } = useRestaurant();
  const { itemsCache, getItem } = useItems();
  const { fetchItems, loading, error } = useFetchItems();

  const restaurantItems = useMemo(() => {
    return currentRestaurant?.menu || [];
  }, [currentRestaurant?.menu]);

  useEffect(() => {
    console.log("hello");
    if (currentRestaurant?._id) {
      console.log("hi");
      const neededIds =
        currentRestaurant.menu?.filter((id) => !itemsCache[id]) || [];
      console.log(currentRestaurant);
      if (neededIds.length > 0) {
        fetchItems(currentRestaurant._id);
      }
    }
  }, [currentRestaurant?._id, currentRestaurant?.menu]); // Add menu to deps

  const handlePress = (item) => {
    if (!item?._id) return;
    router.push(`/(home)/${currentRestaurant._id}/${item._id}/itemIndex`);
  };
  const renderMenuItem = ({ item }) => {
    if (!item?._id) return null;

    const fullItem = getItem(item._id);
    if (!fullItem) return null;

    return (
      <TouchableOpacity
        onPress={() => handlePress(fullItem)}
        style={styles.cardContainer}
      >
        <Image
          source={{ uri: `${API_URL}/images/${fullItem.image}` }}
          style={styles.image}
        />

        <View style={styles.infoContainer}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemPrice}>
            ${item.price?.toFixed(2) || "0.00"}
          </Text>
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      <PageHeader
        backHandler={() => {
          router.navigate("(home)");
        }}
        title={"Menu Items"}
        showCartBadge={true}
        onCartPress={() => {
          router.push("/cart");
        }}
      />
      <View style={styles.headerContainer}>
        {currentRestaurant && (
          <>
            <Image
              source={{
                uri: currentRestaurant?.logo
                  ? `${API_URL}/images/${currentRestaurant.logo}`
                  : images.logoPlaceholder,
              }}
              style={styles.logo}
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.restaurantName}>
                {currentRestaurant?.name || "Restaurant"}
              </Text>
              <Text style={styles.restaurantDescription}>
                {currentRestaurant?.address?.address || ""}
              </Text>
            </View>
          </>
        )}
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load menu: {error}</Text>
          <TouchableOpacity onPress={() => fetchItems(currentRestaurant?._id)}>
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
        />
      )}
    </View>
  );
};

export default MenuItemsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    marginBottom: 30,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: "#ffe6e6",
    borderRadius: 8,
    margin: 16,
    alignItems: "center",
  },
  errorText: {
    color: "red",
    marginBottom: 8,
  },
  retryText: {
    color: "blue",
    textDecorationLine: "underline",
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  restaurantDescription: {
    fontSize: 16,
    color: "#666",
  },
  listContent: {
    paddingBottom: 16,
  },
  cardContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 160,
  },
  infoContainer: {
    padding: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4CAF50",
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
  },
});
