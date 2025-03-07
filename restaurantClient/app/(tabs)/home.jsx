import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { AuthContext } from "../context/authContext";
import { images } from "../../constants";
import { router } from "expo-router";
import { useFetchItems } from "../hooks/useFetchItems";

const HomePage = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { state, setItem, API_URL } = useContext(AuthContext);
  const { items, fetchItems } = useFetchItems(
    `/restaurant/${state.restaurant._id}/items`
  );
  const handleNavigateItem = (item) => {
    setItem(item);
    router.push({
      pathname: `/items/${item._id}`,
    });
  };
  // Function to refresh items on pull down
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchItems().then(() => {
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    fetchItems();
  }, []);

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.card,
        item.id === "add" && {
          backgroundColor: "#ffffff",
          borderColor: "gray",
          height: items ? (items.length % 2 === 0 ? 100 : 250) : 100,
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      {item.id === "add" ? (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            router.navigate("/add-items");
          }}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={{ width: "100%", flex: 1 }}
          onPress={() => {
            handleNavigateItem(item);
          }}
        >
          {item.image ? (
            <Image
              source={{ uri: `${API_URL}/images/${item.image}` }}
              style={[
                {
                  height: "70%",
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                },
                styles.image,
              ]}
              resizeMode="cover"
              onError={() => console.log("Error loading image")}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>No Image</Text>
            </View>
          )}
          <View style={styles.cardContent}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>{item.price}</Text>
            <Text style={styles.itemStock}>Stock: {item.stock}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  if (!items) {
    return (
      <ActivityIndicator
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        size="large"
        color="#0000ff"
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <FlatList
        data={[...(items ?? []), { id: "add", name: "+", image: "" }]} // Adding a blank card for adding new items
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={() => (
          <View style={[{ backgroundColor: "white" }, styles.container]}>
            <View style={styles.headerContainer}>
              <View style={styles.headerContent}>
                <View style={{ flex: 1, alignItems: "flex-start" }}>
                  <Text style={styles.welcomeText}>Welcome Back</Text>
                  <Text style={styles.username}>{state.restaurant?.name}</Text>
                </View>
                <View style={styles.logoContainer}>
                  <Image
                    source={images.logoSmall}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.searchContainer}></View>
            </View>
          </View>
        )}
      />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 80,
        }}
      >
        <View style={styles.divider} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    marginTop: StatusBar.currentHeight,
    padding: 20,
  },
  headerContainer: {
    marginBottom: 20,
    flex: 1,
    alignItems: "center",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 20,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
  username: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
  },
  logoContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  divider: {
    width: "90%",
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 10,
  },
  logo: {
    width: 100,
    height: 50,
  },
  searchContainer: {
    marginTop: -30,
    alignItems: "center",
  },
  list: {
    flexGrow: 1,
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 3,
    margin: 10,
    flex: 1,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  addCard: {},
  imagePlaceholder: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  imagePlaceholderText: {
    color: "#a0a0a0",
    fontSize: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  itemName: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
  },
  itemPrice: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "green",
  },
  itemStock: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "gray",
  },
  addButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  addIcon: {
    fontSize: 50,
    color: "gray",
  },
});

export default HomePage;
