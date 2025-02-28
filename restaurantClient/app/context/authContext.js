import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import io from "socket.io-client";

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
  const url = "192.168.100.51";
  axios.defaults.baseURL = `http://${url}:8080/api`;

  const socket = io(`http://${url}:8080/restaurant`, {
    auth: {
      token: state.token,
    },
    transports: ["websocket"],
  });

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
      value={{ state, setState, loading, setLoading, item, setItem, socket }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
