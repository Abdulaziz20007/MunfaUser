import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useApp } from "../contexts/AppContext";
import { config } from "../config";
import { fetchWithAuth } from "../utils/auth";

const Checkout = () => {
  const { isAuthenticated, openLoginModal } = useAuth();
  const { cart, clearCart } = useCart();
  const { showAlert } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");

  if (!isAuthenticated) {
    return (
      <div className="checkout-container">
        <div className="auth-required">
          <h2>Buyurtma berish uchun tizimga kiring</h2>
          <p>Davom etish uchun tizimga kirishingiz kerak</p>
          <button onClick={openLoginModal} className="modal-button">
            Tizimga kirish
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-checkout">
          <h2>Savat bo'sh</h2>
          <p>Buyurtma berish uchun mahsulotlar tanlang</p>
          <button onClick={() => navigate("/")} className="modal-button">
            Mahsulotlarni ko'rish
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetchWithAuth(`${config.apiUrl}/user/order`, {
        method: "POST",
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item._id,
            quantity: item.quantity,
          })),
          address: address.trim(),
          comment: comment.trim(),
          total: cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        }),
      });

      const data = await response.json();

      // Check for error first
      if (data.msg && data.msg.includes("yetarli miqdor mavjud emas")) {
        showAlert(data.msg, "error");
        setError(data.msg);
        return;
      }

      // Then check response status
      if (!response.ok) {
        showAlert(data.msg || "Xatolik yuz berdi", "error");
        setError(data.msg || "Xatolik yuz berdi");
        return;
      }

      console.log(data);

      // Only if no errors and response is ok
      clearCart();
      showAlert("Buyurtma muvaffaqiyatli joylandi", "success");
      navigate("/profile");
    } catch (err) {
      showAlert("Xatolik yuz berdi", "error");
      setError("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h2 className="section-title">Buyurtma berish</h2>

      <div className="checkout-content">
        <div className="order-summary">
          <h3>Buyurtma tafsilotlari</h3>
          <div className="order-items">
            {cart.map((item) => (
              <div key={item._id} className="order-item">
                <div className="order-item-image">
                  <img
                    src={`${config.baseUrl}/${item.image}`}
                    alt={item.name}
                  />
                </div>
                <div className="order-item-details">
                  <h4>{item.name}</h4>
                  <div className="order-item-meta">
                    <span className="order-item-price">
                      {item.price.toLocaleString()} so'm
                    </span>
                    <span className="order-item-quantity">
                      x {item.quantity}
                    </span>
                  </div>
                </div>
                <div className="order-item-total">
                  {(item.price * item.quantity).toLocaleString()} so'm
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <span>Jami:</span>
            <span>{totalAmount.toLocaleString()} so'm</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Manzil</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Yetkazib berish manzilini kiriting"
              required
              className="modal-input"
            />
          </div>

          <div className="form-group">
            <label>Izoh</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Qo'shimcha ma'lumotlar"
              className="modal-input comment"
            />
          </div>

          <button type="submit" className="modal-button" disabled={loading}>
            {loading ? "Yuborilmoqda..." : "Buyurtma berish"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
