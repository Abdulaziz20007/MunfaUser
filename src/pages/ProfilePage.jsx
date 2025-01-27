import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";
import { config } from "../config";
import { fetchWithAuth } from "../utils/auth";
import Header from "../components/Header";
import Profile from "../components/Profile";
import EditOrderModal from "../components/EditOrderModal";

const ProfilePage = () => {
  const { isAuthenticated, logout } = useAuth();
  const { showAlert } = useApp();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("orders"); // orders, info
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    surname: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [orderForm, setOrderForm] = useState({
    comment: "",
    address: "",
  });

  const fetchOrders = async () => {
    try {
      const response = await fetchWithAuth(`${config.apiUrl}/user/order`);
      const data = await response.json();
      if (response.ok) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const handleCancelOrder = async (orderNumber) => {
    showAlert({
      message: "Buyurtmani bekor qilishni xohlaysizmi?",
      type: "confirm",
      onConfirm: async () => {
        try {
          const response = await fetchWithAuth(
            `${config.apiUrl}/user/order/${orderNumber}/cancel`,
            {
              method: "PUT",
            }
          );

          if (response.ok) {
            showAlert({
              message: "Buyurtma bekor qilindi",
              type: "success",
            });
            // Refresh orders after cancellation
            fetchOrders();
          } else {
            const data = await response.json();
            showAlert(data.msg || "Xatolik yuz berdi", "error");
          }
        } catch (err) {
          console.error("Error cancelling order:", err);
          showAlert("Xatolik yuz berdi", "error");
        }
      },
    });
  };

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const handleEdit = () => {
    setEditForm({
      name: user.name,
      surname: user.surname,
    });
    setIsEditModalOpen(true);
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditForm({
      name: user.name,
      surname: user.surname,
    });
    setEditingOrder(null);
    setOrderForm({ comment: "", address: "" });
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetchWithAuth(`${config.apiUrl}/user/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          surname: editForm.surname,
        }),
      });

      if (response.ok) {
        setUser((prev) => ({
          ...prev,
          name: editForm.name,
          surname: editForm.surname,
        }));
        setIsEditModalOpen(false);
        showAlert({
          message: "Ma'lumotlar muvaffaqiyatli yangilandi",
          type: "success",
        });
      } else {
        const data = await response.json();
        showAlert(data.msg || "Xatolik yuz berdi", "error");
      }
    } catch (err) {
      showAlert("Xatolik yuz berdi", "error");
    }
  };

  const handlePasswordModalOpen = () => {
    setPasswordForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsPasswordModalOpen(true);
  };

  const handlePasswordModalClose = () => {
    setIsPasswordModalOpen(false);
    setPasswordForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handlePasswordSubmit = async () => {
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showAlert({
        message: "Yangi parollar mos kelmadi",
        type: "error",
      });
      return;
    }

    if (passwordForm.newPassword.length < 4) {
      showAlert({
        message: "Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak",
        type: "error",
      });
      return;
    }

    try {
      const response = await fetchWithAuth(`${config.apiUrl}/user/change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: user.phone,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        setIsPasswordModalOpen(false);
        showAlert({
          message: "Parol muvaffaqiyatli o'zgartirildi",
          type: "success",
        });
      } else {
        const data = await response.json();
        showAlert(data.msg || "Xatolik yuz berdi", "error");
      }
    } catch (err) {
      showAlert("Xatolik yuz berdi", "error");
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
  };

  const handleEditSuccess = () => {
    fetchOrders();
    showAlert("Buyurtma muvaffaqiyatli yangilandi", "success");
  };

  // Helper function to check if order is editable
  const isOrderEditable = (status) => {
    return status === "pending";
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userResponse = await fetchWithAuth(`${config.apiUrl}/user/me`);
        const userData = await userResponse.json();

        if (userResponse.ok) {
          setUser(userData);
        } else {
          // If token is invalid, redirect to home
          localStorage.removeItem("accessToken");
          navigate("/");
          return;
        }

        const ordersResponse = await fetchWithAuth(
          `${config.apiUrl}/user/order`
        );
        const ordersData = await ordersResponse.json();

        if (ordersResponse.ok) {
          setOrders(ordersData);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        // On error, redirect to home
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="main-container">
        <Header />
        <div className="loading-indicator">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <Header />
      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-info">
            <div className="profile-avatar">
              {capitalizeFirstLetter(user?.name)?.charAt(0)}
              {capitalizeFirstLetter(user?.surname)?.charAt(0)}
            </div>
            <div className="profile-details">
              <h1>
                {`${capitalizeFirstLetter(user?.name)} ${capitalizeFirstLetter(
                  user?.surname
                )}`}
              </h1>
              <p>{`+998 ${user?.phone}`}</p>
            </div>
          </div>
          <button onClick={logout} className="logout-button">
            Chiqish
          </button>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Buyurtmalarim
          </button>
          <button
            className={`tab-button ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            Ma'lumotlarim
          </button>
        </div>

        {activeTab === "orders" ? (
          <div className="orders-section">
            {!orders || orders.length === 0 ? (
              <div className="empty-orders">
                <h2>Hech narsa yo'q</h2>
                <p>Siz hali hech narsa buyurtma qilmadingiz</p>
                <button onClick={() => navigate("/")} className="browse-button">
                  Mahsulotlarni ko'rish
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {orders
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((order) => (
                  <div key={order._id} className="order-card">
                    <div
                      className="order-header"
                      onClick={() => toggleOrder(order._id)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="order-meta">
                        <span className="order-number">
                          #{order.orderNumber}
                        </span>
                        <span className="order-date">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`order-status ${order.status}`}>
                          {order.status === "pending" && "Kutilmoqda"}
                          {order.status === "sold" && "Muvaffaqiyatli"}
                          {order.status === "cancelled by user" &&
                            "Bekor qilindi"}
                          {order.status === "cancelled by admin" &&
                            "Admin tomonidan bekor qilindi"}
                        </span>
                      </div>
                      <div className="order-actions">
                        <span className="order-total">
                          {order.total.toLocaleString()} so'm
                        </span>
                        <svg
                          className={`expand-icon ${
                            expandedOrders.has(order._id) ? "expanded" : ""
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5 7.5L10 12.5L15 7.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>

                    {expandedOrders.has(order._id) && (
                      <>
                        <div className="order-items">
                          {order.products.map((item) => (
                            <div key={item._id} className="order-item">
                              <div className="item-image">
                                <img
                                  style={{
                                    position: "static",
                                  }}
                                  src={`${config.baseUrl}/${item.product.images[0]}`}
                                  alt={item.product.name}
                                  className="product-image"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/placeholder-product.png";
                                  }}
                                />
                              </div>
                              <div className="item-details">
                                <h3>{item.product.name}</h3>
                                <div className="item-meta">
                                  <span>{item.quantity} dona</span>
                                  <span>
                                    {item.priceAtOrder.toLocaleString()} so'm
                                  </span>
                                  {item.product.size && (
                                    <span>O'lcham: {item.product.size}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="order-details">
                          {editingOrder === order._id ? (
                            <div className="edit-form">
                              <div className="form-group">
                                <label className="form-label">Izoh</label>
                                <textarea
                                  value={orderForm.comment}
                                  onChange={(e) =>
                                    setOrderForm((prev) => ({
                                      ...prev,
                                      comment: e.target.value,
                                    }))
                                  }
                                  className="modal-input"
                                  placeholder="Izoh qoldiring"
                                />
                              </div>
                              <div className="form-group">
                                <label className="form-label">Manzil *</label>
                                <textarea
                                  value={orderForm.address}
                                  onChange={(e) =>
                                    setOrderForm((prev) => ({
                                      ...prev,
                                      address: e.target.value,
                                    }))
                                  }
                                  className="modal-input"
                                  placeholder="Manzilni kiriting"
                                  required
                                />
                              </div>
                              <div className="modal-actions">
                                <button
                                  onClick={() => handleUpdateOrder(order._id)}
                                  className="modal-button"
                                >
                                  Saqlash
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="modal-button secondary"
                                >
                                  Bekor qilish
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {order.comment && (
                                <div className="order-comment">
                                  <strong>Izoh:</strong> {order.comment}
                                </div>
                              )}
                              <div className="order-address">
                                <strong>Manzil:</strong> {order.address}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="order-actions">
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="edit-button"
                            disabled={!isOrderEditable(order.status)}
                            title={
                              !isOrderEditable(order.status)
                                ? "Faqat kutilayotgan buyurtmalarni tahrirlash mumkin"
                                : ""
                            }
                          >
                            O'zgartirish
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order.orderNumber)}
                            className="cancel-button"
                            disabled={!isOrderEditable(order.status)}
                            title={
                              !isOrderEditable(order.status)
                                ? "Faqat kutilayotgan buyurtmalarni bekor qilish mumkin"
                                : ""
                            }
                          >
                            Bekor qilish
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="info-section">
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">Ism:</span>
                <span className="info-value">{user?.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Familiya:</span>
                <span className="info-value">{user?.surname}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Telefon:</span>
                <span className="info-value">{`+998 ${user?.phone}`}</span>
              </div>
              <div className="info-actions">
                <button onClick={handleEdit} className="edit-button">
                  Tahrirlash
                </button>
                <button
                  onClick={handlePasswordModalOpen}
                  className="edit-button"
                >
                  Parolni o'zgartirish
                </button>
              </div>
            </div>
          </div>
        )}

        {isEditModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button onClick={handleCancelEdit} className="modal-close">
                ✕
              </button>
              <h2 className="modal-title">Ma'lumotlarni tahrirlash</h2>
              <div className="edit-form">
                <div className="form-group">
                  <label className="form-label">Ism</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Ismingizni kiriting"
                    className="modal-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Familiya</label>
                  <input
                    type="text"
                    value={editForm.surname}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        surname: e.target.value,
                      }))
                    }
                    placeholder="Familiyangizni kiriting"
                    className="modal-input"
                  />
                </div>
                <div className="modal-actions">
                  <button onClick={handleSaveEdit} className="modal-button">
                    Saqlash
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="modal-button secondary"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isPasswordModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button
                onClick={handlePasswordModalClose}
                className="modal-close"
              >
                ✕
              </button>
              <h2 className="modal-title">Parolni o'zgartirish</h2>
              <div className="edit-form">
                <div className="form-group">
                  <label className="form-label">Joriy parol</label>
                  <input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        oldPassword: e.target.value,
                      }))
                    }
                    placeholder="Joriy parolingizni kiriting"
                    className="modal-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Yangi parol</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Yangi parolni kiriting"
                    className="modal-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Yangi parolni tasdiqlang</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Yangi parolni qayta kiriting"
                    className="modal-input"
                  />
                </div>
                <div className="modal-actions">
                  <button
                    onClick={handlePasswordSubmit}
                    className="modal-button"
                  >
                    Saqlash
                  </button>
                  <button
                    onClick={handlePasswordModalClose}
                    className="modal-button secondary"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {editingOrder && (
          <EditOrderModal
            order={editingOrder}
            onClose={() => setEditingOrder(null)}
            onSuccess={handleEditSuccess}
          />
        )}
      </div>
      <Profile
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdate={handleUserUpdate}
      />
    </div>
  );
};

export default ProfilePage;
