import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Bottombar from "./components/Bottombar";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              {/* Add more routes as needed */}
            </Routes>
            <Bottombar />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
