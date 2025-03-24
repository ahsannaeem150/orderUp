import React, {useCallback, useContext, useEffect, useState} from "react";
import {
    View,
    Text,
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from "react-native";
import {AuthContext} from "../context/authContext";
import {router} from "expo-router";
import {useFetchItems} from "../hooks/useFetchItems";
import colors from "../../constants/colors";
import {AntDesign} from "@expo/vector-icons";

// Stock threshold constants
const LOW_STOCK_THRESHOLD = 20; // Percentage
const CRITICAL_STOCK_THRESHOLD = 10; // Percentage

const HomePage = () => {
    const [refreshing, setRefreshing] = useState(false);
    const {state, setItem, API_URL} = useContext(AuthContext);
    const {items, fetchItems} = useFetchItems(
        `/restaurant/${state.restaurant._id}/items`
    );
    console.log(items)
    const getStockPercentage = (item) => {
        // Assuming maxStock is available in your item model
        const maxStock = item.maxStock || 100; // Fallback to 100 if not available
        return Math.round((item.quantity / maxStock) * 100);
    };

    const getStockStatus = (percentage) => {
        if (percentage <= CRITICAL_STOCK_THRESHOLD) return 'critical';
        if (percentage <= LOW_STOCK_THRESHOLD) return 'low';
        return 'healthy';
    };

    const handleNavigateItem = (item) => {
        setItem(item);
        router.push(`/items/${item._id}`);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchItems().then(() => setRefreshing(false));
    }, []);

    useEffect(() => {
        fetchItems()
    }, []);

    const renderItem = ({item}) => {
        const stockPercentage = getStockPercentage(item);
        const stockStatus = getStockStatus(stockPercentage);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => handleNavigateItem(item)}
            >
                {item.image ? (
                    <Image
                        source={{uri: `${API_URL}/images/${item.image}`}}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <AntDesign name="picture" size={24} color={colors.textSecondary}/>
                    </View>
                )}

                <View style={styles.cardContent}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>

                    <View style={styles.metaContainer}>
                        <Text style={styles.category}>{item.category}</Text>
                        <View style={[
                            styles.statusIndicator,
                            {backgroundColor: item.availability ? colors.success : colors.error}
                        ]}/>
                    </View>

                    {/* Stock Progress Bar */}
                    <View style={styles.progressContainer}>
                        <View style={[
                            styles.progressBar,
                            {
                                width: `${stockPercentage}%`,
                                backgroundColor: stockStatus === 'healthy'
                                    ? colors.success
                                    : stockStatus === 'low'
                                        ? colors.warning
                                        : colors.error
                            }
                        ]}/>
                    </View>

                    <View style={styles.inventoryRow}>
                        <Text style={styles.price}>Rs {item.price}</Text>
                        <View style={styles.stockInfo}>
                            <Text style={[
                                styles.stock,
                                stockStatus !== 'healthy' && styles.lowStockText
                            ]}>
                                {item.stock} in stock
                            </Text>
                            {stockStatus !== 'healthy' && (
                                <AntDesign
                                    name="exclamationcircle"
                                    size={14}
                                    color={
                                        stockStatus === 'critical'
                                            ? colors.error
                                            : colors.warning
                                    }
                                />
                            )}
                        </View>
                    </View>

                    {item.description && (
                        <Text style={styles.description} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (!items) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary}/>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.title}>{state.restaurant?.name}</Text>
                        <Text style={styles.subtitle}>Menu Items</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.navigate("/add-items")}
            >
                <AntDesign name="plus" size={24} color={colors.textInverted}/>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borders,
    },
    title: {
        fontSize: 24,
        fontFamily: "Poppins-SemiBold",
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: "Poppins-Regular",
        color: colors.textSecondary,
        marginTop: 4,
    },
    list: {
        paddingHorizontal: 8,
    },
    row: {
        justifyContent: "space-between",
        paddingHorizontal: 8,
    },
    card: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borders,
        margin: 8,
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: 150,
    },
    imagePlaceholder: {
        height: 150,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.borders,
    },
    cardContent: {
        padding: 12,
    },
    itemName: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 16,
        color: colors.textPrimary,
        marginBottom: 8,
    },
    metaContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    category: {
        fontFamily: "Poppins-Medium",
        fontSize: 12,
        color: colors.textSecondary,
        textTransform: "uppercase",
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    progressContainer: {
        height: 4,
        backgroundColor: colors.borders,
        borderRadius: 2,
        overflow: "hidden",
        marginVertical: 8,
    },
    progressBar: {
        height: "100%",
    },
    inventoryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    price: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 16,
        color: colors.success,
    },
    stockInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    stock: {
        fontFamily: "Poppins-Regular",
        fontSize: 12,
        color: colors.textSecondary,
    },
    lowStockText: {
        color: colors.warning,
    },
    criticalStockText: {
        color: colors.error,
    },
    description: {
        fontFamily: "Poppins-Regular",
        fontSize: 12,
        color: colors.textSecondary,
        lineHeight: 16,
    },
    addButton: {
        position: "absolute",
        bottom: 24,
        right: 24,
        backgroundColor: colors.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default HomePage;