import { View, Text } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import CustomButton from "./components/CustomButtons";
import { router } from "expo-router";
import { AuthContext } from "./context/authContext";
import SplashScreen from "./components/SplashScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

const App = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const { loading, setLoading } = useContext(AuthContext);
  const { state, setState } = useContext(AuthContext);
  useEffect(() => {
    async function prepare() {
      try {
        console.log("State =>", state, "Loading=>", loading);
        // delay for two seconds to simulate a slow loading
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        if (!loading && state.user !== undefined) {
          router.replace("./home");
        }
        if (!loading && state.user === undefined) {
          router.replace("./sign-in");
        }
      }
    }
    prepare();
  }, [state, loading]);

  return <SplashScreen />;
};

export default App;
