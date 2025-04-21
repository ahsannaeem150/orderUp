import {View, Text, TouchableOpacity, StyleSheet} from "react-native";
import React from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import colors from "../../constants/colors";

const TabBar = ({state, descriptors, navigation}) => {
    const insets = useSafeAreaInsets();
    const primaryColor = colors.primary;
    const secondaryColor = colors.secondary;
    const icons = {
        "(home)": (props) => (
            <AntDesign name="home" size={26} color={secondaryColor} {...props} />
        ),
        cart: (props) => (
            <AntDesign
                name="shoppingcart"
                size={26}
                color={secondaryColor}
                {...props}
            />
        ),
        "(orders)": (props) => (
            <AntDesign name="hourglass" size={26} color={secondaryColor} {...props} />
        ),
        "(requests)": (props) => (
            <AntDesign name="notification" size={26} color={secondaryColor} {...props} />
        ),
        "(profile)": (props) => (
            <AntDesign name="user" size={26} color={secondaryColor} {...props} />
        ),
    };
    return (
        <View style={[styles.container, {paddingBottom: insets.bottom}]}>
            {state.routes.map((route, index) => {
                const {options} = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                if (["_sitemap", "+not-found"].includes(route.name)) return null;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: "tabPress",
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: "tabLongPress",
                        target: route.key,
                    });
                };

                return (
                    <TouchableOpacity
                        key={route.key}
                        style={styles.tab}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? {selected: true} : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                    >
                        {icons[route.name]({
                            color: isFocused ? primaryColor : secondaryColor,
                        })}
                        <Text style={[styles.label, isFocused && styles.activeLabel]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default TabBar;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.borders,
        height: 60,
    },
    tab: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    label: {
        fontSize: 14,
        color: colors.textSecondary,
        fontFamily: "Poppins-Regular",
    },
    activeLabel: {
        color: colors.primary,
        fontFamily: "Poppins-SemiBold",
    },
});
