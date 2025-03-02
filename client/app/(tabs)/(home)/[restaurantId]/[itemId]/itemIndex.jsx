import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TextInput,
  RefreshControl,
  Button,
  Modal,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
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

const ItemDetailsScreen = () => {
  const { state, cart, setCart, API_URL } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { restaurantId, itemId } = useLocalSearchParams();
  const [currentItem, setCurrentItem] = useState(null);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);

  const { getRestaurant } = useRestaurant();
  const restaurantFromCache = getRestaurant(restaurantId);

  const { reviews, fetchReviews } = useFetchReviews(
    `/restaurant/item/${itemId}/reviews`
  );
  const { fetchItem, itemsCache, error } = useFetchItems();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Try to get from cache first
        const cachedItem = itemsCache[itemId];
        if (cachedItem) {
          setCurrentItem(cachedItem);
          setCurrentRestaurant(cachedItem.restaurant);
        } else {
          // Fetch item and related data
          const itemData = await fetchItem(itemId);
          setCurrentItem(itemData);

          // If restaurant data not available in cache
          if (!restaurantFromCache) {
            const restaurantRes = await axios.get(
              `/restaurants/${restaurantId}`
            );
            setCurrentRestaurant(restaurantRes.data);
          } else {
            setCurrentRestaurant(restaurantFromCache);
          }
        }

        await fetchReviews();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [itemId, restaurantId]);

  useEffect(() => {
    if (reviews?.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const calculatedRating =
        Math.round((totalRating / reviews.length) * 2) / 2;
      setAverageRating(parseFloat(calculatedRating.toFixed(1)));
    }
  }, [reviews]);

  const handleRefresh = async () => {
    await loadData();
  };

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

  const handleSubmitReview = async () => {
    if (rating === 0) {
      alert("Please provide a rating.");
      return;
    }

    try {
      await axios.post(`/restaurant/item/${itemId}/reviews/${state.user._id}`, {
        review,
        rating,
      });
      alert("Review added successfully!");
      setReview("");
      setRating(0);
      setIsModalVisible(false);
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    }
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: `${API_URL}/images/${item.userId.profilePicture}` }}
          style={styles.profileImage}
        />
        <View style={styles.reviewDetails}>
          <Text style={styles.reviewerName}>{item.userId.name}</Text>
          <StarRating
            rating={item.rating}
            starSize={15}
            enableHalfStar={true}
            onChange={() => {}}
            animationConfig={{ scale: 1 }}
          />
        </View>
      </View>
      <Text style={styles.reviewText}>{item.comment}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={handleRefresh} />
      </View>
    );
  }

  if (!currentItem) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Item not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PageHeader
        onCartPress={() => router.push("/cart")}
        backHandler={() => router.back()}
        title={currentItem.name}
        showCartBadge={true}
      />

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
      >
        <View style={styles.topSection}>
          <Image
            source={{ uri: `${API_URL}/images/${currentItem.image}` }}
            style={styles.itemImage}
          />

          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{currentItem.name}</Text>
            <Text style={styles.itemPrice}>
              ${currentItem.price.toFixed(2)}
            </Text>
            <Text style={styles.itemDescription}>
              {currentItem.description}
            </Text>
          </View>

          <View style={styles.ratingRow}>
            <StarRating
              rating={averageRating}
              starSize={24}
              enableHalfStar={true}
              onChange={() => {}}
              starStyle={styles.starStyle}
            />
            <Text style={styles.ratingText}>
              {averageRating} ({reviews?.length} reviews)
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              style={styles.reviewButton}
            >
              <Ionicons name="pencil" size={18} color="#fff" />
              <Text style={styles.buttonText}>Write Review</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAddToCartPress}
              style={[styles.reviewButton, styles.cartButton]}
            >
              <Ionicons name="cart" size={18} color="#fff" />
              <Text style={styles.buttonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.reviewsSection}>
          {reviews?.length > 0 ? (
            <>
              <FlatList
                data={showAllReviews ? reviews : reviews.slice(0, 2)}
                keyExtractor={(item) => item._id}
                renderItem={renderReview}
                scrollEnabled={false}
              />
              {reviews.length > 2 && (
                <TouchableOpacity
                  onPress={() => setShowAllReviews(!showAllReviews)}
                  style={styles.seeAllButton}
                >
                  <Text style={styles.seeAllText}>
                    {showAllReviews ? "Show Less" : "See All Reviews"}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.noReviews}>
              <Ionicons name="chatbox-ellipses" size={40} color="#d1d5db" />
              <Text style={styles.noReviewsText}>No reviews yet</Text>
            </View>
          )}
        </View>

        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>You Might Also Like</Text>
          <RelatedItemsList itemId={itemId} restaurantId={restaurantId} />
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Your Experience</Text>

            <StarRating
              rating={rating}
              onChange={setRating}
              starSize={32}
              enableHalfStar={true}
              starStyle={styles.modalStar}
            />

            <TextInput
              style={styles.reviewInput}
              placeholder="How was your experience with this item?"
              placeholderTextColor="#9ca3af"
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitReview}
              >
                <Text style={styles.modalButtonText}>Submit Review</Text>
              </Pressable>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 80,
  },
  topSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: "100%",
    height: 280,
    borderRadius: 12,
    marginBottom: 16,
  },
  itemInfo: {
    marginBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    marginBottom: 20,
  },
  itemName: {
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    color: "#1f2937",
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: "#10b981",
    marginBottom: 12,
  },
  itemDescription: {
    fontSize: 16,
    color: "#4b5563",
    lineHeight: 24,
    fontFamily: "Poppins-Regular",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  starStyle: {
    marginRight: 4,
  },
  ratingText: {
    fontSize: 16,
    color: "#4b5563",
    marginLeft: 12,
    fontFamily: "Poppins-Medium",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  reviewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  cartButton: {
    backgroundColor: "#10b981",
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
  reviewsSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 16,
  },
  reviewCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  reviewDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#1f2937",
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    fontFamily: "Poppins-Regular",
  },
  seeAllButton: {
    paddingVertical: 12,
  },
  seeAllText: {
    color: "#3b82f6",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },
  noReviews: {
    alignItems: "center",
    paddingVertical: 32,
  },
  noReviewsText: {
    color: "#9ca3af",
    fontFamily: "Poppins-Medium",
    marginTop: 8,
  },
  relatedSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#1f2937",
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 24,
  },
  modalStar: {
    marginHorizontal: 2,
  },
  reviewInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
    minHeight: 120,
    textAlignVertical: "top",
    marginVertical: 16,
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ef4444",
  },
  submitButton: {
    backgroundColor: "#3b82f6",
  },
  modalButtonText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
});

export default ItemDetailsScreen;
