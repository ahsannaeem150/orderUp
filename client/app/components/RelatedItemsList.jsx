import React from "react";
import {
  FlatList,
  ImageBackground,
  TouchableOpacity,
  View,
  Text,
} from "react-native";

const RelatedItemCard = ({ item, onPress }) => {
  return (
    <View style={{ marginRight: 20 }}>
      <TouchableOpacity
        style={{
          position: "relative",
          justifyContent: "center",
          alignItems: "center",
        }}
        activeOpacity={0.7}
        onPress={() => {
          onPress(item);
        }}
      >
        <ImageBackground
          source={{
            uri: item.image,
          }}
          style={{
            width: 125,
            height: 150,
            borderRadius: 10,
            marginVertical: 10,
            overflow: "hidden",
          }}
          imageStyle={{ borderRadius: 10 }}
          resizeMode="cover"
        />
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: 8,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 14,
              fontWeight: "bold",
              textAlign: "center",
            }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text
            style={{
              color: "#fff",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            Rs {item.price.toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const RelatedItemsList = ({ items, onItemPress }) => {
  return (
    <FlatList
      data={items}
      horizontal
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <RelatedItemCard item={item} onPress={onItemPress} />
      )}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    />
  );
};

export default RelatedItemsList;
