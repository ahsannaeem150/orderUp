import React from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  TouchableOpacity,
  View,
} from "react-native";

const ItemCard = ({ item }) => {
  return (
    <View style={{ marginRight: 20 }}>
      <TouchableOpacity
        style={{
          position: "relative",
          justifyContent: "center",
          alignItems: "center",
        }}
        activeOpacity={0.7}
      >
        <ImageBackground
          source={{
            uri: item.logo,
          }}
          style={{
            width: 125,
            height: 150,
            borderRadius: 10,
            marginVertical: 10,
            overflow: "hidden",
            boxShadow: "0 10px 15px rgba(0,0,0,0.4)",
          }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );
};

const RestaurantHorizontalList = ({ posts }) => {
  return (
    <FlatList
      data={posts}
      horizontal
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <ItemCard item={item} />}
    />
  );
};

export default RestaurantHorizontalList;
