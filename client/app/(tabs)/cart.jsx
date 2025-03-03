import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { AuthContext } from "../context/authContext";
import { images } from "../../constants";
import CustomButton from "../components/CustomButtons";
import BlackButton from "../components/BlackButton";
import { router } from "expo-router";

const Cart = () => {
  const { API_URL, cart, setCart, setItem } = useContext(AuthContext);

  const increaseQuantity = (restaurantIndex, itemIndex) => {
    const updatedCart = [...cart];
    updatedCart[restaurantIndex].order[itemIndex].quantity += 1;
    setCart(updatedCart);
  };

  const handleCheckoutPress = () => {
    router.push("/checkout");
  };

  const decreaseQuantity = (restaurantIndex, itemIndex) => {
    const updatedCart = [...cart];
    const item = updatedCart[restaurantIndex].order[itemIndex];
    if (item.quantity > 1) {
      item.quantity -= 1;
    }
    setCart(updatedCart.filter((restaurant) => restaurant.order.length > 0));
  };

  const deleteItem = (restaurantIndex, itemIndex) => {
    const updatedCart = [...cart];
    updatedCart[restaurantIndex].order.splice(itemIndex, 1);
    setCart(updatedCart.filter((restaurant) => restaurant.order.length > 0));
  };

  const deleteRestaurant = (restaurantId) => {
    const updatedCart = cart.filter(
      (restaurant) => restaurant.restaurant._id !== restaurantId
    );
    setCart(updatedCart);
  };

  const calculateRestaurantTotal = (order) => {
    return order.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  const renderRestaurant = ({ item, index: restaurantIndex }) => (
    <View style={styles.restaurantContainer}>
      <View style={styles.restaurantHeader}>
        <Text style={styles.restaurantName}>{item.restaurant.name}</Text>
        <TouchableOpacity
          onPress={() => deleteRestaurant(item.restaurant._id)}
          style={styles.deleteRestaurantButton}
        >
          <Icon name="trash-outline" size={30} color="red" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={item.order}
        renderItem={renderItem(restaurantIndex, item.restaurant._id)}
        keyExtractor={(item) => item._id}
        ListFooterComponent={() => (
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              Total: Rs {calculateRestaurantTotal(item.order)}
            </Text>
          </View>
        )}
      />
    </View>
  );

  const renderItem =
    (restaurantIndex, restaurantId) =>
    ({ item, index }) =>
      (
        <View style={styles.cartItem}>
          <TouchableOpacity
            onPress={() => {
              setItem(item);
              router.push(`/(home)/${restaurantId}/${item._id}/itemIndex`);
            }}
          >
            <Image
              source={{ uri: `${API_URL}/images/${item.image}` }}
              style={styles.itemImage}
            />
          </TouchableOpacity>
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>Rs {item.price}</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={() => decreaseQuantity(restaurantIndex, index)}
                style={styles.quantityButton}
              >
                <Icon name="remove-circle-outline" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                onPress={() => increaseQuantity(restaurantIndex, index)}
                style={styles.quantityButton}
              >
                <Icon name="add-circle-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => deleteItem(restaurantIndex, index)}
            style={styles.deleteButton}
          >
            <Icon name="trash-outline" size={24} color="red" />
          </TouchableOpacity>
        </View>
      );

  const combinedOrders = cart?.flatMap((restaurant) => restaurant.order);
  const grandTotal = combinedOrders?.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Cart</Text>
      {cart?.length === 0 || cart == null ? (
        <View style={styles.emptyCartContainer}>
          <Image source={images.empty} style={styles.emptyImage} />
          <Text style={styles.emptyCartText}>Your cart is empty!</Text>
        </View>
      ) : (
        <FlatList
          data={cart}
          renderItem={renderRestaurant}
          keyExtractor={(item) => item.restaurant._id}
          contentContainerStyle={styles.cartList}
          ListFooterComponent={() => (
            <View style={styles.footerContainer}>
              <View style={styles.cardContainer}>
                <Text style={styles.cardTitle}>Your Order</Text>
                <FlatList
                  data={combinedOrders}
                  keyExtractor={(item) => item._id}
                  renderItem={priceList}
                  contentContainerStyle={styles.priceListContainer}
                />
                <View style={styles.cardFooter}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "gray" }}>Total Price</Text>
                    <Text
                      style={{
                        fontFamily: "Poppins-SemiBold",
                        fontSize: 18,
                        marginTop: 5,
                      }}
                    >
                      Rs {grandTotal}
                    </Text>
                  </View>

                  <View style={{ flex: 0.5 }}>
                    <BlackButton
                      onPress={() => {
                        handleCheckoutPress();
                      }}
                      title={"Checkout"}
                      buttonStyle={{ backgroundColor: "black" }}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const priceList = ({ item }) => (
  <View style={styles.priceListItem}>
    <Text style={styles.priceListName}>{item.name}</Text>
    <Text style={styles.priceListQuantity}>x {item.quantity}</Text>
    <Text style={styles.priceListPrice}>Rs {item.price * item.quantity}</Text>
  </View>
);

export default Cart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyImage: {
    width: "80%",
    height: 200,
    marginBottom: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: "#666",
  },
  restaurantContainer: {
    backgroundColor: "#fff",
    marginBottom: 20,
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  restaurantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  deleteRestaurantButton: {
    padding: 8,
  },
  cartList: {
    paddingBottom: 24,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  itemPrice: {
    fontSize: 14,
    color: "green",
    marginVertical: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    paddingHorizontal: 6,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "500",
    marginHorizontal: 8,
  },
  deleteButton: {
    marginLeft: 16,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  priceListContainer: {
    marginBottom: 10,
    backgroundColor: "rgba(194, 217, 236, 0.45)",
  },
  priceListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  priceListName: {
    fontSize: 16,
    flex: 1,
  },
  priceListQuantity: {
    fontSize: 16,
    textAlign: "center",
    width: 40,
    alignSelf: "center",
  },
  priceListPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
  },
  cardFooter: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTotal: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTotalText: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 10,
  },
  cardTotalPrice: {
    fontSize: 18,
    fontWeight: "300",
    color: "green",
  },
});
