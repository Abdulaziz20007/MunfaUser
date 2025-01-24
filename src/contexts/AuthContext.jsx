import { createContext, useContext, useState, useEffect } from "react";
import Login from "../components/Login";
import Profile from "../components/Profile";
import { config } from "../config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsAuthenticated(true);
      // You can decode the token to get user info if needed
      // Or make an API call to get user details
    }
  }, []);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  const login = (token) => {
    localStorage.setItem("accessToken", token);
    setIsAuthenticated(true);
    closeLoginModal();
  };

  const logout = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/user/logout`, {
        method: "POST",
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
        openProfileModal,
        login,
        logout,
      }}
    >
      {children}
      <Login
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onLogin={login}
      />
      <Profile isOpen={isProfileModalOpen} onClose={closeProfileModal} />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
