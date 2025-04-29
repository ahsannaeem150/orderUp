import { View, Text } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import { AuthContext } from "./context/authContext";
import SplashScreen from "./components/SplashScreen";

const App = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const { loading, setLoading } = useContext(AuthContext);
  const { state, setState } = useContext(AuthContext);
  useEffect(() => {
    async function prepare() {
      try {
        console.log("State =>", state, "Loading=>", loading);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        if (!loading && state.agent !== undefined) {
          router.replace("(home)");
        }
        if (!loading && state.agent === undefined) {
          router.replace("./sign-in");
        }
      }
    }
    prepare();
  }, [state, loading]);

  return <SplashScreen />;
};

export default App;
