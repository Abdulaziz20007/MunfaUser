import { createContext, useContext, useState, useEffect } from "react";
import Login from "../components/Login";
import { config } from "../config";
import { AppContext } from "./AppContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Get showAlert from App context
  const { showAlert } = useContext(AppContext);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const login = (token) => {
    localStorage.setItem("accessToken", token);
    setIsAuthenticated(true);
    closeLoginModal();
  };

  const logout = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/user/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        localStorage.removeItem("accessToken");
        setIsAuthenticated(false);
        setUser(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        openLoginModal,
        login,
        logout,
      }}
    >
      {children}
      <Login
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onLogin={login}
        showAlert={showAlert}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
