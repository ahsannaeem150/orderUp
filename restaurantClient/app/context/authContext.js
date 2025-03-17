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
  const ip = "192.168.43.64";
  const API_URL = `http://${ip}:8080/api`;
  axios.defaults.baseURL = API_URL;

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const initializeSocket = async () => {
      if (state.token) {
        const newSocket = io(`http://${ip}:8080/restaurant`, {
          auth: {
            token: state.token,
          },
          transports: ["websocket"],
          reconnection: true,
          reconnectionAttempts: 5,
        });

        newSocket.on("connect_error", (err) => {
          console.log("Socket connection error:", err.message);
        });
        setSocket(newSocket);
      }
    };

    if (state.token) {
      initializeSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [state.token]);

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
      value={{
        state,
        setState,
        loading,
        setLoading,
        item,
        setItem,
        socket,
        API_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
