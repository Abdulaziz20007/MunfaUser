import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Bottombar from "./components/bottombar";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import Product from "./components/Product";
import ProfilePage from "./pages/ProfilePage";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { AppProvider } from "./contexts/AppContext";
import { useEffect } from "react";

const App = () => {
  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      const webapp = window.Telegram.WebApp;

      // Basic initialization
      webapp.ready();
      webapp.expand();

      // Set theme based on Telegram theme
      if (webapp.colorScheme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
      }

      // Only try to use fullscreen if the version supports it
      try {
        if (webapp.isVersionAtLeast("6.2")) {
          webapp.requestFullscreen();

          // Handle fullscreen changes
          webapp.onEvent("fullscreenChanged", () => {
            if (!webapp.isFullscreen && webapp.isVersionAtLeast("6.2")) {
              webapp.requestFullscreen();
            }
          });
        }
      } catch (error) {
        console.log("Fullscreen mode not supported in this environment");
      }
    }
  }, []);

  return (
    <AppProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
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
