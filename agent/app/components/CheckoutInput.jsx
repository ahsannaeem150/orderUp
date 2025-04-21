import { View, Text, TextInput } from "react-native";
import React from "react";

const CheckoutInput = ({ title, value, placeHolder, handleChangeText }) => {
  return (
    <View
      style={{
        alignSelf: "stretch",
        marginLeft: 20,
        marginRight: 20,
        paddingTop: 10,
        paddingBottom: 10,
      }}
    >
      <Text style={{ fontFamily: "Poppins-SemiBold" }}>{title}</Text>
      <TextInput
        style={{
          flex: 1,
          borderRadius: 5,
          borderWidth: 1,
          color: "black",
          fontFamily: "Poppins-SemiBold",
          fontSize: 16,
          paddingVertical: 10,
          paddingHorizontal: 15,
          borderWidth: 1,
          borderColor: "rgba(35, 40, 44, 0.1)",
          borderRadius: 5,
          backgroundColor: "rgba(194, 217, 236, 0.45)",
          fontSize: 16,
          color: "#333333",
          shadowOpacity: 0.1,
          shadowRadius: 3,
        }}
        value={value}
        placeholder={placeHolder}
        placeholderTextColor="#7b7b8b"
        onChangeText={handleChangeText}
      />
    </View>
  );
};

export default CheckoutInput;
