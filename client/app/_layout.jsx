import { View, Text } from "react-native";
import { useFonts } from "expo-font";
import { useContext, useEffect } from "react";
import React from "react";
import { router, SplashScreen, Stack } from "expo-router";
import { AuthContext, AuthProvider } from "./context/authContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RestaurantProvider } from "./context/RestaurantContext";
import { ItemProvider } from "./context/ItemContext";
import { ReviewProvider } from "./context/ReviewContext";
SplashScreen.preventAutoHideAsync();
SplashScreen.hideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });
  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);
  if (!fontsLoaded && !error) return null;
  return (
    <AuthProvider>
      <RestaurantProvider>
        <ItemProvider>
          <ReviewProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />

              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </ReviewProvider>
        </ItemProvider>
      </RestaurantProvider>
    </AuthProvider>
  );
};

export default RootLayout;
