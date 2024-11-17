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
  StatusBar,
  TouchableOpacity,
  TextInput,
} from "react-native";

import { router } from "expo-router";
import { AuthContext } from "../../context/authContext";
import { images } from "../../../constants";
import RestaurantCard from "../../components/RestaurantCard";
import SearchField from "../../components/SearchField";
import { useFetchRestaurants } from "../../hooks/useFetchRestaurants";
import RestaurantHorizontalList from "../../components/RestaurantHorizontalList";

const HorizontalRestaurantList = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { state } = useContext(AuthContext);
  const { restaurant, setRestaurant } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [searchedRestaurants, setSearchedRestaurants] = useState([]);
  const { restaurants, fetchRestaurants } =
    useFetchRestaurants("/auth/restaurants");
  const [loading, setLoading] = useState(true);
  const handleNavigatePress = (restaurant) => {
    setRestaurant(restaurant);
    router.push(`/(home)/${restaurant._id}`);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRestaurants().then(() => {
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchRestaurants();
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    setSearchedRestaurants(
      restaurants?.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={search.length == 0 ? restaurants : searchedRestaurants}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={{ flex: 1, alignItems: "center" }}>
            <RestaurantCard
              name={item.name}
              logo={item.logo}
              headerPressHandler={() => {
                handleNavigatePress(item);
              }}
              thumbnail={item.thumbnail}
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
                  posts={restaurants}
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
    </View>
  );
};

export default HorizontalRestaurantList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 45,
  },
  headerContainer: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: -24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 14,
  },
  username: {
    fontSize: 24,
    fontWeight: "600",
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
    backgroundColor: "#e5e7eb",
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
    fontWeight: "400",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 12,
  },
});
