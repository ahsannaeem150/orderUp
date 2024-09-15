import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { icons } from "../../constants";

const SearchField = ({
  value,
  placeHolder,
  handleChangeText,
  title,
  otherStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  console.log("hi");

  return (
    <View style={[otherStyle, styles.container]}>
      <Text style={styles.title}>{title}</Text>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: isFocused ? "gray" : "white",
            width: "100%",
          },
        ]}
      >
        <TextInput
          style={styles.textInput}
          value={value}
          placeholder={placeHolder}
          placeholderTextColor="#7b7b8b"
          onChangeText={(text) => {
            handleChangeText(text);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <Image style={styles.icon} resizeMode="contain" source={icons.search} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    color: "black",
    marginBottom: 8,
    fontFamily: "Poppins-Medium",
  },
  inputContainer: {
    borderWidth: 2,
    flexDirection: "row",
    borderRadius: 15,
    alignItems: "center",
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: "white",
  },
  textInput: {
    flex: 1,
    color: "black",
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
  icon: {
    width: 30,
    height: 30,
    alignSelf: "center",
  },
});

export default SearchField;
