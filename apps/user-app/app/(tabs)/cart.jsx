import React, {useContext} from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Image, ActivityIndicator, Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {AuthContext} from "../context/authContext";
import {images} from "../../constants";
import CustomButton from "../components/CustomButtons";
import BlackButton from "../components/BlackButton";
import {router} from "expo-router";
import colors from "../../constants/colors";

const Cart = () => {
    const {API_URL, cart, setCart, setItem} = useContext(AuthContext);

    const increaseQuantity = (restaurantIndex, itemIndex) => {
        const updatedCart = [...cart];
        updatedCart[restaurantIndex].order[itemIndex].quantity += 1;
        setCart(updatedCart);
    };

    const handleCheckoutPress = () => {
        router.push("/checkout");
    };

    const decreaseQuantity = (restaurantIndex, itemIndex) => {
        const updatedCart = [...cart];
        const item = updatedCart[restaurantIndex].order[itemIndex];
        if (item.quantity > 1) {
            item.quantity -= 1;
        }
        setCart(updatedCart.filter((restaurant) => restaurant.order.length > 0));
    };

    const deleteItem = (restaurantIndex, itemIndex) => {
        const updatedCart = [...cart];
        updatedCart[restaurantIndex].order.splice(itemIndex, 1);
        setCart(updatedCart.filter((restaurant) => restaurant.order.length > 0));
    };

    const deleteRestaurant = (restaurantId) => {
        const updatedCart = cart.filter(
            (restaurant) => restaurant.restaurant._id !== restaurantId
        );
        setCart(updatedCart);
    };

    const calculateRestaurantTotal = (order) => {
        return order.reduce((total, item) => total + item.quantity * item.price, 0);
    };

    const renderRestaurant = ({item, index: restaurantIndex}) => (
        <View style={styles.restaurantContainer}>
            <View style={styles.restaurantHeader}>
                <Text style={styles.restaurantName}>{item.restaurant.name}</Text>
                <TouchableOpacity
                    onPress={() => deleteRestaurant(item.restaurant._id)}
                    style={styles.deleteRestaurantButton}
                >
                    <Icon name="trash-outline" size={20} color={colors.textSecondary}/>
                </TouchableOpacity>
            </View>
            <FlatList
                data={item.order}
                renderItem={renderItem(restaurantIndex, item.restaurant._id)}
                keyExtractor={(item) => item._id}
                ListFooterComponent={() => (

                    <View style={[styles.totalContainer, {paddingHorizontal: 16}]}>
                        <Text style={styles.summaryLabel}>Total</Text>
                        <Text style={styles.summaryTotal}>Rs {calculateRestaurantTotal(item.order)}</Text>
                    </View>
                )}
            />
        </View>
    );
    const renderItem =
        (restaurantIndex, restaurantId) =>
            ({item, index}) =>
                (
                    <View style={styles.cartItem}>
                        <TouchableOpacity
                            onPress={() => {
                                setItem(item);
                                router.push(`/(home)/${restaurantId}/${item._id}/itemIndex`);
                            }}
                        >
                            <Image
                                source={{uri: `${API_URL}/images/${item.image}`}}
                                style={styles.itemImage}
                            />
                        </TouchableOpacity>

                        <View style={styles.itemDetails}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemPrice}>Rs {item.price}</Text>
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity
                                    onPress={() => decreaseQuantity(restaurantIndex, index)}
                                    style={styles.quantityButton}
                                >
                                    <Icon name="remove" size={18} color={colors.textSecondary}/>
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{item.quantity}</Text>
                                <TouchableOpacity
                                    onPress={() => increaseQuantity(restaurantIndex, index)}
                                    style={styles.quantityButton}
                                >
                                    <Icon name="add" size={18} color={colors.textSecondary}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => deleteItem(restaurantIndex, index)}
                            style={styles.deleteButton}
                        >
                            <Icon name="close" size={18} color={colors.textSecondary}/>
                        </TouchableOpacity>
                    </View>
                );

    const combinedOrders = cart?.flatMap((restaurant) => restaurant.order);
    const grandTotal = combinedOrders?.reduce(
        (total, item) => total + item.quantity * item.price,
        0
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Cart</Text>
            </View>

            <FlatList
                data={cart}
                renderItem={renderRestaurant}
                keyExtractor={(item) => item.restaurant._id}
                contentContainerStyle={styles.cartList}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Image source={images.empty} style={styles.emptyImage}/>
                        <Text style={styles.emptyText}>Your cart is empty</Text>
                    </View>
                )}
                ListFooterComponent={() => {
                    return (
                        cart.length > 0 && <View style={styles.footerContainer}>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryTitle}>Order Summary</Text>
                                <FlatList
                                    data={combinedOrders}
                                    keyExtractor={(item) => item._id}
                                    renderItem={priceList}
                                    contentContainerStyle={styles.priceListContainer}
                                />
                                <View style={styles.summaryFooter}>
                                    <View style={styles.totalContainer}>
                                        <Text style={styles.summaryLabel}>Total</Text>
                                        <Text style={styles.summaryTotal}>Rs {grandTotal}</Text>
                                    </View>
                                    <BlackButton
                                        onPress={handleCheckoutPress}
                                        title="Checkout"
                                        buttonStyle={styles.checkoutButton}
                                        textStyle={styles.checkoutText}
                                    />
                                </View>
                            </View>
                        </View>
                    )
                }}
            />
        </View>
    );
};

