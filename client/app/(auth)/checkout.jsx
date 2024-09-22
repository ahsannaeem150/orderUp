import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { CheckBox } from "@rneui/themed";

import { AuthContext } from "../context/authContext";
import FormField from "../components/FormField";
import CheckoutInput from "../components/CheckoutInput";
import { images } from "../../constants";
import CheckboxInput from "../components/CheckboxInput";
import CustomButton from "../components/CustomButtons";
import BlackButton from "../components/BlackButton";

const checkout = () => {
  const { state, checkout } = useContext(AuthContext);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const [name, setName] = useState(state.user.name);
  const [phone, setPhone] = useState(state.user.phone);
  const [city, setCity] = useState(state.user.address?.city);
  const [address, setAddress] = useState(state.user.address?.address);
  return (
    <ScrollView>
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
            {checkout.order.order.map((orderItem) => {
              return (
                <View
                  key={orderItem.name}
                  style={{ flexDirection: "row", flex: 1, padding: 10 }}
                >
                  <View style={{ flex: 3 }}>
                    <Text style={{ fontFamily: "Poppins-Regular" }}>
                      {orderItem.name}
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
                      {orderItem.quantity}
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
                      {orderItem.price * orderItem.quantity}
                    </Text>
                  </View>
                </View>
              );
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
                  {checkout.order.order.reduce(
                    (total, order) => total + order.price * order.quantity,
                    0
                  )}
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
                  {checkout.order.order.reduce(
                    (total, order) => total + order.price * order.quantity,
                    0
                  )}
                </Text>
              </View>
              <View style={{ flex: 0.5 }}>
                <BlackButton
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
    marginTop: StatusBar.currentHeight,
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    justifyContent: "flex-start",
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 20,
    alignSelf: "center",
    fontFamily: "Poppins-Regular",
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
