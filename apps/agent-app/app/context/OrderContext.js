import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { AuthContext } from "./authContext";

const AgentOrdersContext = createContext();

export const AgentOrdersProvider = ({ children }) => {
  const { state, socket } = useContext(AuthContext);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignedOrders = async () => {
    try {
      const response = await axios.get(`/agent/${state.agent?._id}/orders`);
      setAssignedOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching assigned orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.agent?._id) {
      fetchAssignedOrders();
    }
  }, [state.agent?._id]);

  const addOrder = useCallback((order) => {
    setAssignedOrders((prev) => {
      const exists = prev.some((o) => o._id === order._id);
      return exists ? prev : [...prev, order];
    });
  }, []);

  return (
    <AgentOrdersContext.Provider
      value={{ assignedOrders, loading, setAssignedOrders, addOrder }}
    >
      {children}
    </AgentOrdersContext.Provider>
  );
};

export const useAgentOrders = () => useContext(AgentOrdersContext);
