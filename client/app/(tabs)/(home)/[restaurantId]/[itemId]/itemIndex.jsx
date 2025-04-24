import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
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
import PageHeader from "../../../../components/PageHeader";
import { Ionicons } from "@expo/vector-icons";
import { useItems } from "../../../../context/ItemContext";
import { useRestaurant } from "../../../../context/RestaurantContext";
import { useReviews } from "../../../../context/ReviewContext";
import colors from "../../../../../constants/colors";
import { useCart } from "../../../../context/CartContext";

const ItemDetailsScreen = () => {
  const { state, API_URL } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [quantity, setQuantity] = useState(1);

  const { reviews, fetchReviews, reviewsLoading } = useFetchReviews(itemId);
  const { cacheReviews } = useReviews();
  const { addToCart, getItemQuantityInCart } = useCart();
  const quantityInCart = getItemQuantityInCart(
    currentItem?._id,
    currentRestaurant?._id
  );

  const handleAddToCart = () => {
    addToCart(currentItem, currentRestaurant, quantity);
    setQuantity(1);
  };

  useEffect(() => {
    const loadInitialReviews = async () => {
      try {
        if (!reviews || reviews.length === 0) {
          await fetchReviews();
        }
      } catch (error) {
        console.log("Initial reviews load error:", error);
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
      <View style={styles.reviewHeader}>
        <Image
          source={
            item.userId?.profilePicture
              ? { uri: `${API_URL}/images/${item.userId.profilePicture}` }
              : images.defaultAvatar
          }
          style={styles.avatar}
        />
        <View style={styles.metaContainer}>
          <Text style={styles.reviewName} numberOfLines={1}>
            {item.userId?.name || "Anonymous User"}
          </Text>
          <View style={styles.ratingTimeContainer}>
            {/* <StarRating
              rating={Math.round(item.rating)}
              starSize={14}
              onChange={() => {}}
              starStyle={{ color: colors.highlight }}
              enableHalfStar
              animationConfig={{ scale: 1 }}
              style={styles.stars}
            /> */}
            <Text style={styles.reviewTime}>
              {new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewText}>
        {item.comment || "No comment provided"}
      </Text>
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
        showCartBadge={true}
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

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.price}>Rs {currentItem.price.toFixed(2)}</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {currentItem.category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{currentItem.category}</Text>
            </View>
          )}

          <Text style={styles.description}>{currentItem.description}</Text>

          <View style={styles.ratingContainer}>
            {/* <StarRating
              rating={Math.round(averageRating)}
              starSize={24}
              onChange={() => {}}
              starStyle={{ color: colors.highlight }}
              animationConfig={{ scale: 1 }}
              style={styles.stars}
            /> */}
            <Text style={styles.ratingText}>
              {averageRating} ({reviews?.length} reviews)
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Text style={styles.buttonText}>Add {quantity} to Cart</Text>
            <Text style={styles.totalPrice}>
              Rs {(currentItem.price * quantity).toFixed(2)}
            </Text>
            {quantityInCart > 0 && (
              <Text style={styles.cartQuantity}>
                ({quantityInCart} in cart)
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="pencil" size={16} color={colors.primary} />
            <Text style={styles.reviewButtonText}>Write Review</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>
            {reviewsLoading ? (
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

            {/* <StarRating
              rating={rating}
              onChange={(rating) => {
                setRating(Math.round(rating));
              }}
              starSize={32}
              enableHalfStar
              starStyle={{ color: colors.highlight }}
              animationConfig={{ scale: 1 }}
              style={styles.modalStars}
            /> */}

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
  },
  itemImage: {
    height: 280,
    width: "100%",
    marginBottom: 16,
  },

  price: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: colors.textPrimary,
  },

  categoryText: {
    color: colors.accent,
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },

  ratingText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: "Poppins-Medium",
  },

  reviewButtonText: {
    color: colors.primary,
    fontFamily: "Poppins-Medium",
    fontSize: 16,
  },
  section: {
    marginVertical: 24,
  },

  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: colors.primary + "08",
    borderWidth: 1,
    borderColor: colors.primary,
  },

  priceContainer: {
    alignItems: "flex-start",
  },
  totalPriceText: {
    fontFamily: "Poppins-Regular",
    color: colors.textSecondary,
    fontSize: 14,
  },
  priceText: {
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
    fontSize: 18,
  },

  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  addIcon: {
    marginRight: 4,
  },

  cartButton: {
    backgroundColor: colors.success,
    position: "relative",
  },
  cartButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityBadge: {
    position: "absolute",
    right: -8,
    top: -8,
    backgroundColor: colors.errorText,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  fabContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
    zIndex: 1,
  },
  fab: {
    backgroundColor: colors.success,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    position: "relative",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
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
  bottomActionContainer: {
    position: "absolute",
    bottom: 24,
    right: 24,
    zIndex: 1,
  },
  cartFAB: {
    backgroundColor: colors.success,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fabBadge: {
    position: "absolute",
    right: -4,
    top: -4,
    backgroundColor: colors.errorText,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  fabBadgeText: {
    color: colors.background,
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
  },

  buttonGroup: {
    flexDirection: "row",
    marginHorizontal: 16,
    paddingBottom: 16,
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: colors.borders,
    gap: 16,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 8,
  },

  buttonLabel: {
    color: "white",
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },

  infoContainer: {
    padding: 20,
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.borders + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: colors.textPrimary,
    minWidth: 24,
    textAlign: "center",
  },
  categoryContainer: {
    backgroundColor: colors.accent + "08",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    marginVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borders + "40",
  },
  addToCartButton: {
    backgroundColor: colors.success + "08",
    borderWidth: 1.5,
    borderColor: colors.success,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 8,
    justifyContent: "center",
    marginVertical: 12,
    backgroundColor: colors.success + "08",
  },
  buttonText: {
    color: colors.success,
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
  totalPrice: {
    color: colors.textPrimary,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  cartQuantity: {
    color: colors.textSecondary,
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    marginLeft: 8,
  },
  reviewCard: {
    backgroundColor: colors.background + "FA",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borders + "30",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.borders + "40",
  },
  metaContainer: {
    flex: 1,
  },
  reviewName: {
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 4,
  },
  ratingTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stars: {
    margin: 0,
    padding: 0,
  },
  reviewTime: {
    fontFamily: "Poppins-Regular",
    color: colors.textTertiary,
    fontSize: 12,
    marginLeft: 8,
  },
  reviewText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Poppins-Regular",
  },

  reviewMeta: {
    flex: 1,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  reviewDate: {
    fontFamily: "Poppins-Regular",
    color: colors.textTertiary,
    fontSize: 12,
  },

  reviewContent: {
    flex: 1,
    flexShrink: 1,
  },
});

export default ItemDetailsScreen;
