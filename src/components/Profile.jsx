import { useState, useEffect } from "react";
import { config } from "../config";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";

const Profile = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          fetchUserData(decoded.id, token);
        } catch (err) {
          console.error("Token decode error:", err);
          setError("Token xatosi");
        }
      }
    }
  }, [isOpen]);

  const fetchUserData = async (userId, token) => {
    try {
      const response = await fetch(`${config.apiUrl}/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
        setName(data.name || "");
        setSurname(data.surname || "");
        setError("");
      } else {
        setError(data.msg);
      }
    } catch (err) {
      setError("Xatolik yuz berdi");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${config.apiUrl}/user/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, surname }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser((prev) => ({ ...prev, name, surname }));
        setIsEditModalOpen(false);
        setError("");
      } else {
        setError(data.msg);
      }
    } catch (err) {
      setError("Xatolik yuz berdi");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${config.apiUrl}/user/change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: user.phone,
          oldPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsPasswordModalOpen(false);
        setOldPassword("");
        setNewPassword("");
        setError("");
      } else {
        setError(data.msg);
      }
    } catch (err) {
      setError("Xatolik yuz berdi");
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content profile-modal">
        <button onClick={onClose} className="modal-close">
          ✕
        </button>

        <h2 className="modal-title">Profil</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="profile-info">
          <div className="profile-field">
            <label>Telefon raqam</label>
            <p>{user.phone}</p>
          </div>
          <div className="profile-field">
            <label>Ism</label>
            <p>{user.name || "Kiritilmagan"}</p>
          </div>
          <div className="profile-field">
            <label>Familiya</label>
            <p>{user.surname || "Kiritilmagan"}</p>
          </div>
        </div>

        <div className="profile-actions">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="modal-button primary-button"
          >
            Ma'lumotlarni o'zgartirish
          </button>
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="modal-button secondary-button"
          >
            Parolni o'zgartirish
          </button>
        </div>

        {isEditModalOpen && (
          <div className="edit-modal">
            <div className="edit-modal-content">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="modal-close"
              >
                ✕
              </button>

              <h3 className="modal-title">Ma'lumotlarni o'zgartirish</h3>

              <form onSubmit={handleUpdate} className="profile-form">
                <div className="form-group">
                  <label>Ism</label>
                  <input
                    type="text"
                    placeholder="Ismingizni kiriting"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="modal-input"
                    required
                    minLength={3}
                  />
                </div>
                <div className="form-group">
                  <label>Familiya</label>
                  <input
                    type="text"
                    placeholder="Familiyangizni kiriting"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="modal-input"
                    required
                    minLength={3}
                  />
                </div>
                <button type="submit" className="modal-button">
                  Saqlash
                </button>
              </form>
            </div>
          </div>
        )}

        {isPasswordModalOpen && (
          <div className="edit-modal">
            <div className="edit-modal-content">
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="modal-close"
              >
                ✕
              </button>

              <h3 className="modal-title">Parolni o'zgartirish</h3>

              <form onSubmit={handlePasswordChange} className="profile-form">
                <div className="form-group">
                  <label>Joriy parol</label>
                  <input
                    type="password"
                    placeholder="Joriy parolingizni kiriting"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="modal-input"
                    required
                    minLength={4}
                  />
                </div>
                <div className="form-group">
                  <label>Yangi parol</label>
                  <input
                    type="password"
                    placeholder="Yangi parolni kiriting"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="modal-input"
                    required
                    minLength={4}
                  />
                </div>
                <button type="submit" className="modal-button">
                  Saqlash
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Profile.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Profile;
