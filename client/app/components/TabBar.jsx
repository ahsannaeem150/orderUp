import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import AntDesign from "@expo/vector-icons/AntDesign";

const TabBar = ({ state, descriptors, navigation }) => {
  const primaryColor = "blue";
  const secondaryColor = "black";
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
    profile: (props) => (
      <AntDesign name="user" size={26} color={secondaryColor} {...props} />
    ),
  };
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
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
            style={styles.tabBarItem}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
          >
            {icons[route.name]({
              color: isFocused ? primaryColor : secondaryColor,
            })}
            <Text style={{ color: isFocused ? primaryColor : secondaryColor }}>
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
  tabBar: {
    position: "absolute",
    bottom: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 15,
    borderColor: "black",
    borderCurve: "continuous",
    shadowColor: "color",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
  tabBarItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
