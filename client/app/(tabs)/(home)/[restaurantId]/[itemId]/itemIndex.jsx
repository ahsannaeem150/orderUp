import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TextInput,
  Modal,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { AuthContext } from "../../../../context/authContext";
import StarRating from "react-native-star-rating-widget";
import axios from "axios";
import { useFetchReviews } from "../../../../hooks/useFetchItemReviews";
import { images } from "../../../../../constants";
import { router, useLocalSearchParams } from "expo-router";
import { useFetchItems } from "../../../../hooks/useFetchItems";
import RelatedItemsList from "../../../../components/RelatedItemsList";
import PageHeader from "../../../../components/PageHeader";

const ItemDetailsScreen = () => {
  const { state, item, restaurant, cart, setCart, setItem } =
    useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false); // State for toggling review visibility
  const { restaurantId, itemId } = useLocalSearchParams();

  const { reviews, fetchReviews } = useFetchReviews(
    `/restaurant/item/${item._id}/reviews`
  );
  const { items, fetchItems } = useFetchItems(
    `/restaurant/${restaurant._id ? restaurant._id : restaurantId}/items`
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (items == null) {
        await fetchItems();
      }
      await fetchReviews();
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (reviews != null && reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      let calculatedRating = totalRating / reviews.length;

      calculatedRating = Math.round(calculatedRating * 2) / 2;

      setAverageRating(parseFloat(calculatedRating.toFixed(1)));
    }
  }, [reviews]);

  // const handleNavigateToItemPress = (itemID, restaurantID) => {
  //   console.log(restaurantID, itemID);
  //   router.replace(`/(home)/[${restaurantID}]/[${itemID}]/itemIndex`);
  // };

  const handleAddToCartPress = () => {
    if (cart == null) {
      const newCart = [
        {
          restaurant: {
            _id: restaurant._id,
            name: restaurant.name,
            logo: restaurant.logo,
            phone: restaurant.phone,
          },
          order: [
            {
              _id: item._id,
              name: item.name,
              image: item.image,
              price: item.price,
              quantity: 1,
            },
          ],
        },
      ];
      setCart(newCart);
      alert("Added To cart Succesfully");
      return;
    }
    const tempCart = [...cart];

    // FIND RESTAURANT IN CART
    let restaurantInCart = tempCart?.find((cartItem) => {
      return cartItem?.restaurant._id == restaurant._id;
    });

    // IF NO RESTAURANT, THEN ADD RESTAURANT
    if (!restaurantInCart) {
      const newCart = [
        ...tempCart,
        {
          restaurant: {
            _id: restaurant._id,
            name: restaurant.name,
            logo: restaurant.logo,
            phone: restaurant.phone,
          },
          order: [
            {
              _id: item._id,
              name: item.name,
              image: item.image,
              price: item.price,
              quantity: 1,
            },
          ],
        },
      ];
      setCart(newCart);
      alert("Added To cart Succesfully");
      return;
    }

    const itemInCart = restaurantInCart.order.find(
      (menuItem) => menuItem._id == item._id
    );

    // IF ITEM IS ALREADY IN CART, THEN INCREMENT QUANTITY
    if (itemInCart) {
      console.log("ITEM IN CART");
      itemInCart.quantity += 1;
    } else {
      console.log("ADDING NEW ITEM TO RESTAURANT ORDER");
      restaurantInCart.order.push({
        _id: item._id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: 1,
      });
    }
    console.log("hi");
    setCart(tempCart);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      alert("Please provide a rating.");
      return;
    }
    if (review) {
      await axios.post(
        `/restaurant/item/${item._id}/reviews/${state.user._id}`,
        { review, rating }
      );
      alert("Review added successfully!");
      setReview("");
      setRating(0);
      setIsModalVisible(false);
      fetchReviews();
    }
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: `${API_URL}/images/${item.imageId}` }}
          style={styles.profileImage}
        />
        <View style={styles.reviewDetails}>
          <Text style={styles.reviewerName}>{item.reviewer}</Text>
          <StarRating
            rating={`${item.rating}`}
            starSize={15}
            enableHalfStar={true}
            onChange={() => {}}
          />
        </View>
      </View>
      <Text style={styles.reviewText}>{item.comment}</Text>
    </View>
  );

  const handleSeeAllReviews = () => {
    setShowAllReviews(true);
  };

  const handleCollapseReviews = () => {
    setShowAllReviews(false);
  };

  return (
    <View style={[styles.container, { marginBottom: 50 }]}>
      <PageHeader
        onCartPress={() => {
          router.push("/cart");
        }}
        backHandler={() => {
          router.back();
        }}
        title={item.name}
        showCartBadge={true}
      />
      <FlatList
        style={styles.flatListContainer}
        ListHeaderComponent={
          <View style={styles.topSection}>
            <Image
              source={{ uri: `${API_URL}/images/${item.imageId}` }}
              style={styles.itemImage}
            />
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>Rs {item.price}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : reviews?.length > 0 ? (
              <View style={styles.ratingContainer}>
                <StarRating
                  rating={`${averageRating}`}
                  starSize={20}
                  enableHalfStar={true}
                  onChange={() => {}}
                />
                <Text style={styles.averageRatingText}>
                  {averageRating} ({reviews?.length} reviews)
                </Text>
              </View>
            ) : (
              <Text style={styles.averageRatingText}>No Reviews</Text>
            )}
            <View
              style={{
                flex: 1,
                flexDirection: "row",
              }}
            >
              <TouchableOpacity
                onPress={() => setIsModalVisible(true)}
                style={[styles.addReviewButton, { marginRight: 10 }]}
              >
                <Text style={styles.addReviewButtonText}>Add Review</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleAddToCartPress()}
                style={[
                  styles.addReviewButton,
                  { backgroundColor: "rgba(0, 95, 79, 0.9)" },
                ]}
              >
                <Text style={styles.addReviewButtonText}>Add To Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        data={showAllReviews ? reviews : reviews?.slice(0, 2)}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderReview}
        ListFooterComponent={
          <View style={styles.relatedSection}>
            {!showAllReviews && reviews?.length > 2 && (
              <TouchableOpacity onPress={handleSeeAllReviews}>
                <Text style={styles.seeAllButton}>See All Reviews</Text>
              </TouchableOpacity>
            )}
            {showAllReviews && (
              <TouchableOpacity onPress={handleCollapseReviews}>
                <Text style={styles.seeAllButton}>Collapse</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.sectionTitle}>Related Items</Text>
            <RelatedItemsList itemId={item._id} />
          </View>
        }
      />
      <Modal
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Leave a Review</Text>
            <StarRating
              rating={`${rating}`}
              starSize={25}
              enableHalfStar={true}
              onChange={(newRating) => setRating(newRating)}
            />
            <TextInput
              style={styles.reviewInput}
              value={review}
              onChangeText={setReview}
              placeholder="Write your review..."
              multiline={true}
            />
            <View style={styles.modalActions}>
              <Pressable
                onPress={handleSubmitReview}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Submit</Text>
              </Pressable>
              <Pressable
                onPress={() => setIsModalVisible(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 5, backgroundColor: "#fff" },
  flatListContainer: { flex: 1 },
  topSection: { padding: 16, alignItems: "center" },
  itemImage: { width: "90%", height: 200, borderRadius: 12 },
  itemName: { fontSize: 24, fontWeight: "bold", marginVertical: 8 },
  itemPrice: { fontSize: 20, color: "green", marginVertical: 4 },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginVertical: 4,
    fontStyle: "italic",
    maxWidth: "90%",
  },
  ratingContainer: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  averageRatingText: { marginLeft: 8, fontSize: 16, fontWeight: "500" },
  reviewsSection: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  reviewCard: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  reviewHeader: { flexDirection: "row", marginBottom: 8 },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  reviewDetails: { marginLeft: 12 },
  reviewerName: { fontSize: 16, fontWeight: "bold" },
  reviewText: { fontSize: 14, color: "#333" },
  addReviewButton: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderRadius: 5,
  },
  addReviewButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  seeAllButton: {
    fontSize: 16,
    color: "#007BFF",
    textAlign: "center",
    marginTop: 12,
  },
  relatedSection: { padding: 16 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "80%",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  reviewInput: {
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  modalActions: { flexDirection: "row", justifyContent: "space-between" },
  modalButton: {
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    padding: 10,
    borderRadius: 5,
    width: "48%",
  },
  modalButtonText: { color: "#fff", fontSize: 16, textAlign: "center" },
});

export default ItemDetailsScreen;
