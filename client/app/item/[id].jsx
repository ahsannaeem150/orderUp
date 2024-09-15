import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { AuthContext } from "../context/authContext";
import CustomButton from "../components/CustomButtons";
import StarRating from "react-native-star-rating-widget";
import axios from "axios";
import { useFetchReviews } from "../hooks/useFetchItemReviews";
import { images } from "../../constants";

const ItemDetailsScreen = () => {
  const { state, item } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState("");
  const [reRender, setReRender] = useState(false);
  const { reviews, fetchReviews } = useFetchReviews(
    `/auth/restaurant/item/${item._id}/reviews`
  );

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      await fetchReviews();
      setLoading(false);
    };
    fetch();
  }, [reRender]);

  const handleSubmitPress = async () => {
    if (rating == 0) {
      alert("Please rate the item");
      return;
    }

    if (review) {
      await axios.post(
        `/auth/restaurant/item/${item._id}/reviews/${state.user._id}`,
        { review, rating }
      );
      setReview("");
      setRating(0);
      alert("Review Added");
      setReRender((prev) => !prev);
    }
  };

  const renderReview = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: item.image }} style={styles.profileImage} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{item.reviewer}</Text>
          <StarRating
            rating={item.rating}
            starSize={15}
            onChange={() => {}}
            color="blue"
          />
        </View>
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.infoContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>

        <CustomButton
          title={"Add to Cart"}
          otherStyles={{ width: "100%" }}
          buttonStyle={{ borderRadius: 10 }}
        />
      </View>

      <View style={styles.reviewsSection}>
        <Text style={styles.reviewsHeader}>Reviews</Text>
        <View
          style={{
            backgroundColor: "#f9f9f9",
            padding: 16,
            height: 140,
            paddingBottom: 8,
            borderRadius: 8,
            marginBottom: 10,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.addReviewSection}>
              <TextInput
                style={styles.input}
                placeholder="Leave a review..."
                value={review}
                onChangeText={(text) => setReview(text)}
              />

              <CustomButton
                title={"Submit"}
                otherStyles={{ width: "25%" }}
                buttonStyle={{ borderRadius: 10 }}
                onPress={() => {
                  handleSubmitPress();
                }}
              />
            </View>
            <View style={{ flex: 1, alignSelf: "center" }}>
              <StarRating
                onChange={setRating}
                starSize={25}
                enableHalfStar={false}
                rating={rating}
                color="black"
              />
            </View>
          </View>
        </View>

        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : reviews.length == 0 ? (
          <Image
            source={images.empty}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <FlatList
            data={reviews}
            keyExtractor={(item) => item._id.toString()}
            renderItem={renderReview}
            contentContainerStyle={styles.reviewsList}
            style={styles.flatList}
          />
        )}
      </View>
    </View>
  );
};

export default ItemDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight,
    padding: 16,
    paddingBottom: 0,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoContainer: {
    marginBottom: 16,
  },
  itemName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: "500",
    color: "green",
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  reviewsSection: {
    flex: 1,
    marginTop: 24,
  },
  reviewsHeader: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  reviewsList: {
    paddingBottom: 24,
  },
  flatList: {
    flex: 1,
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

  reviewCard: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerName: {
    fontWeight: "600",
    fontSize: 16,
    color: "black",
  },
  addReviewSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
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
    width: "99%",
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
