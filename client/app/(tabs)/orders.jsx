import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
} from "react-native";
import { AuthContext } from "../context/authContext";
import Icon from "react-native-vector-icons/Ionicons";
import { images } from "../../constants";
import { router } from "expo-router";

const Orders = () => {
  const { cart, setCart } = useContext(AuthContext);

  const handlePress = (id, index) => {
    router.push({ pathname: `order/${id}`, params: { index } });
  };
  const deleteRestaurant = (restaurantId) => {
    const updatedCart = cart.filter((orderItem) => {
      return orderItem.restaurant._id !== restaurantId;
    });
    setCart(updatedCart);
  };
  const renderItem = ({ item, index }) => (
    <View
      style={[
        {
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        styles.card,
      ]}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
        }}
        onPress={() => {
          handlePress(item.restaurant._id, index);
        }}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.restaurant.logo }}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>
        <View>
          <Text style={styles.restaurantName}>{item.restaurant.name}</Text>
          <Text style={styles.restaurantDetails}>
            Items in cart:{" "}
            {item.order.reduce((quant, item) => {
              return quant + item.quantity;
            }, 0)}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => deleteRestaurant(item.restaurant._id)}
        style={styles.deleteButton}
      >
        <Icon name="trash-outline" size={30} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Orders</Text>
      {cart == null || cart.length == 0 ? (
        <View
          style={{
            justifyContent: "center",
            height: 500,
            alignItems: "center",
          }}
        >
          <Image source={images.empty} style={styles.image} />
        </View>
      ) : (
        <FlatList
          data={cart}
          renderItem={renderItem}
          keyExtractor={(item) => item.restaurant._id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: StatusBar.currentHeight,
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    marginEnd: 20,
    borderColor: "#9ca3af",
    justifyContent: "center",
    alignItems: "center",
    padding: 0.5,
  },
  avatar: {
    height: "100%",
    width: "100%",
    borderRadius: 8,
  },
  restaurantDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
});

export default Orders;
