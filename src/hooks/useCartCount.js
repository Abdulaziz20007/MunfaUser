import { useState, useEffect } from "react";

export const useCartCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCount(totalItems);
    };

    // Initial count
    updateCount();

    // Listen for storage changes
    window.addEventListener("storage", updateCount);

    // Custom event for cart updates
    window.addEventListener("cartUpdated", updateCount);

    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("cartUpdated", updateCount);
    };
  }, []);

  return count;
};
