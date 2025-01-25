import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Bottombar from "./components/bottombar";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import Product from "./components/Product";
import ProfilePage from "./pages/ProfilePage";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { AppProvider } from "./contexts/AppContext";

const App = () => {
  return (
    <AppProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                {/* Add more routes as needed */}
              </Routes>
              <Bottombar />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </AppProvider>
  );
};

export default App;
