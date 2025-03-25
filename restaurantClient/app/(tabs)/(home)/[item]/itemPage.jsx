import {router} from "expo-router";
import {useContext, useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    FlatList
} from "react-native";
import {AuthContext} from "../../../context/authContext";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import colors from "../../../../constants/colors";
import {useItems} from "../../../context/ItemContext";
import StarRating from "react-native-star-rating-widget";
import {useFetchReviews} from "../../../hooks/useFetchItemReviews";

const ItemDetailsPage = () => {
    const {state, API_URL} = useContext(AuthContext);
    const {currentItem, deleteItem} = useItems();
    const [averageRating, setAverageRating] = useState(0);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [loading, setLoading] = useState(false);
    const {reviews, fetchReviews, reviewsLoading} = useFetchReviews(currentItem._id);
    console.log(currentItem)

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

        if (currentItem._id) {
            loadInitialReviews();
        }
    }, [currentItem._id]);

    useEffect(() => {
        if (reviews?.length > 0) {
            const total = reviews?.reduce((sum, r) => sum + r.rating, 0);
            setAverageRating(Math.round((total / reviews.length) * 2) / 2);
        }
    }, [reviews]);

    const handleDelete = async () => {
        Alert.alert(
            "Delete Item",
            "Are you sure you want to permanently delete this item?",
            [
                {text: "Cancel", style: "cancel"},
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await deleteItem(currentItem._id);
                            router.back();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete item");
                        }
                        setLoading(false);
                    }
                }
            ]
        );
    };

    const renderReview = ({item}) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                <Image
                    source={{uri: `${API_URL}/images/${item.userId.profilePicture}`}}
                    style={styles.avatar}
                />
                <View style={styles.reviewUser}>
                    <Text style={styles.reviewName}>{item.userId.name}</Text>
                    <StarRating
                        rating={Math.round(item.rating)}
                        starSize={16}
                        color={colors.primary}
                        enableHalfStar
                        emptyColor={colors.borders}
                    />
                </View>
                <Text style={styles.reviewDate}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </View>
            {item.comment && (
                <Text style={styles.reviewComment}>{item.comment}</Text>
            )}
        </View>
    );

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const options = {year: 'numeric', month: 'short', day: 'numeric'};
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (!currentItem || loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary}/>
            </View>
        );
    }

    const stockPercentage = Math.round((currentItem.stock / currentItem.maxStock) * 100);
    const visibleReviews = showAllReviews ? reviews : reviews?.slice(0, 3);

    return (
        <ScrollView style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary}/>
                </TouchableOpacity>
                <Text style={styles.title}>{currentItem.name}</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => router.push(`/edit-item/${currentItem._id}`)}>
                        <MaterialCommunityIcons name="pencil" size={24} color={colors.primary}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete}>
                        <MaterialCommunityIcons name="delete" size={24} color={colors.errorText}/>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                <Image
                    source={{uri: `${API_URL}/images/${currentItem.image}`}}
                    style={styles.itemImage}
                    resizeMode="cover"
                />

                {/* Inventory Overview */}
                <View style={styles.statsGrid}>
                    <StatBlock label="Price" value={`Rs ${currentItem.price}`}/>
                    <StatBlock label="Cost" value={`Rs ${currentItem.costPrice}`}/>
                    <StatBlock label="Stock" value={currentItem.stock}/>
                    <StatBlock label="Min Stock" value={currentItem.minStock}/>
                </View>

                {/* Stock Status */}
                <View style={styles.section}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.sectionTitle}>Stock Level</Text>
                        <Text style={styles.percentage}>{stockPercentage}%</Text>
                    </View>
                    <View style={styles.progressContainer}>
                        <View style={[
                            styles.progressBar,
                            {
                                width: `${stockPercentage}%`,
                                backgroundColor: stockPercentage > 20
                                    ? colors.success
                                    : stockPercentage > 10
                                        ? colors.warningBg
                                        : colors.errorText
                            }
                        ]}/>
                    </View>
                    <Text style={styles.stockText}>
                        {currentItem.stock} / {currentItem.maxStock} {currentItem.unit}
                    </Text>
                </View>

                {/* Product Details */}
                <View style={styles.detailsGrid}>
                    <DetailBlock label="Category" value={currentItem.category}/>
                    <DetailBlock label="Preparation" value={`${currentItem.preparationTime} mins`}/>
                    <DetailBlock label="Packaging" value={currentItem.packaging}/>
                    <DetailBlock label="Barcode" value={currentItem.barcode}/>
                </View>

                {/* Supplier Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Supplier Information</Text>
                    <DetailRow label="Name" value={currentItem.supplier?.name}/>
                    <DetailRow label="Contact" value={currentItem.supplier?.contact}/>
                    <DetailRow label="Expiry Date" value={formatDate(currentItem.expiryDate)}/>
                </View>

                {/* Dietary Tags */}
                {currentItem.tags?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Dietary Information</Text>
                        <View style={styles.tagsContainer}>
                            {currentItem.tags.map(tag => (
                                <View key={tag} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* System Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>System Information</Text>
                    <DetailRow label="Created" value={formatDate(currentItem.createdAt)}/>
                    <DetailRow label="Last Updated" value={formatDate(currentItem.updatedAt)}/>
                </View>
            </View>

            {/* Reviews Section */}
            <View style={styles.section}>
                <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => setShowAllReviews(!showAllReviews)}
                >
                    <Text style={styles.sectionTitle}>
                        Customer Reviews ({reviews?.length || 0})
                    </Text>
                    <View style={styles.ratingContainer}>
                        {reviews?.length > 0 && (
                            <>
                                <Text style={styles.ratingText}>{averageRating}</Text>
                                <MaterialCommunityIcons
                                    name="star"
                                    size={16}
                                    color={colors.warningBg}
                                />
                            </>
                        )}
                        <MaterialCommunityIcons
                            name={showAllReviews ? "chevron-up" : "chevron-down"}
                            size={24}
                            color={colors.textSecondary}
                        />
                    </View>
                </TouchableOpacity>

                {reviewsLoading ? (
                    <ActivityIndicator size="small" color={colors.primary}/>
                ) : reviews?.length > 0 ? (
                    <>
                        <FlatList
                            data={visibleReviews}
                            renderItem={renderReview}
                            keyExtractor={item => item._id}
                            scrollEnabled={false}
                            contentContainerStyle={styles.reviewsContainer}
                        />
                        {reviews.length > 3 && (
                            <TouchableOpacity
                                style={styles.showMoreButton}
                                onPress={() => setShowAllReviews(!showAllReviews)}
                            >
                                <Text style={styles.showMoreText}>
                                    {showAllReviews ? "Show Less" : "Show All Reviews"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </>
                ) : (
                    <Text style={styles.emptyText}>No reviews yet</Text>
                )}
            </View>
        </ScrollView>
    );
};

// Reusable Components
const StatBlock = ({label, value}) => (
    <View style={styles.statBlock}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </View>
);

const DetailBlock = ({label, value}) => (
    value ? (
        <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    ) : null
);

const DetailRow = ({label, value}) => (
    value ? (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}:</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    ) : null
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borders,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontFamily: "Poppins-SemiBold",
        color: colors.textPrimary,
    },
    headerActions: {
        flexDirection: "row",
        gap: 16,
    },
    content: {
        padding: 16,
    },
    itemImage: {
        width: "100%",
        height: 300,
        borderRadius: 12,
        marginBottom: 24,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
        marginBottom: 24,
    },
    statBlock: {
        flex: 1,
        minWidth: "48%",
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.borders,
        borderRadius: 8,
        padding: 16,
    },
    statLabel: {
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    statValue: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 18,
        color: colors.textPrimary,
    },
    detailsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
        marginBottom: 24,
    },
    detailBlock: {
        width: "48%",
        padding: 12,
        borderWidth: 1,
        borderColor: colors.borders,
        borderRadius: 8,
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 16,
        color: colors.textPrimary,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    ratingText: {
        fontFamily: "Poppins-SemiBold",
        color: colors.textPrimary,
        fontSize: 14,
    },
    progressContainer: {
        height: 6,
        backgroundColor: colors.borders,
        borderRadius: 3,
        overflow: "hidden",
        marginVertical: 8,
    },
    progressBar: {
        height: "100%",
    },
    stockText: {
        fontFamily: "Poppins-Regular",
        color: colors.textSecondary,
        fontSize: 14,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.borders,
    },
    detailLabel: {
        fontFamily: "Poppins-Regular",
        color: colors.textSecondary,
        flex: 1,
    },
    detailValue: {
        fontFamily: "Poppins-Medium",
        color: colors.textPrimary,
        flex: 1,
        textAlign: "right",
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 12,
    },
    tag: {
        backgroundColor: colors.borders,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    tagText: {
        fontFamily: "Poppins-Medium",
        fontSize: 12,
        color: colors.textSecondary,
    },
    reviewCard: {
        borderWidth: 1,
        borderColor: colors.borders,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
    },
    reviewHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.borders,
    },
    reviewUser: {
        flex: 1,
        gap: 4,
    },
    reviewName: {
        fontFamily: "Poppins-Medium",
        color: colors.textPrimary,
        fontSize: 14,
    },
    reviewDate: {
        fontFamily: "Poppins-Regular",
        color: colors.textSecondary,
        fontSize: 12,
    },
    reviewComment: {
        fontFamily: "Poppins-Regular",
        color: colors.textPrimary,
        fontSize: 14,
        lineHeight: 20,
    },
    emptyText: {
        fontFamily: "Poppins-Regular",
        color: colors.textSecondary,
        textAlign: "center",
        paddingVertical: 16,
    },
    showMoreButton: {
        padding: 12,
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: colors.borders,
    },
    showMoreText: {
        fontFamily: "Poppins-Medium",
        color: colors.primary,
    },
});

export default ItemDetailsPage;