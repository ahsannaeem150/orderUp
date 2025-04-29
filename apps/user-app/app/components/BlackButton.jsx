import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // Use Expo for gradients
import colors from "../../constants/colors";

const BlackButton = ({
  onPress,
  title,
  otherStyles,
  buttonStyle,
  isCheckingOut,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isCheckingOut}
      style={[styles.buttonContainer, otherStyles]}
    >
      <LinearGradient
        colors={["black", "rgba(30, 36, 41, 1)", "rgba(39, 49, 58, 1)"]}
        start={[0, 0]}
        end={[1, 1]}
        style={[styles.button, buttonStyle]}
      >
        {isCheckingOut ? (
          <ActivityIndicator color={colors.textInverted} />
        ) : (
          <Text style={styles.buttonText}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: "100%",
    height: 50,
    marginVertical: 10,
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
});

export default BlackButton;
