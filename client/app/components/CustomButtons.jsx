import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // Use Expo for gradients

const CustomButton = ({ onPress, title, otherStyles, buttonStyle }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.buttonContainer, otherStyles]}
    >
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        start={[0, 0]}
        end={[1, 1]}
        style={[styles.button, buttonStyle]}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: "80%",
    height: 50,
    marginVertical: 10,
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
});

export default CustomButton;
