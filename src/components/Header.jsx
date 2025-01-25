import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const { isAuthenticated, openLoginModal, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <Link to="/" className="logo">
            Munfa
          </Link>

          {isAuthenticated ? (
            <div className="auth-buttons">
              <button
                onClick={() => navigate("/profile")}
                className="auth-button"
              >
                Profil
              </button>
              <button onClick={logout} className="auth-button">
                Chiqish
              </button>
            </div>
          ) : (
            <button onClick={openLoginModal} className="auth-button">
              Kirish
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
