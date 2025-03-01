import { useContext, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { images } from "../../constants";
import { AuthContext } from "../context/authContext";
const RestaurantCard = ({
  address,
  name,
  logo,
  thumbnail,
  headerPressHandler,
}) => {
  return (
    <View style={styles.parentContainer}>
      <View style={styles.container}>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.header}
          onPress={() => headerPressHandler()}
        >
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: logo }}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.creator} numberOfLines={1}>
                {address}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <View style={[styles.divider, { marginVertical: 5 }]} />

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.thumbnailContainer}
          onPress={() => headerPressHandler()}
        >
          <Image
            source={{ uri: thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
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
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  divider: {
    width: "90%",
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  specialDivider: {
    width: "90%",
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 10,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#9ca3af",
    justifyContent: "center",
    alignItems: "center",
    padding: 0.5,
  },
  avatar: {
    height: "100%",
    width: "100%",
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
    color: "black",
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
});
