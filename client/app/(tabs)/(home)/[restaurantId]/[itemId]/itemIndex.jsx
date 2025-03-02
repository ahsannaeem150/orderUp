import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
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
import { Ionicons } from "@expo/vector-icons";
import { useItems } from "../../../../context/ItemContext";
import { useRestaurant } from "../../../../context/RestaurantContext";
import { useReviews } from "../../../../context/ReviewContext";

const ItemDetailsScreen = () => {
  const { state, cart, setCart, API_URL } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { restaurantId, itemId } = useLocalSearchParams();
  const { itemsCache, getItem, cacheItems } = useItems();
  const { getRestaurant, cacheRestaurants } = useRestaurant();
  const [currentItem, setCurrentItem] = useState(() => getItem(itemId));
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [loading, setLoading] = useState(!itemsCache[itemId]);
  const [error, setError] = useState(null);

  const { reviews, fetchReviews } = useFetchReviews(itemId);
  const { cacheReviews } = useReviews();

  useEffect(() => {
    const loadInitialReviews = async () => {
      try {
        if (reviews.length === 0) {
          await fetchReviews();
        }
      } catch (error) {
        console.log("Initial reviews load error:", error);
      }
    };

    if (itemId) {
      loadInitialReviews();
    }
  }, [itemId]); // Add this useEffect

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const itemResponse = await axios.get(`/restaurant/items/${itemId}`);
      const item = itemResponse.data.item;
      cacheItems([item]);
      setCurrentItem(item);
      const restaurant = itemResponse.data.item.restaurant;
      cacheRestaurants([restaurant]);
      setCurrentRestaurant(restaurant);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    if (!itemsCache[itemId]) loadData();
  }, [itemId]);

  useEffect(() => {
    if (reviews?.length > 0) {
      const total = reviews.reduce((sum, r) => sum + r.rating, 0);
      setAverageRating(Math.round((total / reviews.length) * 2) / 2);
    }
  }, [reviews]);
  const handleAddToCartPress = () => {
    if (!currentItem || !currentRestaurant) return;

    const newCartItem = {
      _id: currentItem._id,
      name: currentItem.name,
      image: currentItem.image,
      price: currentItem.price,
      quantity: 1,
    };

    const restaurantCartItem = {
      restaurant: {
        _id: currentRestaurant._id,
        name: currentRestaurant.name,
        logo: currentRestaurant.logo,
        phone: currentRestaurant.phone,
      },
      order: [newCartItem],
    };

    setCart((prevCart) => {
      const existingRestaurantIndex = prevCart?.findIndex(
        (item) => item.restaurant._id === currentRestaurant._id
      );

      if (existingRestaurantIndex === -1) {
        return [...(prevCart || []), restaurantCartItem];
      }

      const updatedCart = [...prevCart];
      const existingItemIndex = updatedCart[
        existingRestaurantIndex
      ].order.findIndex((item) => item._id === currentItem._id);

      if (existingItemIndex === -1) {
        updatedCart[existingRestaurantIndex].order.push(newCartItem);
      } else {
        updatedCart[existingRestaurantIndex].order[
          existingItemIndex
        ].quantity += 1;
      }

      return updatedCart;
    });

    alert("Added to cart successfully!");
  };

  const submitReview = async () => {
    try {
      const response = await axios.post(
        `/restaurant/item/${itemId}/reviews/${state.user._id}`,
        {
          rating,
          comment: review,
        }
      );

      cacheReviews(itemId, (prev) => [...prev, response.data.review]);
      // Reset form
      setIsModalVisible(false);
      setRating(0);
      setReview("");
    } catch (error) {
      await fetchReviews(); // Refresh from server
    }
  };

  const ReviewCard = ({ item }) => (
    <View style={styles.reviewCard}>
      {console.log(item)}
      <Image
        source={{ uri: `${API_URL}/images/${item.userId?.profilePicture}` }}
        style={styles.avatar}
      />
      <View style={styles.reviewContent}>
        <Text style={styles.reviewName}>{item.userId?.name}</Text>
        <StarRating
          rating={Math.round(item.rating)}
          starSize={16}
          enableHalfStar
          animationConfig={{ scale: 1 }}
          style={styles.stars}
        />
        <Text style={styles.reviewText}>{item.comment}</Text>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator style={styles.loader} size="large" />;
  if (error) return <Text style={styles.error}>Error loading item</Text>;
  if (!currentItem) return <Text style={styles.error}>Item not found</Text>;

  return (
    <View style={styles.container}>
      <PageHeader
        title={currentItem.name}
        backHandler={router.back}
        showCartBadge={cart?.length > 0}
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
      >
        {/* Item Image */}
        <Image
          source={{ uri: `${API_URL}/images/${currentItem.image}` }}
          style={styles.itemImage}
        />

        {/* Item Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.price}>${currentItem.price.toFixed(2)}</Text>
          <Text style={styles.description}>{currentItem.description}</Text>

          <View style={styles.ratingContainer}>
            <StarRating
              rating={Math.round(averageRating)}
              starSize={24}
              animationConfig={{ scale: 1 }}
            />
            <Text style={styles.ratingText}>
              {averageRating} ({reviews?.length} reviews)
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="pencil" size={18} color="white" />
            <Text style={styles.buttonText}>Write Review</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cartButton]}
            onPress={handleAddToCartPress}
          >
            <Ionicons name="cart" size={18} color="white" />
            <Text style={styles.buttonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Reviews</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : reviews?.length > 0 ? (
            <>
              {reviews.slice(0, showAllReviews ? undefined : 2).map((item) => (
                <ReviewCard key={item._id} item={item} />
              ))}
              {reviews.length > 2 && (
                <TouchableOpacity
                  onPress={() => setShowAllReviews(!showAllReviews)}
                  style={styles.seeMore}
                >
                  <Text style={styles.seeMoreText}>
                    {showAllReviews ? "Show less" : "See all reviews"}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Text style={styles.noReviews}>No reviews yet</Text>
          )}
        </View>

        {/* Related Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>You Might Also Like</Text>
          <RelatedItemsList itemId={itemId} restaurantId={restaurantId} />
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Write a Review</Text>

            <StarRating
              rating={rating}
              onChange={(rating) => {
                setRating(Math.round(rating));
              }}
              starSize={32}
              enableHalfStar
              animationConfig={{ scale: 1 }}
              style={styles.modalStars}
            />

            <TextInput
              style={styles.input}
              placeholder="Share your experience..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              value={review}
              onChangeText={setReview}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitReview}
              >
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    marginBottom: 50,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    flex: 1,
    textAlign: "center",
    marginTop: 40,
    color: "#ef4444",
  },
  itemImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  infoContainer: {
    padding: 24,
    backgroundColor: "white",
  },
  price: {
    fontSize: 28,
    fontFamily: "Poppins-SemiBold",
    color: "#10b981",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#64748b",
    marginBottom: 24,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ratingText: {
    fontSize: 16,
    color: "#64748b",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 16,
    padding: 24,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#3b82f6",
  },
  cartButton: {
    backgroundColor: "#10b981",
  },
  buttonText: {
    color: "white",
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#0f172a",
    marginBottom: 16,
  },
  reviewCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  reviewContent: {
    flex: 1,
  },
  reviewName: {
    fontFamily: "Poppins-SemiBold",
    color: "#0f172a",
    marginBottom: 4,
  },
  reviewText: {
    color: "#64748b",
    lineHeight: 20,
    marginTop: 8,
  },
  seeMore: {
    padding: 12,
    alignItems: "center",
  },
  seeMoreText: {
    color: "#3b82f6",
    fontFamily: "Poppins-SemiBold",
  },
  noReviews: {
    textAlign: "center",
    color: "#94a3b8",
    marginVertical: 24,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modal: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    marginBottom: 24,
  },
  modalStars: {
    alignSelf: "center",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 24,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f1f5f9",
  },
  submitButton: {
    backgroundColor: "#3b82f6",
  },
  modalButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#3b82f6",
  },
  submitButtonText: {
    color: "white",
  },
});

export default ItemDetailsScreen;
