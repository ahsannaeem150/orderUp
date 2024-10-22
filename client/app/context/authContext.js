import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createContext, useEffect, useState, useRef } from "react";
import { AppState } from "react-native";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [restaurant, setRestaurant] = useState({ restaurant: undefined });
  const [item, setItem] = useState({ item: undefined });
  const [cart, setCart] = useState(null);
  const [activeOrders, setActiveOrders] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({
    user: undefined,
    token: "",
  });

  const appState = useRef(AppState.currentState); // track app state

  axios.defaults.baseURL = "http://192.168.100.51:8080/api";

  //LOAD STATE INFO
  useEffect(() => {
    const loadLocalStateData = async () => {
      let data = await AsyncStorage.getItem("@auth");
      let loginData = JSON.parse(data);
      setState({
        ...loginData,
        user: loginData?.user,
        token: loginData?.token,
      });
      console.log("TOKEN", loginData?.token);
      setLoading(false);
    };
    loadLocalStateData();
  }, []);

  const setCartInAsyncStorage = async () => {
    const restaurantsInCart = [];

    for (const orderItem of cart) {
      await AsyncStorage.setItem(
        `@cart_${orderItem.restaurant._id}`,
        JSON.stringify(orderItem)
      );

      if (!restaurantsInCart.includes(orderItem.restaurant._id)) {
        restaurantsInCart.push(orderItem.restaurant._id);
      }
    }

    // Store the restaurant list in AsyncStorage
    await AsyncStorage.setItem(
      "@restaurantsInCartList",
      JSON.stringify(restaurantsInCart)
    );
  };

  const getCartFromAsyncStorage = async () => {
    let restaurantsInCartString = await AsyncStorage.getItem(
      "@restaurantsInCartList"
    );
    let restaurantsInCartJson = JSON.parse(restaurantsInCartString);
    if (restaurantsInCartJson) {
      restaurantsInCartJson.map(async (restaurantId) => {
        orderItemString = await AsyncStorage.getItem(`@cart_${restaurantId}`);
        orderItemJson = JSON.parse(orderItemString);
        setCart((prev) => {
          if (prev) {
            return [...prev, orderItemJson];
          }
          return [orderItemJson];
        });
      });
    }
  };

  //LOAD CART INFO
  useEffect(() => {
    getCartFromAsyncStorage();
  }, []);

  const updateCart = async (cart) => {
    try {
      if (cart) {
        await AsyncStorage.setItem("@cart", JSON.stringify(cart));
        console.log("CART STORED IN ASYNCSTORAGE");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  const handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      console.log(appState.current);
      console.log("App has come to the foreground");
    }

    if (nextAppState === "background") {
      console.log("App is going to the background");
      if (cart !== null && state.token) {
        updateCart(cart);
        setCartInAsyncStorage();
      } else {
        console.warn("Cart is null, skipping AsyncStorage update");
      }
    }
    appState.current = nextAppState;
  };

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [cart]);

  const updateState = async (state) => {
    try {
      await AsyncStorage.setItem("@auth", JSON.stringify(state));
      console.log("STATE UPDATED:", state);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        setState,
        loading,
        restaurant,
        setRestaurant,
        setLoading,
        item,
        setItem,
        cart,
        setCart,
        checkout,
        setCheckout,
        activeOrders,
        setActiveOrders,
        updateCart,
        updateState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
