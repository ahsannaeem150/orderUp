import { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { icons } from "../../constants";

const RestaurantCard = ({ title, creator, avatar, thumbnail }) => {
  return (
    <View style={styles.parentContainer}>
      <View style={styles.container}>
        <View style={styles.divider} />
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}></View>

            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.creator} numberOfLines={1}>
                {creator}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.divider} />

        <TouchableOpacity activeOpacity={0.7} style={styles.thumbnailContainer}>
          <Image
            source={{ uri: thumbnail }}
            style={styles.thumbnail}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.divider} />
      </View>
    </View>
  );
};

export default RestaurantCard;

const styles = StyleSheet.create({
  parentContainer: {
    width: "100%",
  },
  container: {
    flexDirection: "column",
    alignItems: "center",
    borderColor: "#9ca3af",
    paddingHorizontal: 16,
    marginBottom: 26,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  divider: {
    width: "90%", // Match the card width for consistency
    height: 1,
    backgroundColor: "#e5e7eb", // Light gray color for the divider
    marginVertical: 10, // Space between the card and the divider
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 46,
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#9ca3af", // border-secondary equivalent
    justifyContent: "center",
    alignItems: "center",
    padding: 0.5,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  textContainer: {
    justifyContent: "center",
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "black",
  },
  creator: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "black", // text-gray-100 equivalent
  },
  menuIconContainer: {
    paddingTop: 8,
  },
  menuIcon: {
    width: 20,
    height: 20,
  },
  video: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    marginTop: 12,
  },
  thumbnailContainer: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    marginTop: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  playIcon: {
    width: 48,
    height: 48,
    position: "absolute",
  },
});
