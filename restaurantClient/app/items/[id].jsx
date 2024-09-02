import { router, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useFetchItem } from "../hooks/useFetchItem";
import { useFetchReviews } from "../hooks/useFetchItemReviews";
import { AuthContext } from "../context/authContext";
import { ScrollView } from "react-native";
import axios from "axios";
import ConfirmDialog from "../components/ConfirmDialog";
import StarRating from "react-native-star-rating-widget";

const ItemDetailsPage = () => {
  const { state, item } = useContext(AuthContext);
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const { reviews, fetchReviews } = useFetchReviews(
    `/auth/restaurant/item/${item._id}/reviews`
  );
  const handleDeletePress = () => {
    setConfirmVisible(true);
  };

  const deleteItem = async () => {
    try {
      const response = await axios.delete(
        `/auth/restaurant/${state.restaurant._id}/item/${item._id}`
      );
      console.log(response.data.message);
      router.back();
    } catch (error) {
      console.log("error", error);
    } finally {
    }
  };
  const handleConfirm = () => {
    setConfirmVisible(false);
    deleteItem();
    console.log("Confirmed!");
  };

  const handleCancel = () => {
    setConfirmVisible(false);
    console.log("Cancelled!");
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const renderReview = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: item.image }} style={styles.profileImage} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{item.reviewer}</Text>
          <StarRating
            rating={4}
            starSize={17}
            onChange={() => {}}
            color="blue"
          />
        </View>
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
    </View>
  );

  if (!item) {
    return (
      <ActivityIndicator
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        size="large"
        color="#0000ff"
      />
    );
  }

  return (
    <FlatList
      data={reviews}
      renderItem={renderReview}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={() => (
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>{item.price}</Text>
            <Text style={styles.itemStock}>Stock: {item.stock}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeletePress()}
            >
              <Text style={styles.deleteButtonText}>Delete Item</Text>
            </TouchableOpacity>
            <Text style={styles.reviewsTitle}>Reviews:</Text>
            <ConfirmDialog
              visible={isConfirmVisible}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              message="Are you sure you want to delete this item?"
            />
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  itemImage: {
    width: "100%",
    height: 600,
    borderRadius: 10,
  },

  detailsContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    marginBottom: 10,
  },
  itemPrice: {
    fontSize: 20,
    fontFamily: "Poppins-Regular",
    color: "green",
    marginBottom: 10,
  },
  itemStock: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "gray",
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  reviewsTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    marginBottom: 10,
  },
  reviewContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    flex: 1,
    alignItems: "flex-start",
    padding: 10,
    marginBottom: 10,
    elevation: 1,
  },
  reviewAuthor: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    marginBottom: 5,
  },
  reviewComment: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    paddingBottom: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    marginVertical: 10,
    width: "90%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 16,
    marginLeft: 7,
    fontWeight: "600",
    color: "#333",
  },
  comment: {
    fontSize: 14,
    color: "black",
    fontFamily: "Poppins-Regular",
    marginTop: 5,
    marginLeft: 3,
  },
});

export default ItemDetailsPage;
