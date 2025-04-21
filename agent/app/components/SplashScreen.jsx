import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { images } from "../../constants";

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={images.background}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.overlay}>
        <Image source={images.logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Order Up</Text>
        <Text style={styles.tagline}>
          Experience the Future of Food Delivery
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  overlay: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // adds transparency to overlay
    padding: 20,
    borderRadius: 10,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
});

export default SplashScreen;
