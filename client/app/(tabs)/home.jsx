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
} from "react-native";
import { AuthContext } from "../context/authContext";
import { images } from "../../constants";
import RestaurantCard from "../components/RestaurantCard";
import FormField from "../components/FormField";
import { useFetchRestaurants } from "../hooks/useFetchRestaurants";
import RestaurantHorizontalList from "../components/RestaurantHorizontalList";
import { router } from "expo-router";

const HorizontalRestaurantList = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { state } = useContext(AuthContext);
  const { restaurant, setRestaurant } = useContext(AuthContext);
  const { restaurants, fetchRestaurants } =
    useFetchRestaurants("/auth/restaurants");
  const [loading, setLoading] = useState(true);
  const handleNavigatePress = (restaurant) => {
    setRestaurant(restaurant);
    router.push(`restaurants/${restaurant._id}`);
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={restaurants}
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
            <View style={styles.specialDivider}></View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={() => (
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
              <FormField
                placeHolder={"Search for Restaurants"}
                isSearch={true}
              />
            </View>

            <View style={styles.topRestaurantsContainer}>
              <Text style={styles.topRestaurantsTitle}>Top Restaurants</Text>
            </View>
            <RestaurantHorizontalList posts={restaurants} />
          </View>
        )}
        ListEmptyComponent={() => <Text>No restaurants found.</Text>}
      />
    </SafeAreaView>
  );
};

export default HorizontalRestaurantList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    marginTop: StatusBar.currentHeight,
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
