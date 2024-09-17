import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createContext, useEffect, useState } from "react";

//context
const AuthContext = createContext();

//provider
const AuthProvider = ({ children }) => {
  //global State
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({
    restaurant: undefined,
    token: "",
  });
  const [item, setItem] = useState([]);

  //SET INITIAL AXIOS URL
  // axios.defaults.baseURL = "https://orderup-zfum.onrender.com/api/";
  // axios.defaults.baseURL = "http://192.168.42.35:8080/api";
  axios.defaults.baseURL = "http://192.168.100.51:8080/api";
  //GET initial storage data
  useEffect(() => {
    const loadLocalStorageData = async () => {
      let data = await AsyncStorage.getItem("@resAuth");
      let loginData = JSON.parse(data);
      setState({
        ...loginData,
        restaurant: loginData?.restaurant,
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
      await AsyncStorage.setItem("@resAuth", JSON.stringify(state));
      console.log("STATE UPDATED => ", state);
    };
    updateStorage();
  }, [state]);
  return (
    <AuthContext.Provider
      value={{ state, setState, loading, setLoading, item, setItem }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
