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

const FormField = ({
  title,
  value,
  placeHolder,
  handleChangeText,
  isPassword = false,
  isSearch = false,
  otherStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(isPassword);

  return (
    <View style={[otherStyle, styles.container]}>
      <Text style={styles.title}>{title}</Text>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: isFocused ? "gray" : "white",
            width: isSearch ? "100%" : "80%",
          },
        ]}
      >
        <TextInput
          style={styles.textInput}
          value={value}
          placeholder={placeHolder}
          placeholderTextColor="#7b7b8b"
          onChangeText={handleChangeText}
          secureTextEntry={showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {isPassword ? (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              style={styles.icon}
              resizeMode="contain"
              source={showPassword ? icons.eye : icons.eyeHide}
            />
          </TouchableOpacity>
        ) : null}
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
    color: "black", // Light gray color
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
    backgroundColor: "white", // Black background color
  },
  textInput: {
    flex: 1,
    color: "black", // White text color
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
  icon: {
    width: 30,
    height: 30,
    alignSelf: "center",
  },
});

export default FormField;
