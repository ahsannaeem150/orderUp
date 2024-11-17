import React, { useContext } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { AuthContext } from "../context/authContext";

const PageHeader = ({
  backHandler,
  title,
  showCartBadge = false,
  onCartPress,
}) => {
  const { cart } = useContext(AuthContext);
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={backHandler}>
        <AntDesign name="left" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity onPress={onCartPress} style={styles.cartContainer}>
        <AntDesign name="shoppingcart" size={24} color="#333" />
        {showCartBadge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {cart?.reduce((count, orderItem) => {
                return count + orderItem.order.length;
              }, 0) ?? 0}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PageHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 16,
  },
  title: {
    fontFamily: "Poppins-Medium",
    fontSize: 18,
    color: "#333",
  },
  cartContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    right: -6,
    top: -6,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
