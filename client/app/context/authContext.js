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
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({
    user: undefined,
    token: "",
  });

  //SET INITIAL AXIOS URL

  axios.defaults.baseURL = "https://orderup-zfum.onrender.com/api/";
  // axios.defaults.baseURL = "http://192.168.100.51:8080/api";
  //GET initial storage data
  useEffect(() => {
    const loadLocalStorageData = async () => {
      let data = await AsyncStorage.getItem("@auth");
      let loginData = JSON.parse(data);
      setState({
        ...loginData,
        user: loginData?.user,
        token: loginData?.token,
      });
      setLoading(false);
      console.log("Log in authContext state=> ", state);
      console.log("Log in authContext loading=> ", loading);
    };

    loadLocalStorageData();
  }, []);
  useEffect(() => {
    console.log("useEffect loading=> ", loading);
  }, [loading]);
  //UPDATE STORAGE INFO ON EVERY STATE CHANGE
  useEffect(() => {
    const updateStorage = async () => {
      await AsyncStorage.setItem("@auth", JSON.stringify(state));
    };
    updateStorage();
  }, [state]);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
