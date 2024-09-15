import React, { useContext, useEffect, useState } from "react";
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
import { AuthContext } from "../context/authContext";
import { useFetchItems } from "../hooks/useFetchItems";
import { router } from "expo-router";
const MenuItemsScreen = () => {
  const { restaurant, setItem } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const { items, fetchItems } = useFetchItems(
    `/auth/restaurant/${restaurant._id}/items`
  );

  const handlePress = (item) => {
    setItem(item);
    router.navigate(`/item/${item._id}`);
  };
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      await fetchItems();
      setLoading(false);
    };
    fetch();
  }, []);

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => {
        handlePress(item);
      }}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>{item.price}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image source={{ uri: restaurant.logo }} style={styles.logo} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantDescription}>
            {restaurant.address.address}
          </Text>
        </View>
      </View>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={items}
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
    marginTop: StatusBar.currentHeight,
    padding: 16,
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
  headerTextContainer: {
    flex: 1,
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
