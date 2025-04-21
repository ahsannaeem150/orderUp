import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {createContext, useEffect, useState, useRef} from "react";
import {AppState} from "react-native";
import {io} from "socket.io-client"; // For real-time updates

const AuthContext = createContext();

const AuthProvider = ({children}) => {
    const [restaurant, setRestaurant] = useState({restaurant: undefined});
    const [item, setItem] = useState({item: undefined});
    const [cart, setCart] = useState([]);
    const [activeOrders, setActiveOrders] = useState(null);
    const [loading, setLoading] = useState(true);
    const [state, setState] = useState({
        user: undefined,
        token: "",
    });

    const appState = useRef(AppState.currentState);

    const ip = "192.168.100.51";
    const API_URL = `http://${ip}:8080/api`;
    axios.defaults.baseURL = API_URL;
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const initializeSocket = async () => {
            if (state.token) {
                const newSocket = io(`http://${ip}:8080/user`, {
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

    // reusable function to store cart and activeorders in async storage
    const setAttributeInAsyncStorage = async (
        collection,
        collectionName,
        collectionListName
    ) => {
        //cart , "cart" , "restaurantsInCartList"
        const restaurantsInCollection = [];

        for (const orderItem of collection) {
            await AsyncStorage.setItem(
                `@${collectionName}_${orderItem.restaurant._id}`,
                JSON.stringify(orderItem)
            );

            if (!restaurantsInCollection.includes(orderItem.restaurant._id)) {
                restaurantsInCollection.push(orderItem.restaurant._id);
            }
        }

        // Store the restaurant list in AsyncStorage
        await AsyncStorage.setItem(
            `@${collectionListName}`,
            JSON.stringify(restaurantsInCollection)
        );
    };

    const getAttributeFromAsyncStorage = async (
        setCollection,
        collectionName,
        collectionListName
    ) => {
        //setCart , "cart" , "restaurantsInCartList"
        let restaurantsInCollectionString = await AsyncStorage.getItem(
            `@${collectionListName}`
        );
        let restaurantsInCollectionJson = JSON.parse(restaurantsInCollectionString);
        if (restaurantsInCollectionJson) {
            restaurantsInCollectionJson.map(async (restaurantId) => {
                orderItemString = await AsyncStorage.getItem(
                    `@${collectionName}_${restaurantId}`
                );
                orderItemJson = JSON.parse(orderItemString);
                setCollection((prev) => {
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
        getAttributeFromAsyncStorage(setCart, "cart", "restaurantsInCartList");
        getAttributeFromAsyncStorage(
            setActiveOrders,
            "activeOrders",
            "restaurantsInActiveOrdersList"
        );
    }, []);

    const updateStorageAttribute = async (data, key) => {
        try {
            if (data) {
                await AsyncStorage.setItem(`@${key}`, JSON.stringify(data));
                console.log(`${key} STORED IN ASYNCSTORAGE`);
            }
        } catch (error) {
            console.error(`Error updating ${key}:`, error);
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
            if (state.token) {
                //if user Logged In
                if (activeOrders) {
                    console.log("Setting Active Index");
                    setAttributeInAsyncStorage(
                        [],
                        "activeOrders",
                        "restaurantsInActiveOrdersList"
                    );
                }
                if (cart) {
                    console.log("Setting Cart");
                    setAttributeInAsyncStorage(cart, "cart", "restaurantsInCartList");
                }
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
                activeOrders,
                setActiveOrders,
                updateState,
                socket,
                API_URL,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export {AuthContext, AuthProvider};
