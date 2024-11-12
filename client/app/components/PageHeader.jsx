import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

const PageHeader = () => {
  return (
    <View style={styles.container}>
      <AntDesign name="left" size={30} color="black" />
      <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 17 }}>
        Restaurant Menu
      </Text>
      <AntDesign name="shoppingcart" size={30} color="black" />
    </View>
  );
};

export default PageHeader;
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "black",
    marginBottom: 20,
  },
});
