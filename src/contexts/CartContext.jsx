import { createContext, useContext, useState, useEffect } from "react";
import { config } from "../config";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const refreshStockQuantities = async () => {
    if (cart.length === 0) return;

    try {
      const response = await fetch(`${config.apiUrl}/product/ids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: cart.map((item) => item._id),
        }),
      });

      if (!response.ok) return;

      const products = await response.json();

      // Update cart items with new stock quantities
      setCart((prevCart) => {
        const updatedCart = prevCart.map((cartItem) => {
          const product = products.find((p) => p._id === cartItem._id);
          if (product) {
            return {
              ...cartItem,
              stock: product.stock,
            };
          }
          return cartItem;
        });

        localStorage.setItem("cart", JSON.stringify(updatedCart));
        return updatedCart;
      });
    } catch (error) {
      console.error("Error refreshing stock quantities:", error);
    }
  };

  // Refresh stock quantities every minute and when cart changes
  useEffect(() => {
    refreshStockQuantities();

    const interval = setInterval(refreshStockQuantities, 60000);

    return () => clearInterval(interval);
  }, [cart.length]); // Only re-run when number of items in cart changes

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);

      let newCart;
      if (existingItem) {
        newCart = prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...prevCart, { ...product, quantity: 1 }];
      }

      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setCart((prevCart) => {
      const newCart = prevCart.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item._id !== productId);
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshStockQuantities, // Expose this if you need to manually refresh
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
