import {createContext, useContext, useState} from "react";
import {AuthContext} from "./authContext";

const CartContext = createContext();

export const CartProvider = ({children}) => {
    const {cart, setCart} = useContext(AuthContext)

    const addToCart = (currentItem, currentRestaurant, quantity = 1) => {
        if (!currentItem || !currentRestaurant) return;

        const newCartItem = {
            _id: currentItem._id,
            name: currentItem.name,
            image: currentItem.image,
            price: currentItem.price,
            quantity: quantity,
        };

        const restaurantCartItem = {
            restaurant: {
                _id: currentRestaurant._id,
                name: currentRestaurant.name,
                logo: currentRestaurant.logo,
                phone: currentRestaurant.phone,
            },
            order: [newCartItem],
        };

        setCart((prevCart) => {
            const existingRestaurantIndex = (prevCart || []).findIndex(
                (item) => item.restaurant._id === currentRestaurant._id
            );

            if (existingRestaurantIndex === -1) {
                return [...(prevCart || []), restaurantCartItem];
            }

            const updatedCart = [...(prevCart || [])];
            const existingItemIndex = updatedCart[existingRestaurantIndex].order
                .findIndex((item) => item._id === currentItem._id);

            if (existingItemIndex === -1) {
                updatedCart[existingRestaurantIndex].order.push(newCartItem);
            } else {
                updatedCart[existingRestaurantIndex].order[existingItemIndex].quantity
                    += quantity;
            }

            return updatedCart;
        });
    };

    const getItemQuantityInCart = (itemID, restaurantID) => {
        const restaurantCart = cart.find(r => r.restaurant._id === restaurantID);
        if (!restaurantCart) return 0;

        const cartItem = restaurantCart.order.find(i => i._id === itemID);
        return cartItem ? cartItem.quantity : 0;
    };

    return (
        <CartContext.Provider
            value={{addToCart, getItemQuantityInCart}}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
