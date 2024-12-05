import React, { useContext } from "react";
import {
  FlatList,
  ImageBackground,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { useFetchRelatedItems } from "../hooks/useFetchRelatedItems";
import { AuthContext } from "../context/authContext";
import { router } from "expo-router";

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
          <Text
            style={{
              color: "#fff",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            Similarity: {item.similarity.toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const RelatedItemsList = ({ itemId, onItemPress }) => {
  const { relatedItems, loading, error } = useFetchRelatedItems(itemId);
  const { setItem } = useContext(AuthContext);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  // Display a friendly message if no related items are found
  if (error || (relatedItems && relatedItems.length === 0)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, textAlign: "center", color: "#888" }}>
          No similar items were found. Please try again later.
        </Text>
      </View>
    );
  }
  const sortedItems = relatedItems.sort((a, b) => b.similarity - a.similarity);

  return (
    <FlatList
      data={sortedItems}
      horizontal
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <RelatedItemCard
          item={item}
          onPress={() => {
            setItem(item);
            router.replace(
              `/(home)/[${item.restaurant}]/[${item._id}]/itemIndex`
            );
          }}
        />
      )}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    />
  );
};

export default RelatedItemsList;
