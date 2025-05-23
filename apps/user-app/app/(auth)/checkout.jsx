import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useContext, useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { CheckBox } from "@rneui/themed";

import { AuthContext } from "../context/authContext";
import CheckoutInput from "../components/CheckoutInput";
import CheckboxInput from "../components/CheckboxInput";
import BlackButton from "../components/BlackButton";
import { router } from "expo-router";
import axios from "axios";
import colors from "../../constants/colors";

const checkout = () => {
  const { state, setCart, cart } = useContext(AuthContext);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [notes, setNotes] = useState("");
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] =
    useState("30-45 mins");

  const [name, setName] = useState(state.user.name);
  const [phone, setPhone] = useState(state.user.phone);
  const [city, setCity] = useState(state.user.address?.city);
  const [address, setAddress] = useState(state.user.address?.address);

  const handleCheckoutPress = async () => {
    if (!name) {
      return Alert.alert("Please enter name");
    }
    if (!phone) {
      return Alert.alert("Please enter phone");
    }
    if (!city) {
      return Alert.alert("Please enter city");
    }
    if (!address) {
      return Alert.alert("Please enter address");
    }

    try {
      setIsCheckingOut(true);
      const userId = state.user._id;

      const sanitizedCart = cart.map((restaurantCart) => ({
        restaurant: {
          _id: restaurantCart.restaurant._id,
          name: restaurantCart.restaurant.name,
          phone: restaurantCart.restaurant.phone,
        },
        order: restaurantCart.order.map((item) => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      }));

      const response = await axios.post("/checkout", {
        userId,
        name,
        phone,
        city,
        address,
        notes,
        cart: sanitizedCart,
        estimatedDeliveryTime,
      });

      alert("Order placed successfully!");
      setCart([]);

      router.dismissAll();
      router.replace("(orders)");
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };
  return (
    <ScrollView style={{ height: "100%" }}>
      <View style={styles.container}>
        <Text style={styles.title}>Checkout</Text>
        <View style={styles.header}>
          <Text
            style={{
              alignSelf: "flex-start",
              margin: 10,
              marginLeft: 15,
              fontFamily: "Poppins-SemiBold",
              fontWeight: "600",
            }}
          >
            Your Order
          </Text>
          <View style={styles.headerCard}>
            {cart.map((orderItem) => {
              return orderItem.order.map((order) => {
                return (
                  <View
                    key={order.name}
                    style={{ flexDirection: "row", flex: 1, padding: 10 }}
                  >
                    <View style={{ flex: 3 }}>
                      <Text style={{ fontFamily: "Poppins-Regular" }}>
                        {order.name}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontFamily: "Poppins-Regular" }}>
                        {order.quantity}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontFamily: "Poppins-Regular" }}>
                        {order.price * order.quantity}
                      </Text>
                    </View>
                  </View>
                );
              });
            })}
            <View
              style={{
                flex: 1,
                height: 30,
                flexDirection: "row",
                borderTopWidth: 1,
                borderTopColor: "rgba(194, 217, 236, 0.45)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 4 }}></View>
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingRight: 10,
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontFamily: "Poppins-SemiBold" }}>
                  {cart.reduce((price, orderItem) => {
                    return (
                      price +
                      orderItem.order.reduce((itemPrice, item) => {
                        return itemPrice + item.price * item.quantity;
                      }, 0)
                    );
                  }, 0)}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text
              style={{
                alignSelf: "flex-start",
                margin: 10,
                marginLeft: 15,
                fontFamily: "Poppins-SemiBold",
                fontWeight: "600",
              }}
            >
              Personal Details
            </Text>
            <CheckoutInput
              title={"Name"}
              value={name}
              placeHolder={"s"}
              handleChangeText={(text) => {
                setName(text);
              }}
            />
            <CheckoutInput
              title={"Phone"}
              value={phone}
              placeHolder={"Enter Phone"}
              handleChangeText={(text) => {
                setPhone(text);
              }}
            />
            <CheckoutInput
              title={"City"}
              value={city}
              placeHolder={"Enter City"}
              handleChangeText={(text) => {
                setCity(text);
              }}
            />
            <CheckoutInput
              title={"Address"}
              value={address}
              placeHolder={"Enter Address"}
              handleChangeText={(text) => {
                setAddress(text);
              }}
            />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text
              style={{
                alignSelf: "flex-start",
                margin: 10,
                marginLeft: 15,
                fontFamily: "Poppins-SemiBold",
                fontWeight: "600",
              }}
            >
              Payment Method
            </Text>
            <CheckboxInput
              index={0}
              selectedIndex={selectedIndex}
              title={"Cash on Delivery"}
              onValueChange={() => setSelectedIndex(0)}
            />
            <CheckboxInput
              index={1}
              additionalStyles={{
                marginTop: 10,
              }}
              title={"Jazzcash"}
              selectedIndex={selectedIndex}
              onValueChange={() => setSelectedIndex(1)}
            />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text
              style={{
                alignSelf: "flex-start",
                margin: 10,
                marginLeft: 15,
                fontFamily: "Poppins-SemiBold",
                fontWeight: "600",
              }}
            >
              Order Notes
            </Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add a special message..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={2}
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text
              style={{
                alignSelf: "flex-start",
                margin: 10,
                marginLeft: 15,
                fontFamily: "Poppins-SemiBold",
                fontWeight: "600",
              }}
            >
              Checkout
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginLeft: 20,
                marginRight: 20,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: "gray" }}>Total Price</Text>
                <Text
                  style={{
                    fontFamily: "Poppins-SemiBold",
                    fontSize: 18,
                    marginTop: 5,
                  }}
                >
                  Rs{" "}
                  {cart.reduce((price, orderItem) => {
                    return (
                      price +
                      orderItem.order.reduce((itemPrice, item) => {
                        return itemPrice + item.price * item.quantity;
                      }, 0)
                    );
                  }, 0)}
                </Text>
              </View>
              <View style={{ flex: 0.5 }}>
                <BlackButton
                  onPress={() => {
                    handleCheckoutPress();
                  }}
                  isCheckingOut={isCheckingOut}
                  title={"Checkout"}
                  buttonStyle={{ backgroundColor: "black" }}
                />
              </View>
            </View>
          </View>
        </View>
        <View style={{ flex: 3, backgroundColor: "blue" }}></View>
      </View>
    </ScrollView>
  );
};

export default checkout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    justifyContent: "space-between",
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: 8,
    padding: 12,
    minHeight: 70,
    textAlignVertical: "top",
    width: "93%",
    alignSelf: "center",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    color: colors.textPrimary,
  },
  header: {
    justifyContent: "flex-start",
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 20,
    alignSelf: "center",
    fontFamily: "Poppins-SemiBold",
  },
  headerCard: {
    flex: 1,
    borderWidth: 1,
    margin: 10,
    width: "90%",
    backgroundColor: "rgba(17, 136, 236, 0.05)",
    borderRadius: 5,
    borderColor: "rgba(35, 40, 44, 0.1)",
  },
});
