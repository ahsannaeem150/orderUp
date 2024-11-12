import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const HomeLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="homeindex" options={{ headerShown: false }} />
      <Stack.Screen name="[restaurantId]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default HomeLayout;
