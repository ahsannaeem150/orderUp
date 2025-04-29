import React, { useContext } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { images } from "../../constants";
import { AuthContext } from "../context/authContext";

const ItemCard = ({ item, onPress }) => {
  const { API_URL } = useContext(AuthContext);
  return (
    <View style={{ marginRight: 20 }}>
      <TouchableOpacity
        style={{
          position: "relative",
          justifyContent: "center",
          alignItems: "center",
        }}
        activeOpacity={0.7}
        onPress={() => onPress(item)}
      >
        <ImageBackground
          source={{
            uri: item?.logo
              ? `${API_URL}/images/${item.logo}`
              : images.logoPlaceholder,
          }}
          style={{
            width: 125,
            height: 150,
            borderRadius: 10,
            marginVertical: 10,
            overflow: "hidden",
          }}
          resizeMode="cover"
        ></ImageBackground>
      </TouchableOpacity>
    </View>
  );
};

const RestaurantHorizontalList = ({ posts, onRestaurantClick }) => {
  return (
    <FlatList
      data={posts}
      horizontal
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <ItemCard item={item} onPress={() => [onRestaurantClick(item)]} />
      )}
    />
  );
};

export default RestaurantHorizontalList;
