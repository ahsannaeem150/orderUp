import React, {createContext, useContext, useState} from "react";

const ItemContext = createContext();

export const ItemProvider = ({children}) => {
    const [itemsCache, setItemsCache] = useState({});
    const [currentItem, setCurrentItem] = useState(null);
    const [reviewsCache, setReviewsCache] = useState({});
    const getReviews = (itemId) => reviewsCache[itemId] || [];

    const cacheReviews = (itemId, reviews) => {
        setReviewsCache((prev) => ({
            ...prev,
            [itemId]: reviews,
        }));
    };

    const updateItem = (item) => {
        setCurrentItem(item)
        setItemsCache(prev => ({
            ...prev,
            [item._id]: item
        }));
    }
    const cacheItems = (items) => {
        const newCache = items.reduce((acc, item) => {
            acc[item._id] = item;
            return acc;
        }, {});
        setItemsCache(prev => ({...prev, ...newCache}));
    };

    const getItem = (id) => itemsCache[id] || null;

    return (
        <ItemContext.Provider value={{
            itemsCache,
            cacheItems,
            cacheReviews,
            getReviews,
            reviewsCache,
            setReviewsCache,
            getItem,
            updateItem,
            currentItem,
            setCurrentItem
        }}>
            {children}
        </ItemContext.Provider>
    );
};

export const useItems = () => useContext(ItemContext);