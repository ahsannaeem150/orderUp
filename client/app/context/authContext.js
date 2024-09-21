import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createContext, useEffect, useState } from "react";

//context
const AuthContext = createContext();

//provider
const AuthProvider = ({ children }) => {
  //global State
  const [restaurant, setRestaurant] = useState({ restaurant: undefined });
  const [item, setItem] = useState({ item: undefined });
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({
    user: undefined,
    token: "",
  });

  //SET INITIAL AXIOS URL
  // axios.defaults.baseURL = "https://orderup-zfum.onrender.com/api/";
  // axios.defaults.baseURL = "http://192.168.137.89:8080/api";
  axios.defaults.baseURL = "http://192.168.100.51:8080/api";

  //GET initial storage data
  useEffect(() => {
    const loadLocalStorageData = async () => {
      let data = await AsyncStorage.getItem("@auth");
      let cartDataString = await AsyncStorage.getItem("@cart");
      let cartJson = JSON.parse(cartDataString);
      let loginData = JSON.parse(data);
      setState({
        ...loginData,
        user: loginData?.user,
        token: loginData?.token,
      });
      console.log(cartJson);
      console.log("TOKEN", loginData?.token);
      setCart(cartJson);
      setLoading(false);
    };
    loadLocalStorageData();
  }, []);

  // const updateCart = async () => {
  //   try {
  //     console.log("CART UPDATING");
  //     await AsyncStorage.setItem("cart", JSON.stringify(cart));
  //     console.log("CART UPDATED");

  //     let cartDataString = await AsyncStorage.getItem("cart");

  //     if (cartDataString === null) {
  //       console.log("No cart data found in AsyncStorage");
  //     } else {
  //       let cartJson = JSON.parse(cartDataString);
  //       console.log("Retrieved cart:", cartJson);
  //     }
  //   } catch (error) {
  //     console.error("Error updating or retrieving cart:", error);
  //   }
  // };

  useEffect(() => {
    const updateCart = async () => {
      try {
        if (cart !== null) {
          await AsyncStorage.setItem("@cart", JSON.stringify(cart));
          console.log("CART UPDATED:", cart);
        }
      } catch (error) {
        console.error("Error updating cart:", error);
      }
    };
    updateCart();
  }, [cart]);

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
