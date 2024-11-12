import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const RestaurantLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="restaurantIndex" options={{ headerShown: false }} />
      <Stack.Screen name="[itemId]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default RestaurantLayout;
