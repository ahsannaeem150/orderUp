import React, {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
    RefreshControl
} from "react-native";
import {AuthContext} from "../../context/authContext";
import {router} from "expo-router";
import {useFetchItems} from "../../hooks/useFetchItems";
import colors from "../../../constants/colors";
import {AntDesign} from "@expo/vector-icons";
import dayjs from "dayjs";
import {useItems} from "../../context/ItemContext";

const HomePage = () => {
    const [refreshing, setRefreshing] = useState(false);
    const {state, API_URL} = useContext(AuthContext);
    const {cacheItems, itemsCache, setCurrentItem} = useItems();
    const {items, fetchItems} = useFetchItems(
        `/restaurant/${state.restaurant._id}/items`
    );
    const restaurantItems = Object.values(itemsCache);
    const getStockStatus = (item) => {
        const percentage = (item.stock / item.maxStock) * 100;
        if (percentage <= 10) return 'critical';
        if (percentage <= 20) return 'low';
        return 'healthy';
    };

    const handleNavigateItem = (item) => {
        setCurrentItem(item);
        router.push(`/(home)/[item]/itemPage`);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchItems();
        } finally {
            setRefreshing(false);
        }
    }, [fetchItems]);

    useEffect(() => {
        if (items) {
            cacheItems(items);
        }
    }, [items]);

    useEffect(() => {
        if (!items) fetchItems();
    }, []);

    const renderItem = ({item}) => {
        const stockStatus = getStockStatus(item);
        const margin = ((item.price - item.costPrice) / item.costPrice * 100).toFixed(0);
        const daysToExpiry = dayjs(item.expiryDate).diff(dayjs(), 'day');

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => handleNavigateItem(item)}
            >
                <View style={styles.cardHeader}>
                    {item.image ? (
                        <Image
                            source={{uri: `${API_URL}/images/${item.image}`}}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <AntDesign name="picture" size={20} color={colors.textSecondary}/>
                        </View>
                    )}
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.itemHeader}>
                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                        <View style={[styles.statusDot, {
                            backgroundColor: item.availability ? colors.success : colors.error
                        }]}/>
                    </View>

                    <View style={styles.metaRow}>
                        <Text style={styles.category}>{item.category}</Text>
                        <View style={styles.divider}/>
                        <Text style={styles.preparationTime}>
                            <AntDesign name="clockcircle" size={12}/> {item.preparationTime}m
                        </Text>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>Rs {item.price}</Text>
                            <Text style={styles.statLabel}>{margin}% margin</Text>
                        </View>

                        <View style={styles.stockContainer}>
                            <View style={[styles.stockBadge, styles[stockStatus]]}>
                                <Text style={styles.stockText}>
                                    {item.stock}/{item.maxStock}
                                </Text>
                            </View>
                            <Text style={styles.stockLabel}>in stock</Text>
                        </View>
                    </View>

                    {daysToExpiry <= 7 && (
                        <View style={styles.expiryNotice}>
                            <AntDesign name="warning" size={14} color={colors.warning}/>
                            <Text style={styles.expiryText}>
                                Expires in {daysToExpiry} day{daysToExpiry !== 1 ? 's' : ''}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={restaurantItems}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
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
                        <Text style={styles.title}>Inventory Overview</Text>
                        <Text style={styles.subtitle}>{state.restaurant?.name}</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <AntDesign name="inbox" size={40} color={colors.textSecondary}/>
                        <Text style={styles.emptyText}>No items in inventory</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push("/(home)/[addItems]/add-items")}
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
        padding: 24,
        paddingBottom: 16,
    },
    title: {
        fontSize: 24,
        fontFamily: "Poppins-SemiBold",
        color: colors.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: "Poppins-Regular",
        color: colors.textSecondary,
    },
    list: {
        paddingHorizontal: 16,
    },
    card: {
        backgroundColor: colors.background,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 1,
        shadowColor: colors.textPrimary,
        shadowOpacity: 0.05,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 4,
    },
    cardHeader: {
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 140,
    },
    imagePlaceholder: {
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.borders,
    },
    cardBody: {
        padding: 16,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemName: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 16,
        color: colors.textPrimary,
        flex: 1,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginLeft: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    category: {
        fontFamily: "Poppins-Medium",
        fontSize: 12,
        color: colors.textSecondary,
    },
    divider: {
        width: 1,
        height: 12,
        backgroundColor: colors.borders,
        marginHorizontal: 8,
    },
    preparationTime: {
        fontFamily: "Poppins-Regular",
        fontSize: 12,
        color: colors.textSecondary,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statItem: {
        alignItems: 'flex-start',
    },
    statValue: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 16,
        color: colors.textPrimary,
    },
    statLabel: {
        fontFamily: "Poppins-Regular",
        fontSize: 12,
        color: colors.textSecondary,
    },
    stockContainer: {
        alignItems: 'flex-end',
    },
    stockBadge: {
        borderRadius: 6,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    healthy: {
        backgroundColor: colors.success + '20',
    },
    low: {
        backgroundColor: colors.warningBg + '20',
    },
    critical: {
        backgroundColor: colors.errorText + '20',
    },
    stockText: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 14,
    },
    stockLabel: {
        fontFamily: "Poppins-Regular",
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
    },
    expiryNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    expiryText: {
        fontFamily: "Poppins-Regular",
        fontSize: 12,
        color: colors.warning,
        marginLeft: 4,
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
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 48,
    },
    emptyText: {
        fontFamily: "Poppins-Medium",
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 16,
    },
});

export default HomePage;