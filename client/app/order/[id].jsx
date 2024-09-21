import React, { useContext } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
} from "react-native";
import { AuthContext } from "../context/authContext";
import Icon from "react-native-vector-icons/Ionicons";
import { images } from "../../constants";

const Order = () => {
  const { cart, setCart } = useContext(AuthContext);
  const { id, index: restaurantIndex } = useLocalSearchParams();
  const orderDetails = cart.orderList.find(
    (order) => order.restaurant._id == id
  );
  console.log(orderDetails.order);

  // Function to increase quantity
  const increaseQuantity = (index) => {
    setCart((prev) => {
      const newOrderList = [...prev.orderList];
      const restaurant = newOrderList[restaurantIndex];
      const order = restaurant.order[index];
      if (order) {
        order.quantity += 1;
      }
      return { orderList: newOrderList };
    });
  };

  // Function to decrease quantity
  const decreaseQuantity = (index) => {
    setCart((prev) => {
      const newOrderList = [...prev.orderList];
      const restaurant = newOrderList[restaurantIndex];
      const order = restaurant.order[index];
      if (order) {
        if (order.quantity == 1) {
        } else {
          order.quantity -= 1;
        }
      }
      return { orderList: newOrderList };
    });
  };

  // Function to delete an item
  const deleteItem = (index) => {
    setCart((prev) => {
      const newOrderList = [...prev.orderList];
      const restaurant = newOrderList[restaurantIndex];
      restaurant.order.splice(index, 1);
      if (restaurant.order.length == 0) {
        newOrderList.splice(restaurantIndex, 1);
        router.back();
      }
      return { orderList: newOrderList };
    });
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>Rs {item.price}</Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => decreaseQuantity(index)}
            style={styles.quantityButton}
          >
            <Icon name="remove-circle-outline" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => increaseQuantity(index)}
            style={styles.quantityButton}
          >
            <Icon name="add-circle-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => deleteItem(index)}
        style={styles.deleteButton}
      >
        <Icon name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Cart</Text>
      {cart.length === 0 ? (
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
          data={orderDetails.order}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.cartList}
        />
      )}
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>
          Rs.
          {/* {cart.reduce((acc, item) => acc + item.price * item.quantity, 0)} */}
        </Text>
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  cartList: {
    paddingBottom: 24,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "500",
    color: "green",
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  quantityButton: {
    paddingHorizontal: 6,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "500",
    marginHorizontal: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyCartText: {
    textAlign: "center",
    fontSize: 18,
    color: "#666",
    marginTop: 32,
  },
  totalContainer: {
    paddingVertical: 16,
    marginBottom: 35,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "center",
  },
  totalText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  checkoutButton: {
    backgroundColor: "blue",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 16,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});

export default Order;
