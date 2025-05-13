import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createContext, useEffect, useState, useRef } from "react";
import { AppState } from "react-native";
import { io } from "socket.io-client";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({
    agent: undefined,
    token: "",
  });

  const ip = "192.168.100.51";
  // const API_URL = `https://orderup-server.onrender.com/api`;
  const API_URL = `http://${ip}:8080/api`;
  axios.defaults.baseURL = API_URL;
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const initializeSocket = async () => {
      if (state.token) {
        const newSocket = io(`http://${ip}:8080/agent`, {
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

  useEffect(() => {
    if (state?.agent && socket) {
      socket.emit("join-agent-room", state?.agent?._id);
    }
  }, [socket, state]);

  //LOAD STATE INFO
  useEffect(() => {
    const loadLocalStateData = async () => {
      let data = await AsyncStorage.getItem("@auth");
      let loginData = JSON.parse(data);
      setState({
        ...loginData,
        agent: loginData?.agent,
        token: loginData?.token,
      });
      console.log("TOKEN", loginData?.token);
      setLoading(false);
    };
    loadLocalStateData();
  }, []);

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
        setLoading,
        updateState,
        socket,
        API_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
