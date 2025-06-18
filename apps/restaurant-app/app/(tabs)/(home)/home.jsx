import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { AuthContext } from "../../context/authContext";
import { router } from "expo-router";
import { useFetchItems } from "../../hooks/useFetchItems";
import colors from "../../../constants/colors";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useItems } from "../../context/ItemContext";

const HomePage = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { state, API_URL } = useContext(AuthContext);
  const { cacheItems, itemsCache, setCurrentItem } = useItems();
  const { loading, items, fetchItems } = useFetchItems(
    `/restaurant/${state.restaurant._id}/items`
  );
  const restaurantItems = Object.values(itemsCache);

  const handleNavigateItem = (item) => {
    setCurrentItem(item);
    router.push(`/(home)/[item]/itemPage`);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchItems();
    } finally {
      setRefreshing(false);
    }
  }, [fetchItems]);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    items && cacheItems(items);
  }, [items]);

  const renderItem = ({ item }) => {
    const hasDiscount =
      item.discount > 0 && new Date(item.discountEnd) > new Date();
    const isPopular = item.popularityScore > 100;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleNavigateItem(item)}
      >
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image
              source={{ uri: `${API_URL}/images/${item.image}` }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialIcons
                name="restaurant-menu"
                size={32}
                color={colors.textSecondary}
              />
            </View>
          )}

          {isPopular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Popular</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.priceContainer}>
            {hasDiscount ? (
              <>
                <Text style={styles.originalPrice}>Rs {item.price}</Text>
                <Text style={styles.discountedPrice}>
                  Rs {Math.round(item.price * (1 - item.discount / 100))}
                </Text>
              </>
            ) : (
              <Text style={styles.currentPrice}>Rs {item.price}</Text>
            )}
          </View>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <AntDesign
                name="clockcircle"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.metaText}>{item.preparationTime} mins</Text>
            </View>

            <View style={styles.metaItem}>
              <MaterialIcons
                name="category"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.metaText}>{item.category}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <FlatList
        data={restaurantItems}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{state.restaurant?.name}</Text>
            <Text style={styles.subtitle}>Menu Items</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons
              name="fastfood"
              size={40}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>No menu items available</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(home)/addItems/add-items")}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: colors.textSecondary,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  imageContainer: {
    height: 160,
    backgroundColor: colors.borderLight,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
  },
  popularBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  popularText: {
    color: "white",
    fontFamily: "Poppins-Medium",
    fontSize: 12,
  },
  cardContent: {
    padding: 16,
  },
  itemName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  itemDescription: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  currentPrice: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    color: colors.primary,
  },
  originalPrice: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: colors.textSecondary,
    textDecorationLine: "line-through",
  },
  discountedPrice: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    color: colors.accent,
  },
  metaContainer: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 48,
  },
  emptyText: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
});

export default HomePage;
