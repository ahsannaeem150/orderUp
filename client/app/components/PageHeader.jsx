import React, {useContext} from "react";
import {StyleSheet, Text, View, TouchableOpacity} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import {AuthContext} from "../context/authContext";
import colors from "../../constants/colors";

const PageHeader = ({backHandler, title, showCartBadge = false, onCartPress}) => {
    const {cart} = useContext(AuthContext);

    const cartItemCount = cart?.reduce((count, orderItem) => (
        count + orderItem.order.length
    ), 0) ?? 0;

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <TouchableOpacity
                    onPress={backHandler}
                    style={styles.button}
                    hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                >
                    <AntDesign name="left" size={24} color={colors.textPrimary}/>
                </TouchableOpacity>

                <Text style={styles.title}>{title}</Text>

                <TouchableOpacity
                    onPress={onCartPress}
                    style={styles.cartButton}
                    hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                >
                    <View style={styles.cartIconContainer}>
                        <AntDesign
                            name="shoppingcart"
                            size={24}
                            color={colors.textPrimary}
                        />
                        {showCartBadge && cartItemCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{cartItemCount}</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default PageHeader;

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.borders,
    },
    innerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 24,
    },
    button: {
        padding: 8,
    },
    title: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 16,
        color: colors.textPrimary,
        marginHorizontal: 12,
        flex: 1,
        textAlign: 'center',
    },
    cartButton: {
        padding: 8,
    },
    cartIconContainer: {
        position: 'relative',
    },
    badge: {
        position: "absolute",
        right: -8,
        top: -8,
        backgroundColor: colors.success,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 4,
    },
    badgeText: {
        color: colors.textInverted,
        fontSize: 12,
        fontFamily: "Poppins-SemiBold",
        lineHeight: 20,
        textAlign: 'center',
        textAlignVertical: 'center',
        includeFontPadding: false,
    },
});