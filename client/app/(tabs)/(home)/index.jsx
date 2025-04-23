import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import axios from "axios";

import { router } from "expo-router";
import { AuthContext } from "../../context/authContext";
import { images } from "../../../constants";
import RestaurantCard from "../../components/RestaurantCard";
import SearchField from "../../components/SearchField";
import RestaurantHorizontalList from "../../components/RestaurantHorizontalList";
import { useRestaurant } from "../../context/RestaurantContext";
import colors from "../../../constants/colors";

const HorizontalRestaurantList = () => {
  const { fetchRestaurants, getRestaurant, setCurrentRestaurant } =
    useRestaurant();
  const [restaurantIds, setRestaurantIds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const { state, API_URL } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [searchedRestaurants, setSearchedRestaurants] = useState([]);

  const loadRestaurants = async () => {
    try {
      setError(null);
      setIsInitialLoading(true);

      const basicResponse = await axios.get("/restaurants");
      const ids = basicResponse.data.restaurants.map((r) => r._id);
      setRestaurantIds(ids);
      await fetchRestaurants(ids);
    } catch (error) {
      setError("Failed to load restaurants");
      console.error("Failed to load restaurants:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const restaurantData = React.useMemo(
    () => restaurantIds.map((id) => getRestaurant(id)).filter(Boolean),
    [restaurantIds, getRestaurant]
  );

  useEffect(() => {
    if (search.length > 0) {
      const filtered = restaurantData.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(search.toLowerCase())
      );
      setSearchedRestaurants(filtered);
    }
  }, [search, restaurantData]);

  const handleNavigatePress = (restaurant) => {
    setCurrentRestaurant(restaurant);
    router.push(`/(home)/${restaurant._id}`);
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadRestaurants();
    } finally {
      setRefreshing(false);
    }
  }, []);
  const isLoading =
    isInitialLoading ||
    restaurantIds.length !== restaurantData.filter(Boolean).length;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadRestaurants}>
            <Text style={styles.retryText}>Tap to Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={search.length == 0 ? restaurantData : searchedRestaurants}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={{ flex: 1, alignItems: "center" }}>
            <RestaurantCard
              name={item?.name || "Loading..."}
              logo={
                item?.logo
                  ? `${API_URL}/images/${item.logo}`
                  : images.logoPlaceholder
              }
              thumbnail={
                item?.thumbnail
                  ? `${API_URL}/images/${item.thumbnail}`
                  : images.logoPlaceholder
              }
              headerPressHandler={() => {
                handleNavigatePress(item);
              }}
              address={item.address.address}
            />
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.welcomeText}>Welcome Back</Text>
                <Text style={styles.username}>{state.user?.name}</Text>
              </View>

              <View style={styles.logoContainer}>
                <Image
                  source={images.logoSmall}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={styles.searchContainer}>
              <SearchField
                placeHolder={"Search for Restaurants"}
                value={search}
                handleChangeText={(text) => {
                  setSearch(text);
                }}
              />
            </View>

            {search.length == 0 ? (
              <>
                <View style={styles.topRestaurantsContainer}>
                  <Text style={styles.topRestaurantsTitle}>
                    Top Restaurants
                  </Text>
                </View>
                <RestaurantHorizontalList
                  posts={restaurantData}
                  onRestaurantClick={handleNavigatePress}
                />
              </>
            ) : (
              <></>
            )}
          </View>
        }
        ListEmptyComponent={() => (
          <View
            style={{
              justifyContent: "center",
              height: 500,
              alignItems: "center",
            }}
          >
            <Image source={images.empty} style={styles.image} />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default HorizontalRestaurantList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  retryText: {
    color: colors.accent,
    textDecorationLine: "underline",
  },
  headerContainer: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    marginBottom: -24,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: colors.errorBg,
    alignItems: "center",
  },
  errorText: {
    color: colors.errorText,
    marginBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.primary,
  },
  logoContainer: {
    marginTop: 6,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  logo: {
    width: 36,
    height: 40,
  },
  specialDivider: {
    width: "90%",
    height: 1,
    backgroundColor: colors.borders,
    marginVertical: 30,
  },
  searchContainer: {
    flex: 1,
    justifyContent: "center",
    marginTop: -30,
    alignItems: "center",
  },
  topRestaurantsContainer: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 5,
  },
  topRestaurantsTitle: {
    fontSize: 18,
    color: colors.primary,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 12,
  },
});
