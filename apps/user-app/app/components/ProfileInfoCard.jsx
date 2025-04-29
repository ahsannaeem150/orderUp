import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const ProfileInfoCard = ({ title, icon, titleValue }) => {
  return (
    <View style={styles.card}>
      <AntDesign name={icon} style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.titleValue}>{titleValue}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f8f8f8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 15,
    width: "100%",
  },
  icon: {
    width: 24,
    height: 24,
    fontSize: 24,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    color: "gray",
  },
  titleValue: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    marginRight: 15,
  },
});

export default ProfileInfoCard;