const priceList = ({item}) => (
    <View style={styles.priceListItem}>
        <Text style={styles.priceListName}>{item.name}</Text>
        <Text style={styles.priceListQuantity}>x {item.quantity}</Text>
        <Text style={styles.priceListPrice}>Rs {item.price * item.quantity}</Text>
    </View>
);

export default Cart;

const styles = StyleSheet.create({
    footerContainer: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    summaryCard: {
        backgroundColor: colors.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borders,
        padding: 16,
    },
    summaryTitle: {
        fontSize: 18,
        fontFamily: "Poppins-SemiBold",
        color: colors.textPrimary,
        marginBottom: 16,
    },
    priceListContainer: {
        marginBottom: 16,
    },
    priceListItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.borders,
    },
    priceListName: {
        fontSize: 14,
        fontFamily: "Poppins-Regular",
        color: colors.textPrimary,
        flex: 2,
    },
    priceListQuantity: {
        fontSize: 14,
        fontFamily: "Poppins-Regular",
        color: colors.textSecondary,
        flex: 1,
        textAlign: 'center',
    },
    priceListPrice: {
        fontSize: 14,
        fontFamily: "Poppins-Medium",
        color: colors.textPrimary,
        flex: 1,
        textAlign: 'right',
    },
    summaryFooter: {
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.borders,
        paddingTop: 16,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    summaryLabel: {
        fontSize: 16,
        fontFamily: "Poppins-Medium",
        color: colors.textPrimary,
    },
    summaryTotal: {
        fontSize: 16,
        fontFamily: "Poppins-SemiBold",
        color: colors.textPrimary,
    },
    checkoutButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.textPrimary,
        height: 48,
        borderRadius: 8,
    },
    checkoutText: {
        color: colors.textPrimary,
        fontFamily: "Poppins-Medium",
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borders,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: "Poppins-SemiBold",
        color: colors.textPrimary,
    },
    restaurantContainer: {
        marginHorizontal: 16,
        marginVertical: 8,
        backgroundColor: colors.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borders,
    },
    restaurantHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borders,
    },
    restaurantName: {
        fontSize: 18,
        fontFamily: "Poppins-Medium",
        color: colors.textPrimary,
    },

    cartItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borders,
    },
    itemImage: {
        width: 56,
        height: 56,
        borderRadius: 8,
        marginRight: 16,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontFamily: "Poppins-Medium",
        color: colors.textPrimary,
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        fontFamily: "Poppins-Regular",
        color: colors.textSecondary,
        marginBottom: 8,
    },
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.borders,
        borderRadius: 20,
        padding: 4,
        alignSelf: 'flex-start',
    },
    quantityButton: {
        paddingHorizontal: 8,
    },
    quantityText: {
        fontSize: 14,
        fontFamily: "Poppins-Medium",
        color: colors.textPrimary,
        marginHorizontal: 4,
    },
    deleteButton: {
        padding: 8,
        marginLeft: 8,
    },
    totalText: {
        fontSize: 16,
        fontFamily: "Poppins-SemiBold",
        color: colors.textPrimary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    emptyImage: {
        width: 200,
        height: 200,
        marginBottom: 24,
        opacity: 0.8,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: "Poppins-Medium",
        color: colors.textSecondary,
    },

    tabs: {
        flexDirection: "row",
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        padding: 12,
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: colors.borders,
    },
    activeTab: {
        borderBottomColor: colors.accent,
    },
    tabText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    activeTabText: {
        color: colors.textPrimary,
        fontFamily: "Poppins-SemiBold",
    },

    emptyList: {flex: 1, justifyContent: "center", alignItems: "center"},
    image: {
        width: 200,
        height: 200,
        marginBottom: 24,
    },

    emptyCartContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    emptyCartText: {
        fontSize: 18,
        color: "#666",
    },

    deleteRestaurantButton: {
        padding: 8,
    },
    cartList: {
        paddingBottom: 24,
    },
    cardContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
    },

    cardFooter: {
        marginTop: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardTotal: {
        flexDirection: "row",
        alignItems: "center",
    },
    cardTotalText: {
        fontSize: 18,
        fontWeight: "600",
        marginRight: 10,
    },
    cardTotalPrice: {
        fontSize: 18,
        fontWeight: "300",
        color: "green",
    },
});
