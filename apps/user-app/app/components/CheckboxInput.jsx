import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CheckBox } from "@rneui/themed";

const CheckboxInput = ({
  index,
  selectedIndex,
  onValueChange,
  title,
  additionalStyles,
}) => {
  return (
    <TouchableOpacity
      onPress={onValueChange}
      style={[
        {
          flexDirection: "row",
          flex: 1,
          backgroundColor: "rgba(17, 136, 236, 0.05)",
          marginLeft: 20,
          marginRight: 20,
          height: 60,
          alignItems: "center",
        },
        additionalStyles,
      ]}
    >
      <View
        style={{
          justifyContent: "center",
          padding: 10,
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons name="truck-delivery" size={30} color="black" />
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 15, fontFamily: "Poppins-Medium" }}>
          {title}
        </Text>
      </View>
      <View style>
        <CheckBox
          checked={index === selectedIndex}
          checkedIcon="dot-circle-o"
          onPress={onValueChange}
          uncheckedIcon="circle-o"
          containerStyle={{
            backgroundColor: "",
          }}
        />
      </View>
    </TouchableOpacity>
  );
};

export default CheckboxInput;
