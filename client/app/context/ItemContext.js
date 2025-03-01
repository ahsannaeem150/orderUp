// contexts/ItemContext.js
import { createContext, useContext, useState } from "react";

const ItemContext = createContext();

export const ItemProvider = ({ children }) => {
  const [itemsCache, setItemsCache] = useState({});

  const getItem = (id) => itemsCache[id] || null;

  const cacheItems = (items) => {
    setItemsCache((prev) => {
      const newCache = { ...prev };
      items.forEach((item) => {
        newCache[item._id] = item;
      });
      return newCache;
    });
  };

  return (
    <ItemContext.Provider value={{ getItem, cacheItems, itemsCache }}>
      {children}
    </ItemContext.Provider>
  );
};

export const useItems = () => useContext(ItemContext);
