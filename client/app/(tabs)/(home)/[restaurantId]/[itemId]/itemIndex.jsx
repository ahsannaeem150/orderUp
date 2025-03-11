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
import colors from "../../../../../constants/colors";

const ItemDetailsScreen = () => {
  const { state, cart, setCart, API_URL } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { restaurantId, itemId } = useLocalSearchParams();
  const { itemsCache, getItem, cacheItems } = useItems();
  const { getRestaurant, cacheRestaurants } = useRestaurant();
  const [currentItem, setCurrentItem] = useState(() => getItem(itemId));
  const [currentRestaurant, setCurrentRestaurant] = useState(() =>
    getRestaurant(restaurantId)
  );
  const [loading, setLoading] = useState(!itemsCache[itemId]);
  const [error, setError] = useState(null);

  const { reviews, fetchReviews } = useFetchReviews(itemId);
  const { cacheReviews } = useReviews();

  useEffect(() => {
    const loadInitialReviews = async () => {
      try {
        setLoadingReviews(true);
        if (!reviews || reviews.length === 0) {
          await fetchReviews();
        }
      } catch (error) {
        console.log("Initial reviews load error:", error);
      } finally {
        setLoadingReviews(false);
      }
    };

    if (itemId) {
      loadInitialReviews();
    }
  }, [itemId]);

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
    console.log(cart);
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
      const existingRestaurantIndex = (prevCart || []).findIndex(
        (item) => item.restaurant._id === currentRestaurant._id
      );

      if (existingRestaurantIndex === -1) {
        return [...(prevCart || []), restaurantCartItem];
      }

      const updatedCart = [...(prevCart || [])];

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
      setIsSubmitting(true);
      const response = await axios.post(
        `/restaurant/item/${itemId}/reviews/${state.user._id}`,
        { rating, comment: review }
      );

      const currentReviews = reviews || [];
      cacheReviews(itemId, [...currentReviews, response.data.review]);

      setIsModalVisible(false);
      setRating(0);
      setReview("");
    } catch (error) {
      await fetchReviews();
    } finally {
      setIsSubmitting(false);
    }
  };

  const ReviewCard = ({ item }) => (
    <View style={styles.reviewCard}>
      <Image
        source={
          item.userId?.profilePicture
            ? { uri: `${API_URL}/images/${item.userId.profilePicture}` }
            : images.defaultAvatar
        }
        style={styles.avatar}
      />
      <View style={styles.reviewContent}>
        <Text style={styles.reviewName}>
          {item.userId?.name || "Anonymous User"}
        </Text>
        <StarRating
          rating={Math.round(item.rating)}
          starSize={16}
          onChange={() => {}}
          starStyle={{ color: colors.highlight }}
          enableHalfStar
          animationConfig={{ scale: 1 }}
          style={styles.stars}
        />
        <Text style={styles.reviewText}>
          {item.comment || "No comment provided"}
        </Text>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator color={colors.accent} />;
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
        <Image
          source={{ uri: `${API_URL}/images/${currentItem.image}` }}
          style={styles.itemImage}
        />

        <View style={styles.infoContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${currentItem.price.toFixed(2)}</Text>
            {currentItem.category && (
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryText}>{currentItem.category}</Text>
              </View>
            )}
          </View>
          <Text style={styles.description}>{currentItem.description}</Text>
          <View style={styles.ratingContainer}>
            <StarRating
              rating={Math.round(averageRating)}
              starSize={24}
              onChange={() => {}}
              starStyle={{ color: colors.highlight }}
              animationConfig={{ scale: 1 }}
              style={styles.stars}
            />
            <Text style={styles.ratingText}>
              {averageRating} ({reviews?.length} reviews)
            </Text>
          </View>
        </View>

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
            disabled={!currentItem || !currentRestaurant}
          >
            <Ionicons name="cart" size={18} color="white" />
            <Text style={styles.buttonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Reviews</Text>
          {loadingReviews ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (reviews || []).length > 0 ? (
            <>
              {(reviews || [])
                .slice(0, showAllReviews ? undefined : 2)
                .map((item) => (
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>You Might Also Like</Text>
          <RelatedItemsList itemId={itemId} restaurantId={restaurantId} />
        </View>
      </ScrollView>

      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Image
                source={
                  state.user?.profilePicture
                    ? { uri: `${API_URL}/images/${state.user.profilePicture}` }
                    : images.defaultAvatar
                }
                style={styles.modalAvatar}
              />
              <Text style={styles.modalUserName}>
                {state.user?.name || "Guest User"}
              </Text>
            </View>

            <Text style={styles.modalTitle}>How was your experience?</Text>

            <StarRating
              rating={rating}
              onChange={(rating) => {
                setRating(Math.round(rating));
              }}
              starSize={32}
              enableHalfStar
              starStyle={{ color: colors.highlight }}
              animationConfig={{ scale: 1 }}
              style={styles.modalStars}
            />

            <TextInput
              style={styles.input}
              placeholder="Share your experience..."
              placeholderTextColor={colors.textTertiary}
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
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitReview}
                disabled={rating === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.textInverted} />
                ) : (
                  <Text
                    style={[styles.modalButtonText, styles.submitButtonText]}
                  >
                    Submit
                  </Text>
                )}
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
    backgroundColor: colors.background,
    marginBottom: 50,
  },
  categoryText: {
    color: colors.accent,
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  reviewContent: {
    flex: 1,
    flexShrink: 1,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  categoryContainer: {
    backgroundColor: colors.accent + "20",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
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
    color: colors.errorText,
  },
  itemImage: {
    height: 300,
    resizeMode: "cover",
    borderRadius: 12,
    margin: 16,
  },
  infoContainer: {
    padding: 24,
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  stars: {
    marginVertical: 4,
    alignSelf: "flex-start",
  },

  price: {
    fontSize: 28,
    fontFamily: "Poppins-SemiBold",
    color: colors.primary,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    gap: 12,
  },
  ratingText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: "Poppins-Medium",
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 16,
    marginHorizontal: 16,
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
    backgroundColor: colors.primary,
  },
  cartButton: {
    backgroundColor: colors.success,
  },
  buttonText: {
    color: colors.background,
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
    color: colors.textPrimary,
    marginBottom: 16,
    marginHorizontal: 16,
  },

  reviewCard: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
    elevation: 2,
    marginHorizontal: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borders,
  },
  reviewName: {
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  reviewText: {
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
  },
  seeMore: {
    padding: 12,
    alignItems: "center",
  },
  seeMoreText: {
    color: colors.primary,
    fontFamily: "Poppins-SemiBold",
  },
  noReviews: {
    textAlign: "center",
    color: colors.textTertiary,
    marginVertical: 24,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary + "80",
  },
  modal: {
    width: "90%",
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 24,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borders,
  },
  modalUserName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: colors.textPrimary,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.borders,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 24,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  modalStars: {
    marginVertical: 15,
    alignSelf: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: colors.borders,
  },
  submitButton: {
    backgroundColor: colors.primary,
    opacity: 1,
  },
  modalButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
  cancelButtonText: {
    color: colors.textPrimary,
  },
  submitButtonText: {
    color: colors.background,
  },
});

export default ItemDetailsScreen;
