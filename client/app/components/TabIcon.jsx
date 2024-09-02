import { View, Text, Image, StyleSheet } from "react-native";

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View style={styles.iconContainer}>
      <Image
        source={icon}
        resizeMode="contain"
        style={[styles.icon, { tintColor: color }]}
      />
      <Text
        style={[
          focused ? styles.textFocused : styles.textRegular,
          { color: color },
        ]}
      >
        {name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    flexDirection: "column",
  },
  icon: {
    width: 15,
    height: 15,
  },
  textRegular: {
    fontSize: 5,
    fontFamily: "Poppins-Regular",
  },
  textFocused: {
    fontSize: 10,
    fontFamily: "Poppins-ExtraLight",
  },
});

export default TabIcon;
