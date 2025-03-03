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
import colors from "../../constants/colors";

const SearchField = ({
  value,
  placeHolder,
  handleChangeText,
  title,
  otherStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={[otherStyle, styles.container]}>
      <Text style={styles.title}>{title}</Text>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: isFocused ? colors.muted : colors.borders,
            width: "100%",
          },
        ]}
      >
        <TextInput
          style={styles.textInput}
          value={value}
          placeholder={placeHolder}
          placeholderTextColor="#7b7b8b"
          onChangeText={(value) => {
            if (value.includes(" ")) {
              handleChangeText(value.trim());
            } else {
              handleChangeText(value);
            }
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
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 16,
    color: "black",
    marginBottom: 8,
    color: colors.primary,
    fontFamily: "Poppins-Medium",
  },
  inputContainer: {
    borderWidth: 2,
    flexDirection: "row",
    borderRadius: 15,
    alignItems: "center",
    height: 64,
    paddingHorizontal: 16,
    borderColor: colors.muted,
    backgroundColor: colors.textInverted,
  },
  textInput: {
    flex: 1,
    color: colors.primary,
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
  icon: {
    width: 30,
    height: 30,
    tintColor: colors.accent,
    alignSelf: "center",
  },
});

export default SearchField;
